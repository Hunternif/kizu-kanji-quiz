import { createLobbyAndJoin } from '../../api/lobby/lobby-join-api';
import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { Panel } from '../../components/Panel';
import { useQuizUser } from '../../hooks/auth-hooks';
import { useHandler } from '../../hooks/data-hooks';
import { GameTitle } from './login-components/GameTitle';
import { SignOutButton } from './login-components/SignOutButton';

export function HomeScreen() {
  const [quizUser] = useQuizUser();
  const [handleNewGame, loadingNewGame] = useHandler(async () => {
    await createLobbyAndJoin();
  });

  return (
    <CenteredLayout outerClassName="home-screen">
      <GameTitle />
      <Panel className="home-card">
        <span>Welcome, {quizUser?.name}</span>
        <GameButton onClick={handleNewGame} loading={loadingNewGame}>
          New game
        </GameButton>
        <GameButton disabled>Join game</GameButton>
        <SignOutButton secondary />
      </Panel>
    </CenteredLayout>
  );
}
