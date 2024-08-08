import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { playerResponseConverter } from '../../shared/firestore-converters';
import {
  GameLobby,
  GameTurn,
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

/** Submit player's response */
export async function submitPlayerResponse(
  lobby: GameLobby,
  turn: GameTurn,
  player: PlayerInLobby,
  answerEntryID?: string,
  answerTyped?: string,
) {
  const response = new PlayerResponse(
    player.uid,
    player.name,
    null,
    answerEntryID,
    answerTyped,
  );
  await setDoc(
    doc(getPlayerResponsesRef(lobby.id, turn.id), player.uid),
    response,
  );
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
 */
export async function pingResponse(
  lobby: GameLobby,
  turn: GameTurn,
  player: PlayerInLobby,
) {
  // Micro-optimization: only do this for lobby creator,
  // so there is only 1 extra document update.
  if (lobby.creator_uid === player.uid) {
    const ref = doc(getPlayerResponsesRef(lobby.id, turn.id), player.uid);
    const response = await getDoc(ref);
    if (response.exists()) {
      await updateDoc(ref, { time_updated: new Date() });
    } else {
      const emptyResponse = new PlayerResponse(player.uid, player.name, null);
      await setDoc(ref, emptyResponse);
    }
  }
}
