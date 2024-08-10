import {
  AnswerMode,
  GameEntry,
  GameMode,
  GameTurn,
  Language,
  noData,
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
): string {
  switch (questionMode) {
    case 'kanji':
      return entry.writing;
    case 'hiragana':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, gameMode);
      }
      return entry.readings_hiragana.join(' ');
    case 'romaji':
      return entry.readings_romaji.join(' ');
    case 'meaning':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, gameMode);
      }
      return getMeaning(entry, language).join(', ');
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
      return entry.readings_hiragana.join(', ');
    case 'choose_romaji':
      return entry.readings_romaji.join(', ');
    case 'choose_meaning':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, gameMode);
      }
      return getMeaning(entry, language).join(', ');
    case 'type_romaji':
    case 'type_meaning':
    case 'draw_hiragana':
    case 'draw_kanji':
      // This should happen rarely.
      // E.g. we are requesting choices for a question that expects typing.
      // This can be used if the user changes the answer mode mid-round:
      return entry.writing;
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
      return kanaEntry.readings_romaji.join(', ');
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
      return kanaEntry.readings_romaji.join(', ');
    default:
      assertExhaustive(gameMode);
      return noData;
  }
}

function getMeaning(entry: GameEntry, language: Language): string[] {
  if (entry.meanings.size <= 0) return [noData];
  if (entry.meanings.has(language)) {
    return entry.meanings.get(language) ?? [noData];
  }
  return [...entry.meanings.values()][0] ?? [noData];
}

/**
 * Checks if this player's answer is correct.
 * Delegates to `isCorrectAnswer()`.
 */
export function isCorrectResponse(
  turn: GameTurn,
  response: PlayerResponse,
): boolean {
  const userAnswer = turn.choices?.find(
    (c) => c.id === response.answer_entry_id,
  );
  if (!userAnswer) return false;
  return isCorrectAnswer(turn, userAnswer, response.language ?? 'en');
}

/**
 * Checks if the answer is correct. Handles edge cases,
 * e.g. identical reading from the wrong word.
 */
export function isCorrectAnswer(
  turn: GameTurn,
  answer: GameEntry,
  language: Language,
): boolean {
  if (isChoiceAnswer(turn.answer_mode)) {
    // Compare question to answer, based on what they look like,
    // as a question and as an answer:
    const questionContent = getQuestionContent(
      turn.question,
      turn.question_mode,
      turn.game_mode,
      language,
    );
    const trueAnswerContent = getAnswerContent(
      turn.question,
      turn.answer_mode,
      turn.game_mode,
      language,
    );
    const userAnswerQuestionContent = getQuestionContent(
      answer,
      turn.question_mode,
      turn.game_mode,
      language,
    );
    const userAnswerContent = getAnswerContent(
      answer,
      turn.answer_mode,
      turn.game_mode,
      language,
    );
    return (
      questionContent == userAnswerQuestionContent ||
      trueAnswerContent == userAnswerContent
    );
  } else {
    // TODO: implement other answer modes
    return false;
  }
}
