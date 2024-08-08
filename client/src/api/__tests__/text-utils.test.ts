import { expect, test } from "vitest";
import { detectJapanese } from "../text-utils";

test('detect japanese text', () => {
  expect(detectJapanese('kanji')).toBe(false);
  expect(detectJapanese('漢字')).toBe(true);
  expect(detectJapanese('ひらがな')).toBe(true);
  expect(detectJapanese('ひらがな漢字')).toBe(true);
  expect(detectJapanese('English ひらがな漢字 lol')).toBe(true);
  expect(detectJapanese('😎')).toBe(false);
})