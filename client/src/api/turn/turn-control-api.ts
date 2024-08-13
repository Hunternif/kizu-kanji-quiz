import {
  getCountFromServer,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { isChoiceAnswer, isCorrectResponse } from '../../shared/mode-utils';
import { selectQuestion } from '../../shared/question-api';
import { GameLobby, GameTurn } from '../../shared/types';
import { assertExhaustive } from '../../shared/utils';
import { endLobby, shouldEndLobby } from '../lobby/lobby-control-api';
import {
  countPlayers,
  getLobby,
  getPlayerRef,
  updateLobby,
} from '../lobby/lobby-repository';
import { updateUserStats } from '../stats/stats-api';
import { getLastTurn, getTurnRef, updateTurn } from './turn-repository';

import {
  getAllPlayerResponses,
  getPlayerResponsesRef,
} from './turn-response-api';

///////////////////////////////////////////////////////////////////////////////
//
//  This API controls the flow of the game by listenning to player responses.
//  We trust the Lobby Creator to not hack the game, so we can rely on their
//  client to control the game without the need for Cloud Functions.
//  That makes the game faster.
//
///////////////////////////////////////////////////////////////////////////////

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
    throw new Error(`No more questions in lobby ${lobby.id}`);
  }
  const now = new Date();
  const newTurn = new GameTurn(
    id,
    newOrdinal,
    now,
    lobby.settings.question_mode,
    lobby.settings.answer_mode,
    question,
    choices,
  );
  newTurn.setPhase('answering', now, lobby.settings.question_timer_sec * 1000);
  await setDoc(getTurnRef(lobby.id, id), newTurn);
  lobby.current_turn_id = newTurn.id;
  await updateLobby(lobby);
  return newTurn; // timestamp may not have reloaded but that's ok.
}

/**
 * Starts the turn.
 */
export async function startTurnAnswering(lobby: GameLobby, turn: GameTurn) {
  turn.setPhase(
    'answering',
    new Date(),
    lobby.settings.question_timer_sec * 1000,
  );
  await updateTurn(lobby.id, turn);
}

/**
 * Counts responses that were submitted by players
 * (not the empty "pings" that were used for notification.)
 */
async function countNonEmptyResponses(
  lobbyID: string,
  turn: GameTurn,
): Promise<number> {
  const ref = getPlayerResponsesRef(lobbyID, turn.id);
  const skipCount = (
    await getCountFromServer(query(ref, orderBy('skip', 'asc')))
  ).data().count;
  let validCount = 0;
  if (isChoiceAnswer(turn.answer_mode)) {
    validCount = (
      await getCountFromServer(query(ref, orderBy('answer_entry_id', 'asc')))
    ).data().count;
  } else {
    validCount = (
      await getCountFromServer(query(ref, orderBy('answer_typed', 'asc')))
    ).data().count;
  }
  return skipCount + validCount;
}

/**
 * Starts the turn's 'reveal' [hase] and returns it.
 * Also counts player scores. Should only be called once!
 */
export async function startTurnReveal(lobby: GameLobby, turn: GameTurn) {
  const shouldCountScores = turn.phase !== 'reveal';
  turn.setPhase('reveal', new Date(), lobby.settings.reveal_timer_sec * 1000);
  await updateTurn(lobby.id, turn);
  if (shouldCountScores) {
    await updatePlayerScoresFromTurn(lobby, turn);
  }
}

/**
 * Completes this turn.
 */
export async function completeTurn(lobby: GameLobby, turn: GameTurn) {
  turn.setPhase('complete', new Date(), undefined);
  await updateTurn(lobby.id, turn);
}

/** Checks if the timer has run out and advances turn to the next phase. */
export async function tryAdvanceTurn(lobbyID: string, turn: GameTurn) {
  // TODO: if all responses have been submitted, reduce timer to a small value.
  const now = new Date();
  let shouldAdvance = false;
  if (turn.pause === 'none') {
    if (turn.phase_duration_ms === 0) {
      // count if all players submitted responses
      const playerCount = await countPlayers(lobbyID, 'player', 'online');
      const count = await countNonEmptyResponses(lobbyID, turn);
      // logger.info(`Counted ${count} responses from ${playerCount} players.`);
      shouldAdvance = count >= playerCount;
    } else if (turn.next_phase_time) {
      shouldAdvance = now.getTime() >= turn.next_phase_time.getTime();
    }
  }
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
        break;
      case 'complete':
        break;
      default:
        assertExhaustive(turn.phase);
    }
  }
}

/** Updates all player's scores from this turn, if it has ended. */
export async function updatePlayerScoresFromTurn(
  lobby: GameLobby,
  turn: GameTurn,
) {
  const responses = await getAllPlayerResponses(lobby.id, turn.id);
  for (const resp of responses) {
    if (isCorrectResponse(turn, resp)) {
      await updateDoc(getPlayerRef(lobby.id, resp.player_uid), {
        wins: increment(1),
      });
    }
    // Update player statistics:
    if (!lobby.settings.freeze_stats) {
      await updateUserStats(turn, resp);
    }
  }
}

/** Pauses timer. */
export async function pauseTurn(lobbyID: string, turn: GameTurn) {
  if (turn.pause !== 'paused') {
    turn.pause = 'paused';
    turn.paused_at = new Date();
    await updateTurn(lobbyID, turn);
  }
}

/** Resumes timer. */
export async function resumeTurn(lobbyID: string, turn: GameTurn) {
  if (turn.pause === 'paused') {
    turn.pause = 'none';
    if (turn.next_phase_time && turn.paused_at) {
      const remainingTimeMs =
        turn.next_phase_time.getTime() - turn.paused_at.getTime();
      const now = new Date();
      const newNextPhaseTime = new Date(now.getTime() + remainingTimeMs);
      // logger.info(
      //   `Remaining time was ${remainingTimeMs / 1000}.
      //   Prev end time was ${turn.next_phase_time},
      //   bumped it to ${newNextPhaseTime}`,
      // );
      turn.next_phase_time = newNextPhaseTime;
    }
    turn.paused_at = undefined;
    await updateTurn(lobbyID, turn);
  }
}

/**
 * Applies lobby settings to the current turn.
 * Useful when changing game mode or timer.
 */
export async function updateCurrentTurnSettings(lobby: GameLobby) {
  const turn = await getLastTurn(lobby);
  if (turn) {
    turn.answer_mode = lobby.settings.answer_mode;
    turn.question_mode = lobby.settings.question_mode;
    const questionTimerMs = lobby.settings.question_timer_sec * 1000;
    const revealTimerMs = lobby.settings.reveal_timer_sec * 1000;
    switch (turn.phase) {
      case 'new':
        break;
      case 'answering':
        if (turn.phase_duration_ms !== questionTimerMs) {
          // restart the phase from now:
          turn.setPhase('answering', new Date(), questionTimerMs);
        }
        break;
      case 'reveal':
        if (turn.phase_duration_ms !== revealTimerMs) {
          // restart the phase from now:
          turn.setPhase('reveal', new Date(), revealTimerMs);
        }
        break;
      case 'complete':
        await updateTurn(lobby.id, turn);
        break;
      default:
        assertExhaustive(turn.phase);
    }
    await updateTurn(lobby.id, turn);
  }
}
