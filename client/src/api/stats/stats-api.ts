import {
  isChoiceAnswer,
  isCorrectResponse,
  isTypedAnswer,
} from '../../shared/mode-utils';
import { EntryStats, GameTurn, PlayerResponse } from '../../shared/types';
import { assertExhaustive } from '../../shared/utils';
import { incrementStat, UserStatIncrement } from './stats-repository';

/**
 * Updates user stats based on their response to this turn,
 * depending on the game mode.
 */
export async function updateUserStats(
  turn: GameTurn,
  response: PlayerResponse,
) {
  const statIncrement: UserStatIncrement = {};
  if (response.isEmpty()) return;
  const isWin = isCorrectResponse(turn, response);
  let isSkip = false;
  if (isChoiceAnswer(turn.answer_mode)) {
    isSkip = response.answer_entry_id === undefined;
  } else if (isTypedAnswer(turn.answer_mode)) {
    isSkip = response.answer_typed === undefined;
  } else {
    // TODO: implement stats for other answer modes
    isSkip = true;
  }
  const isFail = !isSkip && !isWin;
  // logger.info(
  //   `Logging stats for '${turn.question.id}': win: ${isWin} skip: ${isSkip} fail: ${isFail}`,
  // );
  switch (turn.answer_mode) {
    case 'choose_kanji':
      if (isWin) statIncrement.writing_wins = 1;
      if (isFail) statIncrement.writing_fails = 1;
      break;
    case 'choose_hiragana':
      if (turn.question.isKana) {
        // For kana, 'hiragana' == writing:
        if (isWin) statIncrement.writing_wins = 1;
        if (isFail) statIncrement.writing_fails = 1;
      } else {
        if (isWin) statIncrement.reading_wins = 1;
        if (isFail) statIncrement.reading_fails = 1;
      }
      break;
    case 'choose_romaji':
    case 'type_romaji':
      if (isWin) statIncrement.reading_wins = 1;
      if (isFail) statIncrement.reading_fails = 1;
      break;
    case 'choose_meaning':
    case 'type_meaning':
      if (turn.question.isKana) {
        // For kana, 'meaning' == reading:
        if (isWin) statIncrement.reading_wins = 1;
        if (isFail) statIncrement.reading_fails = 1;
      } else {
        if (isWin) statIncrement.meaning_wins = 1;
        if (isFail) statIncrement.meaning_fails = 1;
      }
      break;
    case 'draw_hiragana':
    case 'draw_kanji':
      // TOOD: implement stats for other answer modes
      break;
    default:
      assertExhaustive(turn.answer_mode);
  }
  await incrementStat(response.player_uid, turn.question, statIncrement);
}

/** Calculates progress for an entry. */
export function getEntryProgress(stat: EntryStats): {
  passed: boolean;
  wins: number;
  fails: number;
  attempts: number;
} {
  const wins =
    (stat?.meaning_wins ?? 0) +
    (stat?.reading_wins ?? 0) +
    (stat?.writing_wins ?? 0);
  const fails =
    (stat?.meaning_fails ?? 0) +
    (stat?.reading_fails ?? 0) +
    (stat?.writing_fails ?? 0);
  const passed = wins > fails;
  const attempts = wins + fails;
  return { passed, wins, fails, attempts };
}
