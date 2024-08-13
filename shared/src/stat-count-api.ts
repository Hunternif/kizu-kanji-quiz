import { isChoiceAnswer, isCorrectResponse, isTypedAnswer } from './mode-utils';
import { EntryStats, GameTurn, PlayerResponse } from './types';
import { assertExhaustive } from './utils';

type Counts = { [key: string]: number | undefined };
export type UserStatIncrement = Counts & {
  [P in keyof Omit<EntryStats, 'entry_id' | 'groups'>]: EntryStats[P];
};

/**
 * Updates user stats based on their response to this turn,
 * depending on the game mode.
 */
export function countStatChange(
  turn: GameTurn,
  response: PlayerResponse,
): UserStatIncrement {
  const statIncrement: UserStatIncrement = {};
  if (response.isEmpty()) return {};
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
  return statIncrement;
}
