import {
  isCorrectChoiceAnswer,
  isCorrectResponse,
} from '../../shared/mode-utils';
import { GameEntry, GameTurn, PlayerResponse } from '../../shared/types';
import { getHiraganaEntries, getKatakanaEntries } from '../entry-api';

test('check answer correctness, when questions match', async () => {
  const hiragana = await getHiraganaEntries();
  const katakana = await getKatakanaEntries();
  const turn = new GameTurn(
    'turn_01',
    1,
    new Date(),
    'romaji',
    'choose_kanji',
    // Question: 'u'
    hiragana[2],
    // Answers: 'う', 'ウ', 'そ'
    [hiragana[2], katakana[2], hiragana[20]],
  );

  // 'あ' - non-existent answer:
  expect(isCorrectResponse(turn, choiceResponse(hiragana[0].id))).toBe(false);
  // 'う' - valid hiragana answer:
  expect(isCorrectResponse(turn, choiceResponse(hiragana[2].id))).toBe(true);
  // 'ウ' - valid katakana answer:
  expect(isCorrectResponse(turn, choiceResponse(katakana[2].id))).toBe(true);
  // 'そ' - incorrect choice answer:
  expect(isCorrectResponse(turn, choiceResponse(hiragana[20].id))).toBe(false);
});

test('check answer correctness, when answers match', async () => {
  const hiragana = await getHiraganaEntries();
  const katakana = await getKatakanaEntries();
  const turn = new GameTurn(
    'turn_02',
    2,
    new Date(),
    'kanji',
    'choose_romaji',
    // Question: 'が'
    hiragana[10],
    // Answers: 'ga', 'ga', 'zo'
    [hiragana[10], katakana[10], hiragana[24]],
  );

  // Non-existent answer:
  expect(isCorrectChoiceAnswer(turn, hiragana[0], 'en')).toBe(false);
  // Valid hiragana answer:
  expect(isCorrectChoiceAnswer(turn, hiragana[10], 'en')).toBe(true);
  // Valid katakana answer:
  expect(isCorrectChoiceAnswer(turn, katakana[10], 'en')).toBe(true);
  // Incorrect choice answer:
  expect(isCorrectChoiceAnswer(turn, hiragana[24], 'en')).toBe(false);
});

test('check text answer', async () => {
  const question = new GameEntry(
    '0001',
    0,
    '山',
    ['サン', 'やま'],
    ['san', 'yama'],
    new Map([['en', ['mountain', 'mount', 'hill (a really tall one)']]]),
    ['kanji_grade_1'],
  );
  const turn = new GameTurn(
    'turn_02',
    2,
    new Date(),
    'kanji',
    'type_romaji',
    question,
  );

  turn.answer_mode = 'type_romaji';
  // Non-existent romaji answer:
  expect(isCorrectResponse(turn, typedResponse('12345'))).toBe(false);
  // Valid romaji answers:
  expect(isCorrectResponse(turn, typedResponse('san'))).toBe(true);
  expect(isCorrectResponse(turn, typedResponse('yama'))).toBe(true);

  turn.answer_mode = 'type_meaning';
  // Non-existent meaning answer:
  expect(isCorrectResponse(turn, typedResponse('what'))).toBe(false);
  // Valid meaning answers:
  expect(isCorrectResponse(turn, typedResponse('mountain'))).toBe(true);
  expect(isCorrectResponse(turn, typedResponse('mount'))).toBe(true);
  // Valid meaning answer with removed filler:
  expect(isCorrectResponse(turn, typedResponse('hill'))).toBe(true);
});

function choiceResponse(entryID: string) {
  return new PlayerResponse(
    'player_1',
    'Chooser',
    'turn_01',
    'answering',
    new Date(),
    'en',
    entryID,
  );
}

function typedResponse(text: string) {
  return new PlayerResponse(
    'player_2',
    'Typer',
    'turn_01',
    'answering',
    new Date(),
    'en',
    undefined,
    text,
  );
}
