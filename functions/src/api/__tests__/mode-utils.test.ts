import { isCorrectResponse } from '../../shared/mode-utils';
import { GameTurn, PlayerResponse } from '../../shared/types';
import { getHiraganaEntries, getKatakanaEntries } from '../entry-api';

test('check answer correctness', async () => {
  const hiragana = await getHiraganaEntries();
  const katakana = await getKatakanaEntries();
  const turn = new GameTurn(
    'turn_01',
    1,
    new Date(),
    'writing_to_reading',
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
    'english',
    // 'あ' - non-existent answer
    hiragana[0].id,
  );
  const response2 = new PlayerResponse(
    'player_2',
    'Kagamin',
    new Date(),
    'english',
    // 'う' - valid hiragana answwer
    hiragana[2].id,
  );
  const response3 = new PlayerResponse(
    'player_3',
    'Miyuki-san',
    new Date(),
    'english',
    // 'ウ' - valid katakana answer
    katakana[2].id,
  );
  const response4 = new PlayerResponse(
    'player_4',
    'konata',
    new Date(),
    'english',
    // 'そ' - incorrect choice answer
    hiragana[20].id,
  );

  expect(isCorrectResponse(turn, response1)).toBe(false);
  expect(isCorrectResponse(turn, response2)).toBe(true);
  expect(isCorrectResponse(turn, response3)).toBe(true);
  expect(isCorrectResponse(turn, response4)).toBe(false);
});
