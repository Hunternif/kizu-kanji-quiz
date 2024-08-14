import {
  GameEntry,
  KanaGroup,
  KanjiGrade,
  KanjiGroup,
  KanjiJlptLevel,
  TestGroup,
  VocabJlptGroup,
} from './types';
import { assertExhaustive } from './utils';

///////////////////////////////////////////////////////////////////////////////
//
//  API related to parsing the kanji & kana .txt data files.
//
///////////////////////////////////////////////////////////////////////////////

/** Basic info about a test group. */
export class TestGroupInfo<T extends TestGroup> {
  public sublabel: string;
  constructor(
    public group: T,
    public label: string,
    public count: number,
    /** Goes into the sublabel, e.g. "145 >>kanji<<" */
    counterName: string,
  ) {
    this.sublabel = `${count} ${counterName}`;
  }
}

export const kanaGroupInfo: Array<TestGroupInfo<KanaGroup>> = [
  new TestGroupInfo('hiragana', 'あ', 73, 'Hiragana'),
  new TestGroupInfo('hiragana_digraphs', 'きゃ', 33, 'Hiragana digraphs'),
  new TestGroupInfo('katakana', 'カ', 74, 'Katakana'),
  new TestGroupInfo('katakana_digraphs', 'キャ', 33, 'Katakana digraphs'),
];
export const kanjiJlptGroupInfo: Array<TestGroupInfo<KanjiJlptLevel>> = [
  new TestGroupInfo('kanji_jlpt_5', 'N5', 80, 'Kanji'),
  new TestGroupInfo('kanji_jlpt_4', 'N4', 166, 'Kanji'),
  new TestGroupInfo('kanji_jlpt_3', 'N3', 371, 'Kanji'),
  new TestGroupInfo('kanji_jlpt_2', 'N2', 367, 'Kanji'),
  new TestGroupInfo('kanji_jlpt_1', 'N1', 985, 'Kanji'),
];
export const kanjiGradeGroupInfo: Array<TestGroupInfo<KanjiGrade>> = [
  new TestGroupInfo('kanji_grade_1', 'Grade 1', 80, 'Kanji'),
  new TestGroupInfo('kanji_grade_2', 'Grade 2', 160, 'Kanji'),
  new TestGroupInfo('kanji_grade_3', 'Grade 3', 200, 'Kanji'),
  new TestGroupInfo('kanji_grade_4', 'Grade 4', 202, 'Kanji'),
  new TestGroupInfo('kanji_grade_5', 'Grade 5', 193, 'Kanji'),
  new TestGroupInfo('kanji_grade_6', 'Grade 6', 191, 'Kanji'),
  new TestGroupInfo('kanji_grade_S', 'Secondary school', 1110, 'kanji'),
];

export const vocabJlptGroupInfo: Array<TestGroupInfo<VocabJlptGroup>> = [
  new TestGroupInfo('vocab_n5', 'N5', 669, 'words'),
  new TestGroupInfo('vocab_n4', 'N4', 663, 'words'),
  new TestGroupInfo('vocab_n3', 'N3', 1830, 'words'),
  new TestGroupInfo('vocab_n2', 'N2', 1832, 'words'),
  new TestGroupInfo('vocab_n1', 'N1', 3472, 'words'),
];

export function isKanaGroup(group: TestGroup): group is KanaGroup {
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

export function isKanjiGroup(group: TestGroup): group is KanjiGroup {
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

export function isVocabGroup(group: TestGroup): group is VocabJlptGroup {
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

/** Parses a Hiragana / Katakana data file. */
export function parseKanaFile(
  content: string,
  groups: KanaGroup[],
): Array<GameEntry> {
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

/** Parses a 'vocab_n*.txt' data file. */
export function parseVocabFile(
  content: string,
  groups: VocabJlptGroup[],
): Array<GameEntry> {
  const entries = new Array<GameEntry>();
  for (const line of content.split(/\r?\n/)) {
    const [kanji, hiragana, romaji, meanings] = line.split('\t');
    const writing = kanji.length > 0 ? kanji : hiragana;
    entries.push(
      new GameEntry(
        `word_${writing}`,
        0,
        writing,
        hiragana.split(', '),
        romaji.split(', '),
        new Map([['en', meanings.split(', ')]]),
        groups,
      ),
    );
  }
  return entries;
}
