import { FieldValue } from 'firebase-admin/firestore';
import { firestore } from '../firebase-server';
import { entryStatsConverter } from '../shared/firestore-converters';
import { countStatChange, UserStatIncrement } from '../shared/stat-count-api';
import {
  EntryStats,
  GameEntry,
  GameTurn,
  PlayerResponse,
} from '../shared/types';

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
  if (response.isEmpty()) return;
  const statIncrement = countStatChange(turn, response);
  await incrementStat(response.player_uid, turn.question, statIncrement);
}
