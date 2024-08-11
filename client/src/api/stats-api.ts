import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { entryStatsConverter } from '../shared/firestore-converters';
import { EntryStats } from '../shared/types';

function getStatsRef(userID: string) {
  return collection(firestore, `users/${userID}/stats`).withConverter(
    entryStatsConverter,
  );
}

function getStatRef(userID: string, entryID: string) {
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
