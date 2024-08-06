import { signInAnonymously } from 'firebase/auth';
import { useContext } from 'react';
import { GameButton } from '../../../components/Buttons';
import { ErrorContext } from '../../../components/ErrorContext';
import { firebaseAuth } from '../../../firebase';

export function GuestLogin() {
  const { setError } = useContext(ErrorContext);
  async function signIn() {
    try {
      const cred = await signInAnonymously(firebaseAuth);
      // TODO: create local user data
      // await getOrCreateCAAUser(
      //   cred.user.uid,
      //   cred.user.displayName ?? 'New user',
      // );
    } catch (e) {
      setError(e);
    }
  }
  return (
    <GameButton secondary onClick={signIn}>
      Sign in as guest
    </GameButton>
  );
}
