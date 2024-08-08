// Server APIs for game turns, when the game is in progress.

import { HttpsError } from 'firebase-functions/v2/https';
import {
  GameEntry,
  GameLobby,
  GameTurn,
  PlayerResponse,
} from '../shared/types';
import { assertExhaustive } from '../shared/utils';
import { selectQuestion } from './entry-api';
import {
  getLobby,
  getPlayerThrows,
  updateLobby,
} from './lobby-server-repository';
import {
  getLastTurn,
  getTurnsRef,
  setPlayerResponse,
  updateTurn,
} from './turn-server-repository';
import { endLobby, shouldEndLobby } from './lobby-server-api';

const dummyEntry = new GameEntry(
  'test_entry',
  0,
  'Test?',
  'this is hiragana',
  'this is romaji',
  new Map([['english', ['this is english']]]),
);

/**
 * Creates a new turn without a prompt, and returns it.
 * @param lastTurn passed to save on document reads.
 */
export async function createNewTurn(
  lobby: GameLobby,
  lastTurn: GameTurn | undefined | null = null,
): Promise<GameTurn> {
  // TODO: use transaction to ensure only one turn is created.
  if (lastTurn === undefined) {
    lastTurn = await getLastTurn(lobby);
  }
  const newOrdinal = lastTurn ? lastTurn.ordinal + 1 : 1;
  const id = 'turn_' + String(newOrdinal).padStart(2, '0');
  const { question, choices } = selectQuestion(lobby);
  if (!question) {
    throw new HttpsError(
      'failed-precondition',
      `No more questions in lobby ${lobby.id}`,
    );
  }
  const now = new Date();
  const newTurn = new GameTurn(
    id,
    newOrdinal,
    now,
    null,
    question,
    lobby.settings.question_mode,
    lobby.settings.answer_mode,
    choices,
  );
  newTurn.phase = 'answering';
  newTurn.next_phase_time = new Date(
    now.getTime() + lobby.settings.question_timer_sec * 1000,
  );
  await getTurnsRef(lobby.id).doc(id).set(newTurn);
  lobby.current_turn_id = newTurn.id;
  await updateLobby(lobby);
  return newTurn; // timestamp may not have reloaded but that's ok.
}

/**
 * Starts the turn.
 */
export async function startTurn(lobby: GameLobby, turn: GameTurn) {
  const now = new Date();
  turn.phase = 'answering';
  turn.phase_start_time = now;
  turn.next_phase_time = new Date(
    now.getTime() + lobby.settings.question_timer_sec * 1000,
  );
  await updateTurn(lobby.id, turn);
}

/** (Only used in tests) */
export async function playResponse(
  lobby: GameLobby,
  turn: GameTurn,
  userID: string,
  entryID?: string,
  typedText?: string,
): Promise<PlayerResponse> {
  const player = await getPlayerThrows(lobby.id, userID);
  const response = new PlayerResponse(
    userID,
    player.name,
    new Date(),
    entryID,
    typedText,
  );
  await setPlayerResponse(lobby.id, turn.id, response);
  return response;
}

/**
 * Starts the turn's 'reveal' [hase] and returns it.
 */
export async function startTurnReveal(lobby: GameLobby, turn: GameTurn) {
  const now = new Date();
  turn.phase = 'reveal';
  turn.phase_start_time = now;
  turn.next_phase_time = new Date(
    now.getTime() + lobby.settings.question_timer_sec * 1000,
  );
  await updateTurn(lobby.id, turn);
}

/**
 * Completes this turn.
 */
export async function completeTurn(lobby: GameLobby, turn: GameTurn) {
  turn.phase = 'complete';
  turn.phase_start_time = new Date();
  turn.next_phase_time = null;
  await updateTurn(lobby.id, turn);
}

/** Checks if the timer has run out and advances turn to the next phase. */
export async function tryAdvanceTurn(lobbyID: string, turn: GameTurn) {
  // TODO: if all responses have been submitted, reduce timer to a small value.
  const now = new Date();
  let shouldAdvance =
    turn.next_phase_time && now.getTime() >= turn.next_phase_time.getTime();
  if (shouldAdvance) {
    const lobby = await getLobby(lobbyID);
    switch (turn.phase) {
      case 'new':
      case 'answering':
        await startTurnReveal(lobby, turn);
        break;
      case 'reveal':
        await completeTurn(lobby, turn);
        if (shouldEndLobby(lobby)) {
          await endLobby(lobby);
        } else {
          await createNewTurn(lobby, turn);
        }
      case 'complete':
        break;
      default:
        assertExhaustive(turn.phase);
    }
  }
}

/** Updates all player's scores and likes from this turn, if it has ended. */
export async function updatePlayerScoresFromTurn(
  lobbyID: string,
  turn: GameTurn,
  responses: PlayerResponse[],
) {
  // TODO: update player scores and stats
}
