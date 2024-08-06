import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { GameTitle } from './login-components/GameTitle';
import { SignOutButton } from './login-components/SignOutButton';

export function HomeScreen() {
  return (
    <CenteredLayout outerClassName="welcome-screen">
      <GameTitle />
      <center>
        Nobody here but us chickens!
        <SignOutButton />
      </center>
    </CenteredLayout>
  );
}
