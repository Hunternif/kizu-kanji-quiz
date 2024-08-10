import {
  AnswerMode,
  GameEntry,
  GameMode,
  GameTurn,
  Language,
  PlayerResponse,
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
      validAnswerModes.push('type_romaji');
      break;
    case 'reading_to_writing':
      validAnswerModes.push('choose_kanji', 'choose_hiragana');
      // validAnswerModes.push('draw_kanji', 'draw_hiragana'); // not supported yet
      break;
    case 'writing_to_meaning':
      validAnswerModes.push('choose_meaning');
      validAnswerModes.push('type_meaning');
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
export function isChoiceAnswer(
  mode: AnswerMode,
): mode is
  | 'choose_kanji'
  | 'choose_hiragana'
  | 'choose_romaji'
  | 'choose_meaning' {
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

/** Returns true if the user needs to type the answer. */
export function isTypedAnswer(
  mode: AnswerMode,
): mode is 'type_romaji' | 'type_meaning' {
  switch (mode) {
    case 'choose_kanji':
    case 'choose_hiragana':
    case 'choose_romaji':
    case 'choose_meaning':
    case 'draw_hiragana':
    case 'draw_kanji':
      return false;
    case 'type_romaji':
    case 'type_meaning':
      return true;
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
): string[] {
  switch (questionMode) {
    case 'kanji':
      return [entry.writing];
    case 'hiragana':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, gameMode);
      }
      return entry.readings_hiragana;
    case 'romaji':
      return entry.readings_romaji;
    case 'meaning':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, gameMode);
      }
      return getMeaning(entry, language);
    default:
      assertExhaustive(questionMode);
      return [];
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
): string[] {
  switch (answerMode) {
    case 'choose_kanji':
      return [entry.writing];
    case 'choose_hiragana':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, gameMode);
      }
      return entry.readings_hiragana;
    case 'choose_romaji':
      return entry.readings_romaji;
    case 'choose_meaning':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, gameMode);
      }
      return getMeaning(entry, language);
    case 'type_romaji':
    case 'type_meaning':
    case 'draw_hiragana':
    case 'draw_kanji':
      // This should happen rarely.
      // E.g. we are requesting choices for a question that expects typing.
      // This can be used if the user changes the answer mode mid-round:
      return [entry.writing];
    default:
      assertExhaustive(answerMode);
      return [];
  }
}

/**
 * For a Kana entry, selects appropriate text content for a question.
 * Handles edge cases when you mix together kanji and kana questions.
 */
function getKanaQuestionContent(
  kanaEntry: GameEntry,
  gameMode: GameMode,
): string[] {
  switch (gameMode) {
    case 'reading_to_writing':
    case 'meaning_to_writing':
      // For kana, 'reading' and 'meaning' is always romaji:
      return kanaEntry.readings_romaji;
    case 'writing_to_reading':
    case 'writing_to_meaning':
      return [kanaEntry.writing];
    default:
      assertExhaustive(gameMode);
      return [];
  }
}

/**
 * For a Kana entry, selects appropriate text content for a question.
 * Handles edge cases when you mix together kanji and kana questions.
 */
function getKanaAnswerContent(
  kanaEntry: GameEntry,
  gameMode: GameMode,
): string[] {
  switch (gameMode) {
    case 'reading_to_writing':
    case 'meaning_to_writing':
      return [kanaEntry.writing];
    case 'writing_to_reading':
    case 'writing_to_meaning':
      // For kana, 'reading' and 'meaning' is always romaji:
      return kanaEntry.readings_romaji;
    default:
      assertExhaustive(gameMode);
      return [];
  }
}

function getMeaning(entry: GameEntry, language: Language): string[] {
  if (entry.meanings.size <= 0) return [];
  if (entry.meanings.has(language)) {
    return entry.meanings.get(language) ?? [];
  }
  return [...entry.meanings.values()][0] ?? [];
}

/**
 * Checks if this player's answer is correct.
 * Handles edge cases, e.g. identical reading from the wrong word.
 */
export function isCorrectResponse(
  turn: GameTurn,
  response: PlayerResponse,
): boolean {
  const language = response.language ?? 'en';
  switch (turn.answer_mode) {
    case 'choose_kanji':
    case 'choose_hiragana':
    case 'choose_romaji':
    case 'choose_meaning':
      const userAnswer = turn.choices?.find(
        (c) => c.id === response.answer_entry_id,
      );
      if (!userAnswer) return false;
      return isCorrectChoiceAnswer(turn, userAnswer, language);
    case 'type_romaji':
    case 'type_meaning':
    case 'draw_hiragana':
    case 'draw_kanji':
      // TODO: implement other answer modes
      return false;
    default:
      assertExhaustive(turn.answer_mode);
      return false;
  }
}

/**
 * Checks if the answer is correct. Handles edge cases,
 * e.g. identical reading from the wrong word.
 */
export function isCorrectChoiceAnswer(
  turn: GameTurn,
  answer: GameEntry,
  language: Language,
): boolean {
  // Compare question to answer, based on what they look like,
  // as a question and as an answer:
  const questionContent = getQuestionContent(
    turn.question,
    turn.question_mode,
    turn.game_mode,
    language,
  ).join(', ');
  const trueAnswerContent = getAnswerContent(
    turn.question,
    turn.answer_mode,
    turn.game_mode,
    language,
  ).join(', ');
  const userAnswerQuestionContent = getQuestionContent(
    answer,
    turn.question_mode,
    turn.game_mode,
    language,
  ).join(', ');
  const userAnswerContent = getAnswerContent(
    answer,
    turn.answer_mode,
    turn.game_mode,
    language,
  ).join(', ');
  return (
    questionContent == userAnswerQuestionContent ||
    trueAnswerContent == userAnswerContent
  );
}
