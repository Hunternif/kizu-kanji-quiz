import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { GameTitle } from './login-components/GameTitle';

export function HomeScreen() {
  return (
    <CenteredLayout outerClassName="welcome-screen">
      <GameTitle />
      <center>Nobody here but us chickens!</center>
    </CenteredLayout>
  );
}
