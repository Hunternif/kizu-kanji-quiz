import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useRedirectToNextLobby } from '../../api/lobby/lobby-hooks';
import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { VerticalGroup } from '../../components/layout/VerticalGroup';
import { GameLobby, PlayerInLobby } from '../../shared/types';
import { NewGameButton } from './game-components/NewGameButton';
import { GameTitle } from './login-components/GameTitle';

interface Props {
  lobby: GameLobby;
  user: User;
  players: PlayerInLobby[];
}

export function EndgameScreen({ lobby, user, players }: Props) {
  const navigate = useNavigate();
  useRedirectToNextLobby(lobby);

  return (
    <CenteredLayout
      innerStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <GameTitle />
      <h2>Game ended</h2>
      {/* Scoreboard goes here */}
      <VerticalGroup>
        <GameButton secondary onClick={() => navigate('/')}>
          Go home
        </GameButton>
        {user.uid === lobby.creator_uid && <NewGameButton lobby={lobby} />}
      </VerticalGroup>
    </CenteredLayout>
  );
}
