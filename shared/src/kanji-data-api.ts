import { GameEntry, KanaGroup, KanjiGroup, TestGroup } from './types';

///////////////////////////////////////////////////////////////////////////////
//
//  API related to parsing the kanji & kana .txt data files.
//
///////////////////////////////////////////////////////////////////////////////

/** Parses a Hiragana / Katakana data file. */
export async function parseKanaFile(
  content: string,
  groups: KanaGroup[],
): Promise<Array<GameEntry>> {
  const entries = new Array<GameEntry>();
  for (const line of content.split(/\r?\n/)) {
    const [kana, reading] = line.split(' ');
    if (kana && reading) {
      entries.push(
        new GameEntry(kana, 0, kana, [kana], [reading], new Map(), groups),
      );
    }
  }
  return entries;
}

/** Parsese the kanji file and filters matching entries. */
export function getKanjiEntries(
  content: string,
  groups: KanjiGroup[],
): Array<GameEntry> {
  return parseKanjiFile(content).filter((k) =>
    k.groups.find((g: TestGroup) => groups.find((g2) => g2 == g)),
  );
}

/** Parses the kanji file 'jouyou_kanji_eng.txt' */
export function parseKanjiFile(content: string): Array<GameEntry> {
  const entries = new Array<GameEntry>();
  for (const line of content.split(/\r?\n/)) {
    const [kanji, grade, jlpt, kanaReadings, romaji, meanings] =
      line.split('\t');
    const groups = new Array<KanjiGroup>();
    switch (grade) {
      case '1':
        groups.push('kanji_grade_1');
        break;
      case '2':
        groups.push('kanji_grade_2');
        break;
      case '3':
        groups.push('kanji_grade_3');
        break;
      case '4':
        groups.push('kanji_grade_4');
        break;
      case '5':
        groups.push('kanji_grade_5');
        break;
      case '6':
        groups.push('kanji_grade_6');
        break;
      case 'S':
        groups.push('kanji_grade_S');
        break;
    }
    switch (jlpt) {
      case 'N5':
        groups.push('kanji_jlpt_5');
        break;
      case 'N4':
        groups.push('kanji_jlpt_4');
        break;
      case 'N3':
        groups.push('kanji_jlpt_3');
        break;
      case 'N2':
        groups.push('kanji_jlpt_2');
        break;
      case 'N1':
        groups.push('kanji_jlpt_1');
        break;
    }
    entries.push(
      new GameEntry(
        kanji,
        0,
        kanji,
        kanaReadings.split(', '),
        romaji.split(', '),
        new Map([['en', meanings.split(', ')]]),
        groups,
      ),
    );
  }
  return entries;
}
