import { Language } from './types';
import { assertExhaustive } from './utils';

/**
 * Returns true if the text contains Japanese characters.
 * From https://stackoverflow.com/a/15034560/1093712
 */
export function detectJapanese(text: string) {
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(
    text,
  );
}

/**
 * Returns true if the text contains Hiragana or Katakana.
 * From https://stackoverflow.com/a/15034560/1093712
 */
export function detectKana(text: string) {
  return /[\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f]/.test(text);
}

/**
 * Returns true if the text contains Kanji.
 * From https://stackoverflow.com/a/15034560/1093712
 */
export function detectKanji(text: string) {
  return /[\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
}

/**
 * Returns true if the text contains Kana but not Kanji.
 * Useful for detecting kana-only questions, but not words with okurigana.
 */
export function isKanaOnly(text: string) {
  return detectKana(text) && !detectKanji(text);
}

const regexWordInBracketsAfter = /(.+)([([{（［｛].+[)\]}）］｝].*)/g;
const regexWordInBracketsBefore = /(.*)([([{（［｛].+[)\]}）］｝])(.+)/g;
const regexPunctuation =
  /["'«».,:;!?&%*\-~()[\]{}（）「」【】［］｛｝：！？、，。]/g;
const regexEnglishFillers = /(the|of|a|to|in|on|for|or)\s+/g;

/**
 * Removes words like 'the' to improve correctness check.
 * Also removes whitespace.
 */
export function removeFillerText(text: string, language: Language): string {
  text = text.toLowerCase();
  // Remove optional parts in brackets: "minute (of time)".
  // But not if that's the entire word: "（shin）".
  text = text.replace(regexWordInBracketsAfter, '$1');
  text = text.replace(regexWordInBracketsBefore, '$1 $3');
  // Remove punctuation
  text = text.replace(regexPunctuation, '');
  // Remove language-specific filler words:
  switch (language) {
    case 'en':
      text = text.replace(regexEnglishFillers, '');
      break;
    default:
      assertExhaustive(language);
      break;
  }
  // remove whitespace:
  text = text.replace(/\s+/g, '');
  return text;
}
