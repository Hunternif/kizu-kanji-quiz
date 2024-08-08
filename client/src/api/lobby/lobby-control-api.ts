import { runTransaction } from 'firebase/firestore';
import {
  endLobbyFun,
  firestore,
  startLobbyFun,
  updateLobbySettingsFun,
} from '../../firebase';
import {
  GameLobby,
  GameTurn,
  LobbySettings,
  PlayerInLobby,
  TestGroup,
} from '../../shared/types';
import { getLobby, updateLobby } from './lobby-repository';

///////////////////////////////////////////////////////////////////////////////
//
//  API for changing data or settings of an existing lobby.
//
///////////////////////////////////////////////////////////////////////////////

/** Reassign lobby "creator" to a different user */
export async function setLobbyCreator(lobby: GameLobby, userID: string) {
  lobby.creator_uid = userID;
  await updateLobby(lobby);
}

export async function startLobby(lobby: GameLobby): Promise<void> {
  // Notify other players that the game is starting:
  lobby.status = 'starting';
  await updateLobby(lobby);
  // Now actually start it:
  await startLobbyFun({ lobby_id: lobby.id });
}

export async function endLobby(lobby: GameLobby): Promise<void> {
  await endLobbyFun({ lobby_id: lobby.id });
}

export async function updateLobbySettings(
  lobbyID: string,
  settings: LobbySettings,
): Promise<void> {
  await updateLobbySettingsFun({ lobby_id: lobbyID, settings });
}

/** Should be used only during lobby setup */
export async function addTestGroups(
  lobby: GameLobby,
  testGroup: TestGroup,
): Promise<GameLobby> {
  return await runTransaction(firestore, async (transaction) => {
    // Refresh lobby to get up-to-date list of decks:
    const updatedLobby = (await getLobby(lobby.id, transaction))!;
    updatedLobby.test_groups.add(testGroup);
    await updateLobby(updatedLobby, transaction);
    return updatedLobby;
  });
}

/** Should be used only during lobby setup */
export async function removeTestGroups(
  lobby: GameLobby,
  testGroup: TestGroup,
): Promise<GameLobby> {
  return await runTransaction(firestore, async (transaction) => {
    // Refresh lobby to get up-to-date list of decks:
    const updatedLobby = (await getLobby(lobby.id, transaction))!;
    updatedLobby.test_groups.delete(testGroup);
    await updateLobby(updatedLobby, transaction);
    return updatedLobby;
  });
}

/** Returns true if game end condition has been reached. */
export async function checkIfShouldEndGame(
  lobby: GameLobby,
  turn: GameTurn,
  players: PlayerInLobby[],
): Promise<boolean> {
  return lobby.questions.length > 0;
}
