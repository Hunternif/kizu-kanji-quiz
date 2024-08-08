import { getHiraganaEntries } from '../entry-api';

test('parse Hiragana', async () => {
  const hiragana = await getHiraganaEntries();
  expect(hiragana.length).toBe(73);
  expect(hiragana[0].writing).toBe('あ');
  expect(hiragana[0].reading_romaji).toBe('a');
  expect(hiragana[1].writing).toBe('い');
  expect(hiragana[1].reading_romaji).toBe('i');
  expect(hiragana[72].writing).toBe('ん');
  expect(hiragana[72].reading_romaji).toBe('n');
});
