import { HttpsError } from 'firebase-functions/v2/https';
import { firestore } from '../firebase-server';
import {
  playerResponseConverter,
  turnConverter
} from '../shared/firestore-converters';
import {
  GameLobby,
  GameTurn,
  PlayerResponse
} from '../shared/types';

///////////////////////////////////////////////////////////////////////////////
//
//  A game Lobby consists of many Turns.
//  This module containts methods to read and write Turn data in Firestore.
//  For now it's too inconvenient to make it a "real" Repository class...
//
///////////////////////////////////////////////////////////////////////////////

/** Returns Firestore subcollection reference. */
export function getTurnsRef(lobbyID: string) {
  return firestore
    .collection(`lobbies/${lobbyID}/turns`)
    .withConverter(turnConverter);
}

/** Returns Firestore subcollection reference. */
function getPlayerResponsesRef(lobbyID: string, turnID: string) {
  return firestore
    .collection(`lobbies/${lobbyID}/turns/${turnID}/player_responses`)
    .withConverter(playerResponseConverter);
}

/** Returns all turns that occurred in this lobby. */
export async function getAllTurns(lobbyID: string): Promise<Array<GameTurn>> {
  return (await getTurnsRef(lobbyID).get()).docs.map((t) => t.data());
}

/** Finds turn by ID, or throws HttpsError. */
export async function getTurn(
  lobbyID: string,
  turnID: string,
): Promise<GameTurn> {
  const turn = (await getTurnsRef(lobbyID).doc(turnID).get()).data();
  if (!turn) {
    throw new HttpsError(
      'not-found',
      `Turn ${turnID} not found in lobby ${lobbyID}`,
    );
  }
  return turn;
}

/** Finds the last turn in the lobby. */
export async function getLastTurn(lobby: GameLobby): Promise<GameTurn | null> {
  return lobby.current_turn_id
    ? await getTurn(lobby.id, lobby.current_turn_id)
    : null;
}

/**
 * Updates turn state in Firestore.
 * Does not update subcollections! (player_resposnes etc)
 */
export async function updateTurn(
  lobbyID: string,
  turn: GameTurn,
): Promise<void> {
  await getTurnsRef(lobbyID)
    .doc(turn.id)
    .update(turnConverter.toFirestore(turn));
}

/** Counts how many turns have occurred in this lobby. */
export async function countTurns(lobbyID: string): Promise<number> {
  return (await getTurnsRef(lobbyID).count().get()).data().count;
}

/** Responses from all players in this turn. */
export async function getPlayerResponse(
  lobbyID: string,
  turnID: string,
  userID: string,
): Promise<PlayerResponse | null> {
  return (
    (await getPlayerResponsesRef(lobbyID, turnID).doc(userID).get()).data() ??
    null
  );
}

/** Responses from all players in this turn. */
export async function getAllPlayerResponses(
  lobbyID: string,
  turnID: string,
): Promise<Array<PlayerResponse>> {
  return (await getPlayerResponsesRef(lobbyID, turnID).get()).docs.map((t) =>
    t.data(),
  );
}

/** Creates response state in Firestore. */
export async function setPlayerResponse(
  lobbyID: string,
  turnID: string,
  response: PlayerResponse,
) {
  await getPlayerResponsesRef(lobbyID, turnID)
    .doc(response.player_uid)
    .set(response);
}

/** Updates response state in Firestore. */
export async function updatePlayerResponse(
  lobbyID: string,
  turnID: string,
  response: PlayerResponse,
) {
  await getPlayerResponsesRef(lobbyID, turnID)
    .doc(response.player_uid)
    .update(playerResponseConverter.toFirestore(response));
}
