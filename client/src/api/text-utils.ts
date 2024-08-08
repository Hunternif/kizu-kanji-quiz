/**
 * Returns true if the text contains Japanese characters.
 * From https://stackoverflow.com/a/15034560/1093712
 */
export function detectJapanese(text: string) {
  return /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(
    text,
  );
}
