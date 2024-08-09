import {
  AnswerMode,
  GameEntry,
  GameMode,
  Language,
  noData,
  QuestionMode,
} from './types';
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

/** Returns true if the answer mode is a multiple-choice question. */
export function isChoiceAnswer(mode: AnswerMode) {
  switch (mode) {
    case 'choose_kanji':
    case 'choose_hiragana':
    case 'choose_romaji':
    case 'choose_meaning':
      return true;
    case 'type_romaji':
    case 'type_meaning':
    case 'draw_hiragana':
    case 'draw_kanji':
      return false;
    default:
      assertExhaustive(mode);
      return false;
  }
}

/**
 * Selects appropriate text content for a question.
 * Handles edge cases when you mix together kanji and kana questions.
 */
export function getQuestionContent(
  entry: GameEntry,
  questionMode: QuestionMode,
  gameMode: GameMode,
  language: Language,
): string {
  switch (questionMode) {
    case 'kanji':
      return entry.writing;
    case 'hiragana':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, gameMode);
      }
      return entry.reading_hiragana;
    case 'romaji':
      return entry.reading_romaji;
    case 'meaning':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, gameMode);
      }
      return entry.getMeaning(language).join(', ');
    default:
      assertExhaustive(questionMode);
      return noData;
  }
}

/**
 * Selects appropriate text content for an answer.
 * Handles edge cases when you mix together kanji and kana questions.
 */
export function getAnswerContent(
  entry: GameEntry,
  answerMode: AnswerMode,
  gameMode: GameMode,
  language: Language,
): string {
  switch (answerMode) {
    case 'choose_kanji':
      return entry.writing;
    case 'choose_hiragana':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, gameMode);
      }
      return entry.reading_hiragana;
    case 'choose_romaji':
      return entry.reading_romaji;
    case 'choose_meaning':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, gameMode);
      }
      return entry.getMeaning(language).join(', ');
    case 'type_romaji':
    case 'type_meaning':
    case 'draw_hiragana':
    case 'draw_kanji':
      return noData; // Should never happen
    default:
      assertExhaustive(answerMode);
      return noData;
  }
}

/**
 * For a Kana entry, selects appropriate text content for a question.
 * Handles edge cases when you mix together kanji and kana questions.
 */
function getKanaQuestionContent(kanaEntry: GameEntry, gameMode: GameMode) {
  switch (gameMode) {
    case 'reading_to_writing':
    case 'meaning_to_writing':
      // For kana, 'reading' and 'meaning' is always romaji:
      return kanaEntry.reading_romaji;
    case 'writing_to_reading':
    case 'writing_to_meaning':
      return kanaEntry.writing;
    default:
      assertExhaustive(gameMode);
      return noData;
  }
}

/**
 * For a Kana entry, selects appropriate text content for a question.
 * Handles edge cases when you mix together kanji and kana questions.
 */
function getKanaAnswerContent(kanaEntry: GameEntry, gameMode: GameMode) {
  switch (gameMode) {
    case 'reading_to_writing':
    case 'meaning_to_writing':
      return kanaEntry.writing;
    case 'writing_to_reading':
    case 'writing_to_meaning':
      // For kana, 'reading' and 'meaning' is always romaji:
      return kanaEntry.reading_romaji;
    default:
      assertExhaustive(gameMode);
      return noData;
  }
}
