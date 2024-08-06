import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { Panel } from '../../components/Panel';
import { GameTitle } from './login-components/GameTitle';
import { SignOutButton } from './login-components/SignOutButton';

export function HomeScreen() {
  return (
    <CenteredLayout outerClassName="home-screen">
      <GameTitle />
      <Panel className="home-card">
        <GameButton>New game</GameButton>
        <GameButton disabled>Join game</GameButton>
        <SignOutButton secondary />
      </Panel>
    </CenteredLayout>
  );
}
