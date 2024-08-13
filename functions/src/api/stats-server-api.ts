import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../firebase-server';
import { entryStatsConverter } from '../shared/firestore-converters';
import {
  isChoiceAnswer,
  isCorrectResponse,
  isTypedAnswer,
} from '../shared/mode-utils';
import {
  EntryStats,
  GameEntry,
  GameTurn,
  PlayerResponse,
} from '../shared/types';
import { assertExhaustive } from '../shared/utils';

function getStatsRef(userID: string) {
  return firestore
    .collection(`users/${userID}/stats`)
    .withConverter(entryStatsConverter);
}

function getStatRef(userID: string, entryID: string) {
  return getStatsRef(userID).doc(entryID);
}

export async function getUserStats(
  userID: string,
): Promise<Map<string, EntryStats>> {
  const statData = new Map<string, EntryStats>();
  const docs = (await getStatsRef(userID).get()).docs.map((d) => d.data());
  for (const stat of docs) {
    statData.set(stat.entry_id, stat);
  }
  return statData;
}

export async function getUserStat(
  userID: string,
  entryID: string,
): Promise<EntryStats | null> {
  return (await getStatRef(userID, entryID).get()).data() ?? null;
}

type Counts = { [key: string]: number | undefined };
type UserStatIncrement = Counts & {
  [P in keyof Omit<EntryStats, 'entry_id' | 'groups'>]: EntryStats[P];
};
type UpdateData = { [key: string]: FieldValue };

/** Increments user stats with the given increment */
async function incrementStat(
  userID: string,
  entry: GameEntry,
  increments: UserStatIncrement,
) {
  const ref = getStatRef(userID, entry.id);
  const stat = (await ref.get()).data();
  if (stat) {
    const updateObj: UpdateData = {};
    for (const key of Object.keys(increments)) {
      const val = increments[key];
      if (val !== undefined) {
        updateObj[key] = FieldValue.increment(val);
      }
    }
    await ref.update(updateObj);
  } else {
    ref.set({ entry_id: entry.id, groups: entry.groups, ...increments });
  }
}

/**
 * Updates user stats based on their response to this turn,
 * depending on the game mode.
 */
export async function updateUserStats(
  turn: GameTurn,
  response: PlayerResponse,
) {
  const statIncrement: UserStatIncrement = {};
  if (response.isEmpty()) return;
  const isWin = isCorrectResponse(turn, response);
  let isSkip = false;
  if (isChoiceAnswer(turn.answer_mode)) {
    isSkip = response.answer_entry_id === undefined;
  } else if (isTypedAnswer(turn.answer_mode)) {
    isSkip = response.answer_typed === undefined;
  } else {
    // TODO: implement stats for other answer modes
    isSkip = true;
  }
  const isFail = !isSkip && !isWin;
  // logger.info(
  //   `Logging stats for '${turn.question.id}': win: ${isWin} skip: ${isSkip} fail: ${isFail}`,
  // );
  switch (turn.answer_mode) {
    case 'choose_kanji':
      if (isWin) statIncrement.writing_wins = 1;
      if (isFail) statIncrement.writing_fails = 1;
      break;
    case 'choose_hiragana':
      if (turn.question.isKana) {
        // For kana, 'hiragana' == writing:
        if (isWin) statIncrement.writing_wins = 1;
        if (isFail) statIncrement.writing_fails = 1;
      } else {
        if (isWin) statIncrement.reading_wins = 1;
        if (isFail) statIncrement.reading_fails = 1;
      }
      break;
    case 'choose_romaji':
    case 'type_romaji':
      if (isWin) statIncrement.reading_wins = 1;
      if (isFail) statIncrement.reading_fails = 1;
      break;
    case 'choose_meaning':
    case 'type_meaning':
      if (turn.question.isKana) {
        // For kana, 'meaning' == reading:
        if (isWin) statIncrement.reading_wins = 1;
        if (isFail) statIncrement.reading_fails = 1;
      } else {
        if (isWin) statIncrement.meaning_wins = 1;
        if (isFail) statIncrement.meaning_fails = 1;
      }
      break;
    case 'draw_hiragana':
    case 'draw_kanji':
      // TOOD: implement stats for other answer modes
      break;
    default:
      assertExhaustive(turn.answer_mode);
  }
  await incrementStat(response.player_uid, turn.question, statIncrement);
}
