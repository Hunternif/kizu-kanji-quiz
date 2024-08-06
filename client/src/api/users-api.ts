import { updateProfile } from 'firebase/auth';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '../firebase';
import { userConverter } from '../shared/firestore-converters';
import { QuizUser } from '../shared/types';

const usersRef = collection(firestore, 'users').withConverter(userConverter);

export function getQuizUserRef(userID: string) {
  return doc(usersRef, userID);
}

/** Finds user data by ID */
export async function getQuizUser(userID: string): Promise<QuizUser | null> {
  return (await getDoc(getQuizUserRef(userID))).data() ?? null;
}

/** Finds or creates user data from Firebase user. */
export async function getOrCreateQuizUser(
  userID: string,
  name: string,
): Promise<QuizUser> {
  const quizUser = await getQuizUser(userID);
  if (quizUser) return quizUser;
  else {
    const newUser = new QuizUser(userID, null, name, false);
    await setDoc(doc(usersRef, userID), newUser);
    return newUser;
  }
}

/** Creates or updates user data */
export async function updateUserData(
  userID: string,
  name: string,
): Promise<QuizUser> {
  // Update Firebase user info:
  const user = firebaseAuth.currentUser;
  if (user) {
    await updateProfile(user, {
      displayName: name,
    });
  }

  // Update CAA user info:
  const quizUser = await getQuizUser(userID);
  if (quizUser) {
    quizUser.name = name;
    await updateDoc(doc(usersRef, userID), userConverter.toFirestore(quizUser));
    return quizUser;
  } else {
    const newUser = new QuizUser(userID, null, name);
    await setDoc(doc(usersRef, userID), newUser);
    return newUser;
  }
}
