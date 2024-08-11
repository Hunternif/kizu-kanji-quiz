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

export async function getUserStats(
  userID: string,
): Promise<Map<string, EntryStats>> {
  const statData = new Map<string, EntryStats>();
  const docs = (await getDocs(getStatsRef(userID))).docs.map((d) => d.data());
  for (const stat of docs) {
    statData.set(stat.entry_id, stat);
  }
  return statData;
}

export async function getUserStat(
  userID: string,
  entryID: string,
): Promise<EntryStats | null> {
  return (await getDoc(getStatRef(userID, entryID))).data() ?? null;
}
