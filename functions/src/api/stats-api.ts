import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../firebase-server';
import { entryStatsConverter } from '../shared/firestore-converters';
import { isChoiceAnswer, isCorrectAnswer, isCorrectResponse } from '../shared/mode-utils';
import { EntryStats, GameTurn, PlayerResponse } from '../shared/types';
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

export async function getOrCreateUserStat(
  userID: string,
  entryID: string,
): Promise<EntryStats> {
  const stat = await getUserStat(userID, entryID);
  if (stat) return stat;
  else {
    const newStat = { entry_id: entryID };
    await getStatRef(userID, entryID).set(newStat);
    return newStat;
  }
}

type Counts = { [key: string]: number | undefined };
type UserStatIncrement = Counts & {
  [P in keyof Omit<EntryStats, 'entry_id'>]: EntryStats[P];
};
type UpdateData = { [key: string]: FieldValue };

/** Increments user stats with the given increment */
async function incrementStat(
  userID: string,
  entryID: string,
  increments: UserStatIncrement,
) {
  const ref = getStatRef(userID, entryID);
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
    ref.set({ entry_id: entryID, ...increments });
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
  if (isChoiceAnswer(turn.answer_mode)) {
    const isWin = isCorrectResponse(turn, response);
    const isFail = response.answer_entry_id !== undefined && !isWin;
    switch (turn.game_mode) {
      case 'writing_to_reading':
        if (isWin) statIncrement['reading_wins'] = 1;
        if (isFail) statIncrement['reading_fails'] = 1;
        break;
      case 'reading_to_writing':
      case 'meaning_to_writing':
        if (isWin) statIncrement['writing_wins'] = 1;
        if (isFail) statIncrement['writing_fails'] = 1;
        break;
      case 'writing_to_meaning':
        if (turn.question.isKana) {
          // For kana, meaning == reading:
          if (isWin) statIncrement['reading_wins'] = 1;
          if (isFail) statIncrement['reading_fails'] = 1;
        } else {
          if (isWin) statIncrement['meaning_wins'] = 1;
          if (isFail) statIncrement['meaning_fails'] = 1;
        }
        break;
      default:
        assertExhaustive(turn.game_mode);
    }
    await incrementStat(response.player_uid, turn.question.id, statIncrement);
  } else {
    // TODO: implement stats for other answer modes
  }
}
