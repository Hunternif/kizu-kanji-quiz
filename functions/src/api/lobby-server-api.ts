import * as logger from 'firebase-functions/logger';
import { HttpsError } from 'firebase-functions/v2/https';
import firebaseConfig from '../firebase-config.json';
import { firestore } from '../firebase-server';
import {
  GameLobby,
  PlayerInLobby,
  PlayerRole,
  defaultLobbySettings,
} from '../shared/types';
import { assertExhaustive, stringComparator } from '../shared/utils';
import { assertNotAnonymous } from './auth-api';
import { getEntriesForGame } from './entry-api';
import {
  countPlayers,
  findPlayerLobbies,
  getLobby,
  getOnlinePlayers,
  getPlayer,
  getPlayerThrows,
  getPlayers,
  getPlayersRef,
  lobbiesRef,
  updateLobby,
  updatePlayer,
} from './lobby-server-repository';
import { createNewTurn } from './turn-server-api';
import { getOrCreateQuizUser } from './user-server-api';
import { isChoiceAnswer } from '../shared/mode-utils';

/**
 * Creates a new lobby from this player, returns it.
 * Throws if maximum number of active lobbies is reached.
 */
export async function createLobby(userID: string): Promise<GameLobby> {
  // TODO: need to acquire lock. This doesn't prevent double lobby creation!
  // Only allow non-anonymous users to create lobbies:
  await assertNotAnonymous(userID);
  await assertLobbyLimit();
  const newLobbyRef = lobbiesRef.doc();
  const newID = newLobbyRef.id;
  const newLobby = new GameLobby(newID, userID, defaultLobbySettings(), 'new');
  await newLobbyRef.set(newLobby);
  logger.info(`Created new lobby by user: ${userID}`);
  return newLobby;
}

async function allowJoinAsPlayer(lobby: GameLobby): Promise<boolean> {
  const playerCount = await countPlayers(lobby.id, 'player');
  if (playerCount >= lobby.settings.max_players) return false;
  switch (lobby.status) {
    case 'new':
      return true;
    case 'starting':
      // Let them try again after the lobby has started:
      return false;
    case 'in_progress':
      return lobby.settings.allow_join_mid_game;
    case 'ended':
      return false;
    default:
      assertExhaustive(lobby.status);
      return false;
  }
}

async function allowJoinAsSpectator(lobby: GameLobby): Promise<boolean> {
  switch (lobby.status) {
    case 'new':
    case 'starting':
    case 'in_progress':
      return true;
    case 'ended':
      return false;
    default:
      assertExhaustive(lobby.status);
      return false;
  }
}

/**
 * Attempts to add player to lobby as "player",
 * or as "spectator" if the game is already in progress.
 */
export async function addPlayer(
  lobby: GameLobby,
  userID: string,
): Promise<void> {
  const quizUser = await getOrCreateQuizUser(userID);
  // Add player in a transaction so it only happens once:
  const player = await firestore.runTransaction(async (transaction) => {
    const playerRef = getPlayersRef(lobby.id).doc(userID);
    const hasAlreadyJoined = (await transaction.get(playerRef)).exists;
    if (hasAlreadyJoined) {
      // If tracking users' lobbies, could update it here.
      logger.warn(
        `User ${quizUser.name} (${userID}) re-joined lobby ${lobby.id}`,
      );
      return null;
    }
    let role: PlayerRole = 'spectator';
    if (lobby.status == 'ended') {
      throw new HttpsError('unavailable', `Lobby already ended: ${lobby.id}`);
    }
    if (await allowJoinAsPlayer(lobby)) {
      role = 'player';
    } else if (await allowJoinAsSpectator(lobby)) {
      role = 'spectator';
    } else {
      throw new HttpsError('unavailable', `Could not join lobby ${lobby.id}`);
    }
    const player = new PlayerInLobby(userID, quizUser.name, role, 'online', 0);
    transaction.set(playerRef, player);
    lobby.player_ids.add(player.uid);
    await updateLobby(lobby, transaction);
    logger.info(
      `User ${quizUser.name} (${userID}) joined lobby ${lobby.id} as ${role}`,
    );
    return player;
  });

  // Already joined, or some other invalid state:
  if (player == null) return;

  // If tracking users' lobbies, could update it here.

  // If the game has started, onboard the player here.
  // For a quiz, nothing to do though.
}

/**
 * Will attempt to change player role.
 * Can only become 'player' if player limit is not exceeded.
 */
export async function changePlayerRole(
  lobby: GameLobby,
  userID: string,
  role: PlayerRole,
): Promise<void> {
  const player = await getPlayerThrows(lobby.id, userID);
  switch (role) {
    case 'player':
      if (!(await allowJoinAsPlayer(lobby))) {
        throw new HttpsError('failed-precondition', 'Cannot join as player');
      }
      break;
    case 'spectator':
      if (!(await allowJoinAsSpectator(lobby))) {
        throw new HttpsError('failed-precondition', 'Cannot join as spectator');
      }
      break;
    default:
      assertExhaustive(role);
  }
  player.role = role;
  await updatePlayer(lobby.id, player);

  // If the game has started, onboard the player:
  if (lobby.status == 'in_progress' && player.role === 'player') {
    // For a quiz, nothing to do though.
  } else if (player.role === 'spectator') {
    cleanUpPlayer(lobby.id, player);
  }
}

/** Starts the game */
export async function startLobby(lobby: GameLobby) {
  try {
    await validateGameSettings(lobby);
    // Copy cards from all added decks into the lobby:
    await copyEntriesToLobby(lobby);
    await createNewTurn(lobby);
    // Start the game:
    lobby.status = 'in_progress';
    await updateLobby(lobby);
    logger.info(`Started lobby ${lobby.id}`);
  } catch (e: any) {
    // Revert lobby status:
    lobby.status = 'new';
    await updateLobby(lobby);
    throw e;
  }
}

