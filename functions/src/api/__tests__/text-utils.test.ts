import {
  detectJapanese,
  detectKana,
  detectKanji,
  isKanaOnly,
} from '../../shared/text-utils';

test('detect japanese text', () => {
  expect(detectJapanese('kanji')).toBe(false);
  expect(detectJapanese('漢字')).toBe(true);
  expect(detectJapanese('ひらがな')).toBe(true);
  expect(detectJapanese('カタカナ')).toBe(true);
  expect(detectJapanese('ひらがなカタカナ')).toBe(true);
  expect(detectJapanese('ひらがな漢字')).toBe(true);
  expect(detectJapanese('English ひらがな漢字 lol')).toBe(true);
  expect(detectJapanese('😎')).toBe(false);
});

test('detect Kana', () => {
  expect(detectKana('kanji')).toBe(false);
  expect(detectKana('漢字')).toBe(false);
  expect(detectKana('ひらがな')).toBe(true);
  expect(detectKana('カタカナ')).toBe(true);
  expect(detectKana('ひらがなカタカナ')).toBe(true);
  expect(detectKana('ひらがな漢字')).toBe(true);
  expect(detectKana('English ひらがな漢字 lol')).toBe(true);
  expect(detectKana('😎')).toBe(false);
});

test('detect Kanji', () => {
  expect(detectKanji('kanji')).toBe(false);
  expect(detectKanji('漢字')).toBe(true);
  expect(detectKanji('ひらがな')).toBe(false);
  expect(detectKanji('カタカナ')).toBe(false);
  expect(detectKanji('ひらがなカタカナ')).toBe(false);
  expect(detectKanji('ひらがな漢字')).toBe(true);
  expect(detectKanji('English ひらがな漢字 lol')).toBe(true);
  expect(detectKanji('😎')).toBe(false);
});

test('detect Kana only', () => {
  expect(isKanaOnly('kanji')).toBe(false);
  expect(isKanaOnly('漢字')).toBe(false);
  expect(isKanaOnly('ひらがな')).toBe(true);
  expect(isKanaOnly('カタカナ')).toBe(true);
  expect(isKanaOnly('ひらがなカタカナ')).toBe(true);
  expect(isKanaOnly('ひらがな漢字')).toBe(false);
  expect(isKanaOnly('English ひらがな漢字 lol')).toBe(false);
  expect(isKanaOnly('😎')).toBe(false);
});