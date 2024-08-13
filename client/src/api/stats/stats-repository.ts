import {
  collection,
  doc,
  FieldValue,
  getDoc,
  getDocs,
  increment,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { firestore } from '../../firebase';
import { entryStatsConverter } from '../../shared/firestore-converters';
import { EntryStats, GameEntry } from '../../shared/types';

function getStatsRef(userID: string) {
  return collection(firestore, `users/${userID}/stats`).withConverter(
    entryStatsConverter,
  );
}

export function getStatRef(userID: string, entryID: string) {
  return doc(getStatsRef(userID), entryID);
}

/** Maps entry id to stat. */
const statsCache: Map<string, EntryStats> = new Map();
let fetchingLock = false;

/** Fetches and caches local stats */
export async function getUserStats(
  userID: string,
): Promise<Map<string, EntryStats>> {
  if (statsCache.size > 0 || fetchingLock) {
    return statsCache;
  }
  fetchingLock = true;
  const docs = (await getDocs(getStatsRef(userID))).docs.map((d) => d.data());
  for (const stat of docs) {
    statsCache.set(stat.entry_id, stat);
  }
  fetchingLock = false;
  return statsCache;
}

export async function getUserStat(
  userID: string,
  entryID: string,
): Promise<EntryStats | null> {
  return (await getDoc(getStatRef(userID, entryID))).data() ?? null;
}

type Counts = { [key: string]: number | undefined };
export type UserStatIncrement = Counts & {
  [P in keyof Omit<EntryStats, 'entry_id' | 'groups'>]: EntryStats[P];
};
type UpdateData = { [key: string]: FieldValue };

/** Increments user stats with the given increment */
export async function incrementStat(
  userID: string,
  entry: GameEntry,
  increments: UserStatIncrement,
) {
  const ref = getStatRef(userID, entry.id);
  const stat = (await getDoc(ref)).data();
  if (stat) {
    const updateObj: UpdateData = {};
    for (const key of Object.keys(increments)) {
      const val = increments[key];
      if (val !== undefined) {
        updateObj[key] = increment(val);
      }
    }
    await updateDoc(ref, updateObj);
  } else {
    setDoc(ref, { entry_id: entry.id, groups: entry.groups, ...increments });
  }
}
