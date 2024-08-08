import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
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
