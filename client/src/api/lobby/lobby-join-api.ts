import { createLobbyAsCopyFun, createLobbyAndJoinFun, joinLobbyFun } from '../../firebase';
import { QuizUser, GameLobby } from '../../shared/types';
import {
  getPlayerInLobby,
  setPlayerStatus,
  updatePlayer,
} from './lobby-player-api';

///////////////////////////////////////////////////////////////////////////////
//
//  API related to creating & joining a lobby.
//
///////////////////////////////////////////////////////////////////////////////

/**
 * Will find an active game or create a new one, and attempt to join.
 * Returns lobby ID.
 */
export async function createLobbyAndJoin(): Promise<string> {
  const res = await createLobbyAndJoinFun();
  return res.data.lobby_id;
}

/**
 * Will attempt to join as player. If the lobby is already in progress,
 * will join as spectator.
 */
export async function joinLobby(lobbyID: string): Promise<void> {
  await joinLobbyFun({ lobby_id: lobbyID });
}

/**
 * Creates a new lobby by copying all settings and players from the given lobby.
 * Returns new lobby ID.
 */
export async function createLobbyAsCopy(oldLobbyID: string): Promise<string> {
  const res = await createLobbyAsCopyFun({old_lobby_id: oldLobbyID});
  return res.data.new_lobby_id;
}

/** Remove yourself from this lobby */
export async function leaveLobby(
  lobby: GameLobby | string,
  userID: string,
): Promise<void> {
  const lobbyID = lobby instanceof GameLobby ? lobby.id : lobby;
  await setPlayerStatus(lobbyID, userID, 'left');
}

/** If the user is not already in the lobby, joins it. */
export async function joinLobbyIfNeeded(lobbyID: string, quizUser: QuizUser) {
  if (!(await isUserInLobby(lobbyID, quizUser.uid))) {
    await joinLobby(lobbyID);
  }
  // Update player name & avatar:
  const player = await getPlayerInLobby(lobbyID, quizUser.uid);
  if (player) {
    player.name = quizUser.name;
    // If previously left, re-join:
    if (player?.status === 'left') {
      player.status = 'online';
    }
    await updatePlayer(lobbyID, player);
  }
}

async function isUserInLobby(
  lobbyID: string,
  userID: string,
): Promise<boolean> {
  try {
    const player = await getPlayerInLobby(lobbyID, userID);
    return player !== null;
  } catch (e: any) {
    return false;
  }
}
