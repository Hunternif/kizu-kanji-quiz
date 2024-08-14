import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLobbyAndJoin } from '../../api/lobby/lobby-join-api';
import { GameButton } from '../../components/Buttons';
import { IconPerson } from '../../components/Icons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { Panel } from '../../components/Panel';
import { useQuizUser } from '../../hooks/auth-hooks';
import { useHandler } from '../../hooks/data-hooks';
import { GameTitle } from './login-components/GameTitle';
import { ProfileModal } from './login-components/ProfileModal';
import { SignOutButton } from './login-components/SignOutButton';
import { Twemoji } from '../../components/Twemoji';

export function HomeScreen() {
  const [quizUser] = useQuizUser();
  const navigate = useNavigate();
  const [handleNewGame, loadingNewGame] = useHandler(async () => {
    const lobbyID = await createLobbyAndJoin();
    navigate(`/${lobbyID}`);
  }, []);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <CenteredLayout outerClassName="home-screen">
      <GameTitle />

      {quizUser && (
        <ProfileModal
          quizUser={quizUser}
          show={showProfile}
          onHide={() => setShowProfile(false)}
        />
      )}

      <Panel flex className="home-card">
        <span>Welcome, {quizUser?.name}</span>
        <GameButton onClick={handleNewGame} loading={loadingNewGame}>
          New game
        </GameButton>
        <GameButton
          iconLeft={<IconPerson />}
          onClick={() => setShowProfile(true)}
        >
          Profile
        </GameButton>
        <GameButton
          iconLeft={<Twemoji>💹</Twemoji>}
          onClick={() => navigate('/stats/hiragana')}
        >
          Statistics
        </GameButton>
        <SignOutButton secondary />
      </Panel>
    </CenteredLayout>
  );
}
