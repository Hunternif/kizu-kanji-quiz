// Server APIs for game turns, when the game is in progress.

import { HttpsError } from 'firebase-functions/v2/https';
import { RNG } from '../shared/rng';
import {
  GameEntry,
  GameLobby,
  GameTurn,
  PlayerResponse,
} from '../shared/types';
import { selectQuestion } from './entry-api';
import { getPlayerThrows, updateLobby } from './lobby-server-repository';
import {
  getLastTurn,
  getTurn,
  getTurnsRef,
  setPlayerResponse,
  updateTurn,
} from './turn-server-repository';

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
 */
export async function createNewTurn(lobby: GameLobby): Promise<GameTurn> {
  // TODO: use transaction to ensure only one turn is created.
  const lastTurn = await getLastTurn(lobby);
  const newOrdinal = lastTurn ? lastTurn.ordinal + 1 : 1;
  const id = 'turn_' + String(newOrdinal).padStart(2, '0');
  const { question, choices } = selectQuestion(lobby);
  if (!question) {
    throw new HttpsError(
      'failed-precondition',
      `No more questions in lobby ${lobby.id}`,
    );
  }
  const newTurn = new GameTurn(
    id,
    newOrdinal,
    new Date(),
    null,
    question,
    lobby.settings.question_mode,
    lobby.settings.answer_mode,
    choices,
  );
  newTurn.phase = 'answering';
  newTurn.next_phase_time = new Date(
    newTurn.time_created.getTime() + lobby.settings.question_timer_sec * 1000,
  );
  await getTurnsRef(lobby.id).doc(id).set(newTurn);
  lobby.current_turn_id = newTurn.id;
  await updateLobby(lobby);
  return newTurn; // timestamp may not have reloaded but that's ok.
}

/**
 * Starts the turn and returns it.
 */
export async function startTurn(
  lobbyID: string,
  turnID: string,
): Promise<GameTurn> {
  const turn = await getTurn(lobbyID, turnID);
  turn.phase = 'answering';
  await updateTurn(lobbyID, turn);
  return turn;
}

/** (Only used in tests) */
export async function playResponse(
  lobby: GameLobby,
  turn: GameTurn,
  userID: string,
  entryID?: string,
  typedText?: string,
): Promise<PlayerResponse> {
  const rng = RNG.fromTimestamp();
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

/** Updates all player's scores and likes from this turn, if it has ended. */
export async function updatePlayerScoresFromTurn(
  lobbyID: string,
  turn: GameTurn,
  responses: PlayerResponse[],
) {
  // TODO: update player scores and stats
}
