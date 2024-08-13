import { runTransaction } from 'firebase/firestore';
import {
  endLobbyFun,
  firebaseAuth,
  firestore,
  startLobbyFun,
  updateLobbySettingsFun,
} from '../../firebase';
import { GameLobby, LobbySettings, TestGroup } from '../../shared/types';
import { getLastTurn, updateTurn } from '../turn/turn-repository';
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

/** Signals the end of the initial countdown before the start of the game.
 * Must be called from the lobby creator's client. */
export async function signalEndOfCountdown(lobby: GameLobby) {
  if (lobby.creator_uid === firebaseAuth.currentUser?.uid) {
    // Update first turn's start time:
    const turn = await getLastTurn(lobby);
    if (turn) {
      // TODO: this could be screwed up because of timezones:
      turn.setPhase(
        'answering',
        new Date(),
        lobby.settings.question_timer_sec * 1000,
      );
      await updateTurn(lobby.id, turn);
    }
    lobby.status = 'in_progress';
    await updateLobby(lobby);
  }
}

export async function endLobby(lobby: GameLobby): Promise<void> {
  if (lobby.creator_uid === firebaseAuth.currentUser?.uid) {
    // Creator can update lobby directly:
    lobby.status = 'ended';
    await updateLobby(lobby);
  } else {
    await endLobbyFun({ lobby_id: lobby.id });
  }
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

/** Checks end-game conditions */
export function shouldEndLobby(lobby: GameLobby) {
  if (lobby.used_question_count >= lobby.questions.length) {
    return true;
  }
  if (
    lobby.settings.max_questions > 0 &&
    lobby.used_question_count >= lobby.settings.max_questions
  ) {
    return true;
  }
  return false;
}
