import { parseKanaFile, parseKanjiFile } from '../shared/kanji-data-api';
import { GameEntry } from '../shared/types';

/** Maps entry writing to entry. */
const entryCache: Map<string, GameEntry> = new Map();
let fetchingLock = false;

/** Loads kana & kanji data for *all* entries, and caches it locally. */
export async function loadAllKanjiData(): Promise<Map<string, GameEntry>> {
  if (entryCache.size > 0 || fetchingLock) {
    return entryCache;
  }
  fetchingLock = true;
  const hiraganaFile = await fetchFile('hiragana.txt');
  const hiraganaDiFile = await fetchFile('hiragana_digraphs.txt');
  const katakanaFile = await fetchFile('katakana.txt');
  const katakanaDiFile = await fetchFile('katakana_digraphs.txt');
  const kanjiFile = await fetchFile('jouyou_kanji_eng.txt');
  addEntries(parseKanaFile(hiraganaFile, ['hiragana']));
  addEntries(parseKanaFile(hiraganaDiFile, ['hiragana_digraphs']));
  addEntries(parseKanaFile(katakanaFile, ['katakana']));
  addEntries(parseKanaFile(katakanaDiFile, ['katakana_digraphs']));
  addEntries(parseKanjiFile(kanjiFile));
  fetchingLock = false;
  return entryCache;
}

function addEntries(entries: GameEntry[]) {
  entries.forEach((e) => entryCache.set(e.writing, e));
}

async function fetchFile(fileName: string): Promise<string> {
  const response = await fetch(`${window.location.origin}/data/${fileName}`);
  return await response.text();
}
