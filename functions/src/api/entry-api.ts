import { open } from 'node:fs/promises';
import {
  parseKanaFile,
  parseKanjiFile,
  parseVocabFile,
} from '../shared/kanji-data-api';
import { RNG } from '../shared/rng';
import {
  GameEntry,
  KanaGroup,
  KanjiGroup,
  TestGroup,
  VocabJlptGroup,
} from '../shared/types';
import { assertExhaustive } from '../shared/utils';

function isKanaGroup(group: TestGroup): group is KanaGroup {
  switch (group) {
    case 'hiragana':
    case 'hiragana_digraphs':
    case 'katakana':
    case 'katakana_digraphs':
      return true;
    case 'kanji_grade_1':
    case 'kanji_grade_2':
    case 'kanji_grade_3':
    case 'kanji_grade_4':
    case 'kanji_grade_5':
    case 'kanji_grade_6':
    case 'kanji_grade_S':
    case 'kanji_jlpt_1':
    case 'kanji_jlpt_2':
    case 'kanji_jlpt_3':
    case 'kanji_jlpt_4':
    case 'kanji_jlpt_5':
    case 'vocab_n5':
    case 'vocab_n4':
    case 'vocab_n3':
    case 'vocab_n2':
    case 'vocab_n1':
      return false;
    default:
      assertExhaustive(group);
      return false;
  }
}

function isKanjiGroup(group: TestGroup): group is KanjiGroup {
  switch (group) {
    case 'hiragana':
    case 'hiragana_digraphs':
    case 'katakana':
    case 'katakana_digraphs':
      return false;
    case 'kanji_grade_1':
    case 'kanji_grade_2':
    case 'kanji_grade_3':
    case 'kanji_grade_4':
    case 'kanji_grade_5':
    case 'kanji_grade_6':
    case 'kanji_grade_S':
    case 'kanji_jlpt_1':
    case 'kanji_jlpt_2':
    case 'kanji_jlpt_3':
    case 'kanji_jlpt_4':
    case 'kanji_jlpt_5':
      return true;
    case 'vocab_n5':
    case 'vocab_n4':
    case 'vocab_n3':
    case 'vocab_n2':
    case 'vocab_n1':
      return false;
    default:
      assertExhaustive(group);
      return false;
  }
}

function isVocabGroup(group: TestGroup): group is VocabJlptGroup {
  switch (group) {
    case 'hiragana':
    case 'hiragana_digraphs':
    case 'katakana':
    case 'katakana_digraphs':
    case 'kanji_grade_1':
    case 'kanji_grade_2':
    case 'kanji_grade_3':
    case 'kanji_grade_4':
    case 'kanji_grade_5':
    case 'kanji_grade_6':
    case 'kanji_grade_S':
    case 'kanji_jlpt_1':
    case 'kanji_jlpt_2':
    case 'kanji_jlpt_3':
    case 'kanji_jlpt_4':
    case 'kanji_jlpt_5':
      return false;
    case 'vocab_n5':
    case 'vocab_n4':
    case 'vocab_n3':
    case 'vocab_n2':
    case 'vocab_n1':
      return true;
    default:
      assertExhaustive(group);
      return false;
  }
}

async function getKanaEntries(group: KanaGroup): Promise<Array<GameEntry>> {
  switch (group) {
    case 'hiragana':
      return await getHiraganaEntries();
    case 'hiragana_digraphs':
      return await getHiraganaDigraphEntries();
    case 'katakana':
      return await getKatakanaEntries();
    case 'katakana_digraphs':
      return await getKatakanaDigraphEntries();
    default:
      assertExhaustive(group);
      return [];
  }
}

/** Parses the 'vocab_n*.txt' data files. */
export async function getVocabEntries(
  group: VocabJlptGroup,
): Promise<Array<GameEntry>> {
  let content: string;
  switch (group) {
    case 'vocab_n5':
      content = await readFile(`${__dirname}/../data/vocab_n5.txt`);
      break;
    case 'vocab_n4':
      content = await readFile(`${__dirname}/../data/vocab_n4.txt`);
      break;
    case 'vocab_n3':
      content = await readFile(`${__dirname}/../data/vocab_n3.txt`);
      break;
    case 'vocab_n2':
      content = await readFile(`${__dirname}/../data/vocab_n2.txt`);
      break;
    case 'vocab_n1':
      content = await readFile(`${__dirname}/../data/vocab_n1.txt`);
      break;
    default:
      assertExhaustive(group);
      return [];
  }
  return parseVocabFile(content, [group]);
}

/** Prepares entries for game, e.g. randomly sorts them. */
export async function getEntriesForGame(
  groups: TestGroup[],
): Promise<Array<GameEntry>> {
  const entries = new Array<GameEntry>();
  const rng = RNG.fromTimestamp();
  // kanji should be filtered together, because there are so many:
  const kanjiGroups = groups.filter(isKanjiGroup);
  const kanaGroups = groups.filter(isKanaGroup);
  const vocabGroups = groups.filter(isVocabGroup);
  for (const group of kanaGroups) {
    entries.push(...(await getKanaEntries(group)));
  }
  entries.push(...(await getKanjiEntries(kanjiGroups)));
  for (const group of vocabGroups) {
    entries.push(...(await getVocabEntries(group)));
  }
  for (const entry of entries) {
    entry.random_index = rng.randomInt();
  }
  // Sort high to low, highest "random index" goes first:
  entries.sort((a, b) => b.random_index - a.random_index);
  return entries;
}

export async function getHiraganaEntries(): Promise<Array<GameEntry>> {
  return await loadKanaFile(`${__dirname}/../data/hiragana.txt`, ['hiragana']);
}

export async function getHiraganaDigraphEntries(): Promise<Array<GameEntry>> {
  return await loadKanaFile(`${__dirname}/../data/hiragana_digraphs.txt`, [
    'hiragana_digraphs',
  ]);
}

export async function getKatakanaEntries(): Promise<Array<GameEntry>> {
  return await loadKanaFile(`${__dirname}/../data/katakana.txt`, ['katakana']);
}

export async function getKatakanaDigraphEntries(): Promise<Array<GameEntry>> {
  return await loadKanaFile(`${__dirname}/../data/katakana_digraphs.txt`, [
    'katakana_digraphs',
  ]);
}

/** Parses a Hiragana / Katakana data file. */
async function loadKanaFile(
  path: string,
  groups: KanaGroup[],
): Promise<Array<GameEntry>> {
  const content = await readFile(path);
  return parseKanaFile(content, groups);
}

/** Parsese the kanji file and filters matching entries. */
export async function getKanjiEntries(
  groups: KanjiGroup[],
): Promise<Array<GameEntry>> {
  return (await loadKanjiFile()).filter((k) =>
    k.groups.find((g) => groups.find((g2) => g2 == g)),
  );
}

/** Parses the kanji file 'jouyou_kanji_eng.txt' */
export async function loadKanjiFile(): Promise<Array<GameEntry>> {
  const content = await readFile(`${__dirname}/../data/jouyou_kanji_eng.txt`);
  return parseKanjiFile(content);
}

/** Reads the entire file to string. */
async function readFile(path: string): Promise<string> {
  const file = await open(path);
  return (await file.readFile()).toString();
}

/** Reads a text file line by line and calls the callback on each line. */
async function forEachLineInFile(
  path: string,
  callback: (line: string, index: number) => void,
) {
  // From https://stackoverflow.com/a/74322357/1093712
  const file = await open(path);
  let i = 0;
  for await (const line of file.readLines()) {
    callback(line, i);
    i++;
  }
}
