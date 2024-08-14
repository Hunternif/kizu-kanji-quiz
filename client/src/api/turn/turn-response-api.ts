import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore';
import { playerResponseConverter } from '../../shared/firestore-converters';
import {
  GameLobby,
  GameTurn,
  Language,
  PauseRequest,
  PlayerInLobby,
  PlayerResponse,
} from '../../shared/types';
import { getTurnRef } from './turn-repository';

///////////////////////////////////////////////////////////////////////////////
//
//  Respository & API for players' responses.
//
///////////////////////////////////////////////////////////////////////////////

/** Returns Firestore subcollection reference of player responses in turn. */
export function getPlayerResponsesRef(lobbyID: string, turnID: string) {
  const turnRef = getTurnRef(lobbyID, turnID);
  return collection(turnRef, 'player_responses').withConverter(
    playerResponseConverter,
  );
}

function getPlayerResponseRef(lobbyID: string, turnID: string, userID: string) {
  return doc(getPlayerResponsesRef(lobbyID, turnID), userID);
}

async function getPlayerResponse(
  lobbyID: string,
  turnID: string,
  userID: string,
): Promise<PlayerResponse | null> {
  return (
    (await getDoc(getPlayerResponseRef(lobbyID, turnID, userID))).data() ?? null
  );
}

async function updateResponse(
  lobbyID: string,
  turnID: string,
  response: PlayerResponse,
) {
  await setDoc(
    getPlayerResponseRef(lobbyID, turnID, response.player_uid),
    response,
  );
}

/** Submit player's response */
export async function submitPlayerResponse(
  lobby: GameLobby,
  turn: GameTurn,
  player: PlayerInLobby,
  language: Language,
  answerEntryID?: string,
  answerTyped?: string,
) {
  const response = new PlayerResponse(
    player.uid,
    player.name,
    turn.phase,
    null,
    language,
    answerEntryID,
    answerTyped,
  );
  await updateResponse(lobby.id, turn.id, response);
}

/** Retract player's response */
export async function cancelPlayerResponse(
  lobby: GameLobby,
  turn: GameTurn,
  player: PlayerInLobby,
) {
  await deleteDoc(doc(getPlayerResponsesRef(lobby.id, turn.id), player.uid));
}

/** Fetches all responses in this turn. */
export async function getAllPlayerResponses(
  lobbyID: string,
  turnID: string,
): Promise<Array<PlayerResponse>> {
  return (await getDocs(getPlayerResponsesRef(lobbyID, turnID))).docs.map((d) =>
    d.data(),
  );
}

/**
 * Special function called at the end of the timer.
 * By updating the response, we notify Firebase that the turn has ended.
 * If the player has not responded, then an empty response is submitted.
 * @param shouldSkip if true, an empty response will be considered a "skip".
 */
export async function pingResponse(
  lobby: GameLobby,
  turn: GameTurn,
  player: PlayerInLobby,
  shouldSkip: boolean,
) {
  // Micro-optimization: only do this for lobby creator,
  // so there is only 1 extra document update.
  if (lobby.creator_uid === player.uid || shouldSkip) {
    // console.log(`Ping for ${turn.id} '${turn.phase}'! ${new Date()}`);
    const response = await getPlayerResponse(lobby.id, turn.id, player.uid);
    if (response) {
      response.current_phase = turn.phase;
      response.pause = undefined; // clear stale pause requests
      response.time_updated = new Date();
      if (response.isEmpty() && shouldSkip) {
        response.skip = true;
      }
      await updateResponse(lobby.id, turn.id, response);
    } else {
      const emptyResponse = new PlayerResponse(
        player.uid,
        player.name,
        turn.phase,
        null,
      );
      if (shouldSkip) {
        emptyResponse.skip = true;
      }
      await updateResponse(lobby.id, turn.id, emptyResponse);
    }
  }
}

/**
 * Player requests a pause by submitting a response.
 * The turn will pause at this moment.
 */
export async function requestPause(
  lobby: GameLobby,
  turn: GameTurn,
  player: PlayerInLobby,
  shouldPause: boolean,
) {
  const response = await getPlayerResponse(lobby.id, turn.id, player.uid);
  const request: PauseRequest = shouldPause
    ? 'request_pause'
    : 'request_resume';
  if (response) {
    response.pause = request;
    response.current_phase = turn.phase;
    response.time_updated = new Date();
    await updateResponse(lobby.id, turn.id, response);
  } else {
    const emptyResponse = new PlayerResponse(
      player.uid,
      player.name,
      turn.phase,
      null,
    );
    emptyResponse.pause = request;
    await updateResponse(lobby.id, turn.id, emptyResponse);
  }
}
