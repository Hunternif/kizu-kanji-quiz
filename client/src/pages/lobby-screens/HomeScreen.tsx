import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { Panel } from '../../components/Panel';
import { useQuizUser } from '../../hooks/auth-hooks';
import { GameTitle } from './login-components/GameTitle';
import { SignOutButton } from './login-components/SignOutButton';

export function HomeScreen() {
  const [quizUser] = useQuizUser();
  return (
    <CenteredLayout outerClassName="home-screen">
      <GameTitle />
      <Panel className="home-card">
        <span>Welcome, {quizUser?.name}</span>
        <GameButton>New game</GameButton>
        <GameButton disabled>Join game</GameButton>
        <SignOutButton secondary />
      </Panel>
    </CenteredLayout>
  );
}
