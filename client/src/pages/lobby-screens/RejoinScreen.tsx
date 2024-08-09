import { updatePlayer } from '../../api/lobby/lobby-player-api';
import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { useHandler } from '../../hooks/data-hooks';
import { PlayerInLobby } from '../../shared/types';
import { GameTitle } from './login-components/GameTitle';

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
  }, [lobbyID, player]);

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
