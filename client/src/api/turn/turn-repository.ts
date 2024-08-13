import {
  Transaction,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { turnConverter } from '../../shared/firestore-converters';
import { GameLobby, GameTurn } from '../../shared/types';
import { lobbiesRef } from '../lobby/lobby-repository';

///////////////////////////////////////////////////////////////////////////////
//
//  A game Lobby consists of many Turns.
//  This module containts methods to read and write Turn data in Firestore.
//  For now it's too inconvenient to make it a "real" Repository class...
//
///////////////////////////////////////////////////////////////////////////////

/** Returns Firestore subcollection reference of turns in lobby. */
export function getTurnsRef(lobbyID: string) {
  return collection(lobbiesRef, lobbyID, 'turns').withConverter(turnConverter);
}

export function getTurnRef(lobbyID: string, turnID: string) {
  return doc(getTurnsRef(lobbyID), turnID);
}

/** Finds turn by ID, or throws HttpsError. */
export async function getTurn(
  lobbyID: string,
  turnID: string,
): Promise<GameTurn> {
  const turn = (await getDoc(getTurnRef(lobbyID, turnID))).data();
  if (!turn) {
    throw new Error(`Turn ${turnID} not found in lobby ${lobbyID}`);
  }
  return turn;
}

/** Finds the last turn in the lobby. */
export async function getLastTurn(lobby: GameLobby): Promise<GameTurn | null> {
  return lobby.current_turn_id
    ? await getTurn(lobby.id, lobby.current_turn_id)
    : null;
}

/** Fetches all turns that occurred in the lobby. */
export async function getAllTurns(lobbyID: string): Promise<Array<GameTurn>> {
  return (await getDocs(getTurnsRef(lobbyID))).docs.map((d) => d.data());
}

/** Updates Firestore document with this turn data.
 * Doesn't update subcollections! */
export async function updateTurn(
  lobbyID: string,
  turn: GameTurn,
  transaction?: Transaction,
): Promise<void> {
  const ref = getTurnRef(lobbyID, turn.id);
  const data = turnConverter.toFirestore(turn);
  if (transaction) {
    transaction.update(ref, data);
  } else {
    await updateDoc(ref, data);
  }
}
