import { signInAnonymously } from 'firebase/auth';
import { useContext, useState } from 'react';
import { getOrCreateQuizUser } from '../../../api/users-api';
import { GameButton } from '../../../components/Buttons';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { ErrorContext } from '../../../components/ErrorContext';
import { firebaseAuth } from '../../../firebase';
import { RNG } from '../../../shared/rng';

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
      await getOrCreateQuizUser(
        cred.user.uid,
        cred.user.displayName ?? randomGuestName(),
      );
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

/** Creates a random nickname in the format "Guest1234" */
function randomGuestName() {
  return `Guest${RNG.fromTimestamp().randomInt() % 10000}`;
}
