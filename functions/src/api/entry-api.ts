import { open } from 'node:fs/promises';
import { isChoiceAnswer } from '../shared/mode-utils';
import { RNG } from '../shared/rng';
import { GameEntry, GameLobby, TestGroup } from '../shared/types';
import { assertExhaustive } from '../shared/utils';

/** Provides gama data for the each test group. */
export async function getEntries(group: TestGroup): Promise<Array<GameEntry>> {
  switch (group) {
    case 'hiragana':
      return await getHiraganaEntries();
    case 'hiragana_digraphs':
      return await getHiraganaDigraphEntries();
    case 'katakana':
      return await getKatakanaEntries();
    case 'katakana_digraphs':
      return await getKatakanaDigraphEntries();
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

/** Prepares entries for game, e.g. randomly sorts them. */
export async function getEntriesForGame(
  groups: Iterable<TestGroup>,
): Promise<Array<GameEntry>> {
  const ret = new Array<GameEntry>();
  for (const group of groups) {
    const rng = RNG.fromStrSeedWithTimestamp(group);
    const entries = await getEntries(group);
    for (const entry of entries) {
      entry.random_index = rng.randomInt();
    }
    ret.push(...entries);
  }
  // Sort high to low, highest "random index" goes first:
  ret.sort((a, b) => b.random_index - a.random_index);
  return ret;
}

export async function getHiraganaEntries(): Promise<Array<GameEntry>> {
  return await getKanaEntries(`${__dirname}/../data/hiragana.txt`, [
    'hiragana',
  ]);
}

export async function getHiraganaDigraphEntries(): Promise<Array<GameEntry>> {
  return await getKanaEntries(`${__dirname}/../data/hiragana_digraphs.txt`, [
    'hiragana_digraphs',
  ]);
}

export async function getKatakanaEntries(): Promise<Array<GameEntry>> {
  return await getKanaEntries(`${__dirname}/../data/katakana.txt`, [
    'katakana',
  ]);
}

export async function getKatakanaDigraphEntries(): Promise<Array<GameEntry>> {
  return await getKanaEntries(`${__dirname}/../data/katakana_digraphs.txt`, [
    'katakana_digraphs',
  ]);
}

/** Parses a Hiragana / Katakana data file. */
async function getKanaEntries(
  path: string,
  groups: TestGroup[],
): Promise<Array<GameEntry>> {
  const entries = new Array<GameEntry>();
  await forEachLineInFile(path, (line) => {
    const [kana, reading] = line.split(' ');
    if (kana && reading) {
      entries.push(
        new GameEntry(kana, 0, kana, kana, reading, new Map(), groups),
      );
    }
  });
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
  let choices;
  if (isChoiceAnswer(lobby.settings.answer_mode)) {
    const choiceSet = new Set<GameEntry>([question]);
    choices = new Array<GameEntry>();
    const targetCount = Math.max(
      2,
      Math.min(lobby.settings.num_choices, lobby.questions.length),
    );
    // Count retries to prevent an infinite loop:
    let retryCounter = 0;
    while (choiceSet.size < targetCount) {
      const i = rng.randomIntClamped(0, lobby.questions.length - 1);
      const choice = lobby.questions[i];
      if (choiceSet.has(choice)) {
        retryCounter++;
        if (retryCounter >= 20) break;
      } else {
        choiceSet.add(choice);
      }
    }
    // Shuffle choices so that the answer is at a random spot.
    choices = [...choiceSet];
    rng.shuffleArray(choices);
  }
  return { question, choices };
}
