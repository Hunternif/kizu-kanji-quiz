import { open } from 'node:fs/promises';
import { GameEntry, TestGroup } from '../shared/types';
import { assertExhaustive } from '../shared/utils';

/** Provides gama data for the each test group. */
export async function getEntries(group: TestGroup): Promise<Array<GameEntry>> {
  switch (group) {
    case 'hiragana':
      return await getHiraganaEntries();
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
      // Not supported
      return [];
    default:
      assertExhaustive(group);
      return [];
  }
}

/** Prepares entries for game, e.g. randomly sorts them */
export async function getEntriesForGame(
  groups: Iterable<TestGroup>,
): Promise<Array<GameEntry>> {
  const ret = new Array<GameEntry>();
  for (const group of groups) {
    const entries = await getEntries(group);
    ret.push(...entries);
  }
  return ret;
}

export async function getHiraganaEntries(): Promise<Array<GameEntry>> {
  // From https://stackoverflow.com/a/74322357/1093712
  const file = await open(`${__dirname}/../data/hiragana.txt`);
  const entries = new Array<GameEntry>();
  for await (const line of file.readLines()) {
    const [kana, reading] = line.split(' ');
    if (kana && reading) {
      entries.push(
        new GameEntry(
          kana,
          kana,
          kana,
          reading,
          new Map([['english', [reading]]]),
        ),
      );
    }
  }
  return entries;
}
