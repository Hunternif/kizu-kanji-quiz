import { open } from 'node:fs/promises';
import { getAnswerContent } from '../shared/mode-utils';
import { RNG } from '../shared/rng';
import {
  GameEntry,
  GameLobby,
  KanaGroup,
  KanjiGroup,
  TestGroup,
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

/** Prepares entries for game, e.g. randomly sorts them. */
export async function getEntriesForGame(
  groups: TestGroup[],
): Promise<Array<GameEntry>> {
  const entries = new Array<GameEntry>();
  const rng = RNG.fromTimestamp();
  // kanji should be filtered together, because there are so many:
  const kanjiGroups = groups.filter(isKanjiGroup);
  const kanaGroups = groups.filter(isKanaGroup);
  for (const group of kanaGroups) {
    entries.push(...(await getKanaEntries(group)));
  }
  entries.push(...(await getKanjiEntries(kanjiGroups)));
  for (const entry of entries) {
    entry.random_index = rng.randomInt();
  }
  // Sort high to low, highest "random index" goes first:
  entries.sort((a, b) => b.random_index - a.random_index);
  return entries;
}

export async function getHiraganaEntries(): Promise<Array<GameEntry>> {
  return await parseKanaFile(`${__dirname}/../data/hiragana.txt`, ['hiragana']);
}

export async function getHiraganaDigraphEntries(): Promise<Array<GameEntry>> {
  return await parseKanaFile(`${__dirname}/../data/hiragana_digraphs.txt`, [
    'hiragana_digraphs',
  ]);
}

export async function getKatakanaEntries(): Promise<Array<GameEntry>> {
  return await parseKanaFile(`${__dirname}/../data/katakana.txt`, ['katakana']);
}

export async function getKatakanaDigraphEntries(): Promise<Array<GameEntry>> {
  return await parseKanaFile(`${__dirname}/../data/katakana_digraphs.txt`, [
    'katakana_digraphs',
  ]);
}

/** Parses a Hiragana / Katakana data file. */
async function parseKanaFile(
  path: string,
  groups: KanaGroup[],
): Promise<Array<GameEntry>> {
  const entries = new Array<GameEntry>();
  await forEachLineInFile(path, (line) => {
    const [kana, reading] = line.split(' ');
    if (kana && reading) {
      entries.push(
        new GameEntry(kana, 0, kana, [kana], [reading], new Map(), groups),
      );
    }
  });
  return entries;
}

/** Parsese the kanji file and filters matching entries. */
export async function getKanjiEntries(
  groups: KanjiGroup[],
): Promise<Array<GameEntry>> {
  return (await parseKanjiFile()).filter((k) =>
    k.groups.find((g) => groups.find((g2) => g2 == g)),
  );
}

/** Parses the kanji file 'jouyou_kanji_eng.txt' */
export async function parseKanjiFile(): Promise<Array<GameEntry>> {
  const entries = new Array<GameEntry>();
  await forEachLineInFile(
    `${__dirname}/../data/jouyou_kanji_eng.txt`,
    (line) => {
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
    },
  );
  return entries;
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

/**
 * Returns a new question and removes it from the list of questions.
 * If no more questions, returns null.
 *
 * Also provides a multiple choices, if applicable.
 * The choices include the true answer.
 */
export function selectQuestion(
  lobby: GameLobby,
  rng: RNG = RNG.fromStrSeedWithTimestamp('choices'),
): {
  question: GameEntry | null;
  choices?: GameEntry[];
} {
  // Assuming that the list of questions is already sorted in order.
  if (lobby.used_question_count >= lobby.questions.length) {
    return { question: null };
  }
  const question = lobby.questions[lobby.used_question_count];
  lobby.used_question_count++;
  // Could potentially return the next N answers, instead of random ones.

  // Add choices for all question types, just in case they switch question type mid-round.
  const choiceSet = new Set<GameEntry>([question]);
  // Check what the choice actually looks like, to remove identical choices:
  const choiceContentSet = new Set<string>();
  choiceContentSet.add(
    getAnswerContent(
      question,
      lobby.settings.answer_mode,
      lobby.settings.game_mode,
      'en',
    ).join(', '),
  );
  const choices = new Array<GameEntry>();
  const targetCount = Math.max(
    2,
    Math.min(lobby.settings.num_choices, lobby.questions.length),
  );
  // Count retries to prevent an infinite loop:
  let retryCounter = 0;
  while (choiceSet.size < targetCount) {
    const i = rng.randomIntClamped(0, lobby.questions.length - 1);
    const choice = lobby.questions[i];
    const choiceContent = getAnswerContent(
      choice,
      lobby.settings.answer_mode,
      lobby.settings.game_mode,
      'en',
    ).join(', ');
    if (choiceSet.has(choice) || choiceContentSet.has(choiceContent)) {
      retryCounter++;
      if (retryCounter >= 20) break;
    } else {
      choiceSet.add(choice);
      choiceContentSet.add(choiceContent);
    }
  }
  // Shuffle choices so that the answer is at a random spot.
  choices.push(...choiceSet);
  rng.shuffleArray(choices);
  return { question, choices };
}
