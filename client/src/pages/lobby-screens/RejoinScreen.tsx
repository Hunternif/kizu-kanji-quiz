import { User } from 'firebase/auth';
import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { GameTitle } from './login-components/GameTitle';
import { useHandler } from '../../hooks/data-hooks';
import { PlayerInLobby } from '../../shared/types';
import { updatePlayer } from '../../api/lobby/lobby-player-api';

interface Props {
  lobbyID: string;
  player: PlayerInLobby;
}

/** User left or was kicked from lobby. */
export function RejoinScreen({ lobbyID, player }: Props) {
  const [handleRejoin, rejoining] = useHandler(async () => {
    if (player.status === 'left') {
      player.status = 'online';
      await updatePlayer(lobbyID, player);
    }
  });

  return (
    <CenteredLayout
      innerStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <GameTitle />
      <GameButton onClick={handleRejoin} loading={rejoining}>
        Rejoin game
      </GameButton>
    </CenteredLayout>
  );
}
