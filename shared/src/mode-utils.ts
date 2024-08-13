import { removeFillerText } from './text-utils';
import {
  AnswerMode,
  GameEntry,
  GameTurn,
  Language,
  PlayerResponse,
  QuestionMode,
} from './types';
import { assertExhaustive } from './utils';

/** Returns valid question modes given answer mode */
export function getValidQuestionModes(answerMode: AnswerMode): QuestionMode[] {
  const validQuestionModes: Array<QuestionMode> = [];
  switch (answerMode) {
    case 'choose_kanji':
    case 'draw_kanji':
      validQuestionModes.push('hiragana', 'romaji', 'meaning');
      break;
    case 'choose_hiragana':
    case 'draw_hiragana':
      validQuestionModes.push('kanji', 'romaji', 'meaning');
      break;
    case 'choose_romaji':
    case 'type_romaji':
      validQuestionModes.push('kanji', 'hiragana', 'meaning');
      break;
    case 'choose_meaning':
    case 'type_meaning':
      validQuestionModes.push('kanji', 'hiragana', 'romaji');
      break;
    default:
      assertExhaustive(answerMode);
  }
  return validQuestionModes;
}

/** Returns valid answer modes given question mode */
export function getValidAnswerModes(questionMode: QuestionMode): AnswerMode[] {
  const validAnswerModes: Array<AnswerMode> = [];
  switch (questionMode) {
    case 'kanji':
      validAnswerModes.push(
        'choose_hiragana',
        'choose_romaji',
        'choose_meaning',
        'type_romaji',
        'type_meaning',
        // 'draw_hiragana', // not supported yet
      );
      break;
    case 'hiragana':
      validAnswerModes.push(
        'choose_kanji',
        'choose_romaji',
        'choose_meaning',
        'type_romaji',
        'type_meaning',
        // 'draw_kanji' // not supported yet
      );
      break;
    case 'romaji':
      validAnswerModes.push(
        'choose_kanji',
        'choose_hiragana',
        'choose_meaning',
        'type_meaning',
        // 'draw_hiragana', // not supported yet
        // 'draw_kanji', // not supported yet
      );
      break;
    case 'meaning':
      validAnswerModes.push(
        'choose_kanji',
        'choose_hiragana',
        'choose_romaji',
        'type_romaji',
        // 'draw_hiragana', // not supported yet
        // 'draw_kanji', // not supported yet
      );
      break;
    default:
      assertExhaustive(questionMode);
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
  answerMode: AnswerMode,
  language: Language,
): string[] {
  switch (questionMode) {
    case 'kanji':
      return [entry.writing];
    case 'hiragana':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, questionMode, answerMode);
      }
      return entry.readings_hiragana;
    case 'romaji':
      return entry.readings_romaji;
    case 'meaning':
      if (entry.isKana) {
        return getKanaQuestionContent(entry, questionMode, answerMode);
      }
      return getEntryMeaning(entry, language);
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
  questionMode: QuestionMode,
  answerMode: AnswerMode,
  language: Language,
): string[] {
  switch (answerMode) {
    case 'choose_kanji':
      return [entry.writing];
    case 'choose_hiragana':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, questionMode, answerMode);
      }
      return entry.readings_hiragana;
    case 'choose_romaji':
      return entry.readings_romaji;
    case 'choose_meaning':
      if (entry.isKana) {
        return getKanaAnswerContent(entry, questionMode, answerMode);
      }
      return getEntryMeaning(entry, language);
    case 'type_romaji':
      return entry.readings_romaji;
    case 'type_meaning':
      return getEntryMeaning(entry, language);
    case 'draw_hiragana':
    case 'draw_kanji':
      // Unsupported mode.
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
  questionMode: QuestionMode,
  answerMode: AnswerMode,
): string[] {
  switch (questionMode) {
    case 'kanji':
    case 'hiragana':
      return [kanaEntry.writing];
    case 'romaji':
    case 'meaning':
      // For kana, 'reading' and 'meaning' are romaji:
      return kanaEntry.readings_romaji;
    default:
      assertExhaustive(questionMode);
      return [];
  }
}

/**
 * For a Kana entry, selects appropriate text content for a question.
 * Handles edge cases when you mix together kanji and kana questions.
 */
function getKanaAnswerContent(
  kanaEntry: GameEntry,
  questionMode: QuestionMode,
  answerMode: AnswerMode,
): string[] {
  switch (answerMode) {
    case 'choose_kanji':
    case 'choose_hiragana':
      return [kanaEntry.writing];
    case 'choose_romaji':
    case 'choose_meaning':
    case 'type_romaji':
    case 'type_meaning':
      // For kana, 'reading' and 'meaning' are romaji:
      return kanaEntry.readings_romaji;
    case 'draw_hiragana':
    case 'draw_kanji':
      return []; // unsupported
    default:
      assertExhaustive(answerMode);
      return [];
  }
}

export function getEntryMeaning(
  entry: GameEntry,
  language: Language,
): string[] {
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
  const userChoice = turn.choices?.find(
    (c) => c.id === response.answer_entry_id,
  );
  const userText = response.answer_typed;
  switch (turn.answer_mode) {
    case 'choose_kanji':
    case 'choose_hiragana':
    case 'choose_romaji':
    case 'choose_meaning':
      if (userChoice == null) return false;
      return isCorrectChoiceAnswer(turn, userChoice, language);
    case 'type_romaji':
    case 'type_meaning':
      if (userText == null) return false;
      return isCorrectTypedAnswer(turn, userText, language);
    case 'draw_hiragana':
    case 'draw_kanji':
      // TODO: implement other answer modes
      return false;
    default:
      assertExhaustive(turn.answer_mode);
      return false;
  }
}

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
    turn.answer_mode,
    language,
  ).join(', ');
  const trueAnswerContent = getAnswerContent(
    turn.question,
    turn.question_mode,
    turn.answer_mode,
    language,
  ).join(', ');
  const userAnswerQuestionContent = getQuestionContent(
    answer,
    turn.question_mode,
    turn.answer_mode,
    language,
  ).join(', ');
  const userAnswerContent = getAnswerContent(
    answer,
    turn.question_mode,
    turn.answer_mode,
    language,
  ).join(', ');
  return (
    questionContent.toLowerCase() == userAnswerQuestionContent.toLowerCase() ||
    trueAnswerContent.toLowerCase() == userAnswerContent.toLowerCase()
  );
}

function isCorrectTypedAnswer(
  turn: GameTurn,
  text: string,
  language: Language,
): boolean {
  // Compare question to answer:
  const trueAnswerContent = getAnswerContent(
    turn.question,
    turn.question_mode,
    turn.answer_mode,
    language,
  );
  text = removeFillerText(text, language);
  return (
    trueAnswerContent.find((t) => removeFillerText(t, language) == text) != null
  );
}
