import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useContext } from 'react';
import { GameButton } from '../../../components/Buttons';
import { ErrorContext } from '../../../components/ErrorContext';
import { firebaseAuth } from '../../../firebase';
import { IconGoogle } from '../../../components/Icons';
import { getOrCreateQuizUser } from '../../../api/users-api';

type Props = {
  text?: string;
  onLogin: () => void;
};

export function GoogleLogin({ text, onLogin }: Props) {
  const { setError } = useContext(ErrorContext);
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(firebaseAuth, provider);
      await getOrCreateQuizUser(
        cred.user.uid,
        cred.user.displayName ?? 'New Google user',
      );
      onLogin();
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
      {text ?? 'Sign in with Google'}
    </GameButton>
  );
}
