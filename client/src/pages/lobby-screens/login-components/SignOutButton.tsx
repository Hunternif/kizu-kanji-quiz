import { GameButton } from '../../../components/Buttons';
import { ControlProps } from '../../../components/FormControls';
import { firebaseAuth } from '../../../firebase';
import { useHandler } from '../../../hooks/data-hooks';

interface Props extends ControlProps {}

export function SignOutButton(props: Props) {
  const [handleSignOut, signingOut] = useHandler(() => firebaseAuth.signOut());

  return (
    <GameButton {...props} onClick={handleSignOut} loading={signingOut}>
      Sign Out
    </GameButton>
  );
}
