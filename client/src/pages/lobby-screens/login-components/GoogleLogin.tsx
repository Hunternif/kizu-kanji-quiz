import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useContext } from 'react';
import { ErrorContext } from '../../../components/ErrorContext';
import { CenteredLayout } from '../../../components/layout/CenteredLayout';
import { firebaseAuth } from '../../../firebase';
import { GameButton } from '../../../components/Buttons';

export function GoogleLogin() {
  const { setError } = useContext(ErrorContext);
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(firebaseAuth, provider);
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
    <CenteredLayout>
      <GameButton onClick={signInWithGoogle}>Sign in with Google</GameButton>
    </CenteredLayout>
  );
}
