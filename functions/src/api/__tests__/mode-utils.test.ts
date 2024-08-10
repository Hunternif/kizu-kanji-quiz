import { isCorrectAnswer, isCorrectResponse } from '../../shared/mode-utils';
import { GameTurn, PlayerResponse } from '../../shared/types';
import { getHiraganaEntries, getKatakanaEntries } from '../entry-api';

test('check answer correctness, when questions match', async () => {
  const hiragana = await getHiraganaEntries();
  const katakana = await getKatakanaEntries();
  const turn = new GameTurn(
    'turn_01',
    1,
    new Date(),
    'reading_to_writing',
    'romaji',
    'choose_kanji',
    // Question: 'u'
    hiragana[2],
    // Answers: 'う', 'ウ', 'そ'
    [hiragana[2], katakana[2], hiragana[20]],
  );

  const response1 = new PlayerResponse(
    'player_1',
    'Tsukasa',
    new Date(),
    'en',
    // 'あ' - non-existent answer
    hiragana[0].id,
  );
  const response2 = new PlayerResponse(
    'player_2',
    'Kagamin',
    new Date(),
    'en',
    // 'う' - valid hiragana answwer
    hiragana[2].id,
  );
  const response3 = new PlayerResponse(
    'player_3',
    'Miyuki-san',
    new Date(),
    'en',
    // 'ウ' - valid katakana answer
    katakana[2].id,
  );
  const response4 = new PlayerResponse(
    'player_4',
    'konata',
    new Date(),
    'en',
    // 'そ' - incorrect choice answer
    hiragana[20].id,
  );

  expect(isCorrectResponse(turn, response1)).toBe(false);
  expect(isCorrectResponse(turn, response2)).toBe(true);
  expect(isCorrectResponse(turn, response3)).toBe(true);
  expect(isCorrectResponse(turn, response4)).toBe(false);
});

test('check answer correctness, when answers match', async () => {
  const hiragana = await getHiraganaEntries();
  const katakana = await getKatakanaEntries();
  const turn = new GameTurn(
    'turn_02',
    2,
    new Date(),
    'writing_to_reading',
    'kanji',
    'choose_romaji',
    // Question: 'が'
    hiragana[10],
    // Answers: 'ga', 'ga', 'zo'
    [hiragana[10], katakana[10], hiragana[24]],
  );

  // Non-existent answer:
  expect(isCorrectAnswer(turn, hiragana[0], 'en')).toBe(false);
  // Valid hiragana answwer:
  expect(isCorrectAnswer(turn, hiragana[10], 'en')).toBe(true);
  // Valid katakana answer:
  expect(isCorrectAnswer(turn, katakana[10], 'en')).toBe(true);
  // Incorrect choice answer:
  expect(isCorrectAnswer(turn, hiragana[24], 'en')).toBe(false);
});
