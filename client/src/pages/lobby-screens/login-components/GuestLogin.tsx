import { signInAnonymously } from 'firebase/auth';
import { useContext, useState } from 'react';
import { GameButton } from '../../../components/Buttons';
import { ErrorContext } from '../../../components/ErrorContext';
import { firebaseAuth } from '../../../firebase';
import { ConfirmModal } from '../../../components/ConfirmModal';

type Props = {
  text?: string;
  onLogin: () => void;
};

export function GuestLogin({ text, onLogin }: Props) {
  const { setError } = useContext(ErrorContext);
  const [agreed, setAgreed] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  async function handleClick() {
    if (!agreed) {
      setShowDisclaimer(true);
    } else {
      await doSignIn();
    }
  }

  async function doSignIn() {
    try {
      const cred = await signInAnonymously(firebaseAuth);
      // TODO: create local user data
      // await getOrCreateCAAUser(
      //   cred.user.uid,
      //   cred.user.displayName ?? 'New user',
      // );
      onLogin();
    } catch (e) {
      setError(e);
    }
  }

  return (
    <>
      <ConfirmModal
        show={showDisclaimer}
        title="Continue as guest?"
        onCancel={() => setShowDisclaimer(false)}
        onConfirm={() => {
          setAgreed(true);
          setShowDisclaimer(false);
          doSignIn();
        }}
      >
        Your progress will not be saved!
      </ConfirmModal>
      <GameButton secondary onClick={handleClick}>
        {text ?? 'Sign in as guest'}
      </GameButton>
    </>
  );
}
