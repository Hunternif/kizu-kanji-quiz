import { firestore } from '../firebase-server';
import { userConverter } from '../shared/firestore-converters';
import { QuizUser } from '../shared/types';
import { getUserName } from './auth-api';

export const usersRef = firestore
  .collection('users')
  .withConverter(userConverter);

/** Finds user data by ID */
export async function getQuizUser(userID: string): Promise<QuizUser | null> {
  return (await usersRef.doc(userID).get()).data() ?? null;
}

/** Finds or creates user data by ID */
export async function getOrCreateQuizUser(userID: string): Promise<QuizUser> {
  const quizUser = await getQuizUser(userID);
  if (quizUser) return quizUser;
  else {
    const userName = await getUserName(userID);
    const newUser = new QuizUser(userID, null, userName, false);
    await usersRef.doc(userID).set(newUser);
    return newUser;
  }
}

export async function updateQuizUser(quizUser: QuizUser): Promise<void> {
  await usersRef.doc(quizUser.uid).update(userConverter.toFirestore(quizUser));
}