/** Check and correct any settings before starting the game */
async function validateGameSettings(lobby: GameLobby) {
  const settings = lobby.settings;
  const defaults = defaultLobbySettings();
  if (isChoiceAnswer(settings.answer_mode) && settings.num_choices < 2) {
    settings.num_choices = 2;
  }
  // Maybe validate that question and answer mode should not match?
  await updateLobby(lobby);
}

/**
 * Copies game entries from all added test groups into the lobby.
 * Copies full content because the data could be edited or deleted in the future.
 * Calculating initial tag counts could go here too.
 */
async function copyEntriesToLobby(lobby: GameLobby): Promise<void> {
  lobby.questions = await getEntriesForGame(lobby.test_groups);
}

/** Sets lobby status to "ended", and performs any cleanup */
export async function endLobby(lobby: GameLobby) {
  lobby.status = 'ended';
  await updateLobby(lobby);
  logger.info(`Ended lobby ${lobby.id}`);
}

/** Unsets current_lobby_id for all players */
export async function cleanUpEndedLobby(lobbyID: string) {
  // If we keep track of player's lobbies, we could update it here.
}

/**
 * Returns a sequence of player UIDs.
 * The sequence must be stable!
 */
export async function getPlayerSequence(
  lobbyID: string,
): Promise<Array<PlayerInLobby>> {
  const players = await getOnlinePlayers(lobbyID);
  // Sort players by random_index:
  return players.sort((a, b) => stringComparator(a.uid, b.uid));
}

/** Returns the next player in the sequence after the given userID. */
export function findNextPlayer(
  sequence: Array<PlayerInLobby>,
  userID?: string,
): PlayerInLobby | null {
  if (sequence.length === 0) return null;
  const lastIndex = sequence.findIndex((p) => p.uid === userID);
  if (lastIndex === -1) return sequence[0];
  let nextIndex = lastIndex + 1;
  if (nextIndex >= sequence.length) nextIndex = 0;
  return sequence[nextIndex];
}

/** Cleanup logic to run if the player becomes unavailable. */
export async function cleanUpPlayer(lobbyID: string, player: PlayerInLobby) {
  const lobby = await getLobby(lobbyID);
  const sequence = await getPlayerSequence(lobbyID);

  // If player is already not "online", re-insert them back in the sequence:
  if (sequence.findIndex((p) => p.uid === player.uid) === -1) {
    sequence.push(player);
    sequence.sort((a, b) => stringComparator(a.uid, b.uid));
  }
  const nextPlayer = findNextPlayer(sequence, player.uid);

  if (!nextPlayer || nextPlayer.uid === player.uid) {
    // No more players, end game:
    await endLobby(lobby);
  } else {
    // Re-assign lobby creator:
    if (lobby.creator_uid === player.uid) {
      lobby.creator_uid = nextPlayer.uid;
      await updateLobby(lobby);
    }
  }
  // If tracking players' lobbies, could unset 'current lobby' here.
}

/** Called when a player loses connection, or closes the browser.
 * An automatic trigger will call the cleanup logic after this. */
export async function setPlayerOffline(userID: string) {
  const lobbyIDs = await findPlayerLobbies(userID);
  for (const lobbyID of lobbyIDs) {
    const player = await getPlayer(lobbyID, userID);
    if (player) {
      player.status = 'left';
      await updatePlayer(lobbyID, player);
    }
  }
}

/** Throws if lobby limit has been reached. */
async function assertLobbyLimit() {
  const totalActiveLobbies = (
    await lobbiesRef.where('status', 'in', ['new', 'in_progress']).count().get()
  ).data().count;
  if (totalActiveLobbies > firebaseConfig.maxActiveLobbies) {
    throw new HttpsError(
      'resource-exhausted',
      'Game limit reached. Please try again later.',
    );
  }
}

/**
 * Creates a new lobby by copying all settings and players from the given lobby.
 * Throws if maximum number of active lobbies is reached.
 */
export async function createLobbyAsCopy(
  userID: string,
  oldLobby: GameLobby,
): Promise<GameLobby> {
  await assertNotAnonymous(userID);
  await assertLobbyLimit();
  const newLobbyRef = lobbiesRef.doc();
  const newID = newLobbyRef.id;
  const newLobby = new GameLobby(newID, userID, oldLobby.settings, 'new');
  newLobby.test_groups = oldLobby.test_groups;
  await newLobbyRef.set(newLobby);
  logger.info(
    `Created new lobby, copied from lobby ${oldLobby.id} by user: ${userID}`,
  );
  // Copy all players:
  const players = (await getPlayers(oldLobby.id)).filter(
    (p) => p.status === 'online',
  );
  const newPlayers = players.map(
    (p) => new PlayerInLobby(p.uid, p.name, p.role, p.status, p.wins),
  );
  const newPlayersRef = getPlayersRef(newLobby.id);
  // If tracking users' lobbies, could update it here.
  await Promise.all(newPlayers.map((p) => newPlayersRef.doc(p.uid).set(p)));
  newPlayers.forEach((p) => newLobby.player_ids.add(p.uid));
  await updateLobby(newLobby);
  logger.info(
    `Copied players from lobby ${oldLobby.id} to lobby ${newLobby.id}`,
  );
  // Notify old lobby that it was copied:
  oldLobby.next_lobby_id = newLobby.id;
  await updateLobby(oldLobby);
  return newLobby;
}
