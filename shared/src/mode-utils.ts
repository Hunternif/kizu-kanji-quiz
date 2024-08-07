import { AnswerMode, GameMode, QuestionMode } from './types';
import { assertExhaustive } from './utils';

/** Returns valid question modes given game mode */
export function getValidQuestionModes(gameMode: GameMode): QuestionMode[] {
  const validQuestionModes: Array<QuestionMode> = [];
  switch (gameMode) {
    case 'writing_to_reading':
      validQuestionModes.push('kanji', 'hiragana');
      break;
    case 'reading_to_writing':
      validQuestionModes.push('hiragana', 'romaji');
      break;
    case 'writing_to_meaning':
      validQuestionModes.push('kanji', 'hiragana', 'romaji');
      break;
    case 'meaning_to_writing':
      validQuestionModes.push('meaning');
      break;
    default:
      assertExhaustive(gameMode);
  }
  return validQuestionModes;
}

/** Returns valid answer modes given game mode */
export function getValidAnswerModes(gameMode: GameMode): AnswerMode[] {
  const validAnswerModes: Array<AnswerMode> = [];
  switch (gameMode) {
    case 'writing_to_reading':
      validAnswerModes.push('choose_hiragana', 'choose_romaji');
      // validAnswerModes.push('type_romaji'); // not supported yet
      break;
    case 'reading_to_writing':
      validAnswerModes.push('choose_kanji', 'choose_hiragana');
      // validAnswerModes.push('draw_kanji', 'draw_hiragana'); // not supported yet
      break;
    case 'writing_to_meaning':
      validAnswerModes.push('choose_meaning');
      // validAnswerModes.push('type_meaning'); // not supported yet
      break;
    case 'meaning_to_writing':
      validAnswerModes.push('choose_kanji', 'choose_hiragana', 'choose_romaji');
      // validAnswerModes.push('draw_kanji', 'draw_hiragana'); // not supported yet
      break;
    default:
      assertExhaustive(gameMode);
  }
  return validAnswerModes;
}
