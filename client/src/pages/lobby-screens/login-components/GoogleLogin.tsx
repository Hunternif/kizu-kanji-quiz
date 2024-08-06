import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useContext } from 'react';
import { GameButton } from '../../../components/Buttons';
import { ErrorContext } from '../../../components/ErrorContext';
import { firebaseAuth } from '../../../firebase';
import { IconGoogle } from '../../../components/Icons';

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
    <GameButton
      className="google-login"
      iconLeft={<IconGoogle />}
      onClick={signInWithGoogle}
    >
      Sign in with Google
    </GameButton>
  );
}
