import { useState } from 'react';
import { GameButton } from '../../../components/Buttons';
import { useErrorContext } from '../../../components/ErrorContext';
import { firebaseAuth } from '../../../firebase';
import { ControlProps } from '../../../components/FormControls';

interface Props extends ControlProps {}

export function SignOutButton(props: Props) {
  const { setError } = useErrorContext();
  const [signingOut, setSigningOut] = useState(false);

  async function handleClick() {
    //TODO: handle sign out in API
    try {
      setSigningOut(true);
      await firebaseAuth.signOut();
    } catch (e: any) {
      setError(e);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <GameButton {...props} onClick={handleClick} loading={signingOut}>
      Sign Out
    </GameButton>
  );
}
