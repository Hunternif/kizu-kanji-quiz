import {
  parseKanaFile,
  parseKanjiFile,
  parseVocabFile,
  vocabJlptGroupInfo,
} from '../shared/kanji-data-api';
import { GameEntry, VocabJlptGroup } from '../shared/types';

/** Maps entry ID to entry. */
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
  function addEntries(entries: GameEntry[]) {
    entries.forEach((e) => entryCache.set(e.id, e));
  }
  addEntries(parseKanaFile(hiraganaFile, ['hiragana']));
  addEntries(parseKanaFile(hiraganaDiFile, ['hiragana_digraphs']));
  addEntries(parseKanaFile(katakanaFile, ['katakana']));
  addEntries(parseKanaFile(katakanaDiFile, ['katakana_digraphs']));
  addEntries(parseKanjiFile(kanjiFile));
  fetchingLock = false;
  return entryCache;
}

/** Separate vocab cache. Maps group to entry ID to entry. */
const vocabCache: Map<VocabJlptGroup, Map<string, GameEntry>> = new Map(
  vocabJlptGroupInfo.map((g) => [g.group, new Map()]),
);

/** Loads Vocab data for the given group and caches it. */
export async function loadVocabData(
  group: VocabJlptGroup,
): Promise<Map<string, GameEntry>> {
  let groupCache = vocabCache.get(group)!;
  if (groupCache.size > 0 || fetchingLock) {
    return groupCache;
  }
  fetchingLock = true;
  const groupFile = await fetchFile(`${group}.txt`);
  parseVocabFile(groupFile, [group]).forEach((e) => groupCache.set(e.id, e));
  fetchingLock = false;
  return groupCache;
}

async function fetchFile(fileName: string): Promise<string> {
  const response = await fetch(`${window.location.origin}/data/${fileName}`);
  return await response.text();
}
