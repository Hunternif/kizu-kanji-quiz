import { User } from 'firebase/auth';
import { CSSProperties, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveLobby } from '../../api/lobby/lobby-join-api';
import { setMyPlayerRole } from '../../api/lobby/lobby-player-api';
import { GameButton } from '../../components/Buttons';
import { ErrorContext } from '../../components/ErrorContext';
import { IconCounter } from '../../components/IconCounter';
import { IconPersonInline } from '../../components/Icons';
import { FillLayout } from '../../components/layout/FillLayout';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { GameLobby, PlayerInLobby } from '../../shared/types';
import { LobbyCreationReadOnly } from './lobby-components/LobbyCreationReadOnly';
import { LobbyCreatorControls } from './lobby-components/LobbyCreatorControls';
import { LobbyPlayerList } from './lobby-components/LobbyPlayerList';

interface Props {
  lobby: GameLobby;
  user: User;
  players: PlayerInLobby[];
}

const sidebarStyle: CSSProperties = {
  paddingTop: '1em',
  paddingBottom: '1em',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const scrollableColumnStyle: CSSProperties = {
  overflowY: 'auto',
  paddingLeft: '1em',
  paddingRight: 'calc(1em - 8px)',
};

/** User logged in AND joined the lobby. */
export function NewLobbyScreen(props: Props) {
  return (
    <SidebarLayout
      className="new-lobby-screen"
      sidebar={<PlayerListSidebar {...props} />}
      collapsedHeader={
        <IconCounter
          className="dim lobby-player-counter"
          icon={<IconPersonInline />}
          count={props.players.length}
        />
      }
    >
      <MainContent {...props} />
    </SidebarLayout>
  );
}

function MainContent(props: Props) {
  const { lobby, user } = props;
  const isCreator = lobby.creator_uid === user.uid;
  return (
    <div className="new-lobby-main-content">
      {isCreator ? (
        <LobbyCreatorControls {...props} />
      ) : (
        <LobbyCreationReadOnly {...props} />
      )}
    </div>
  );
}

function PlayerListSidebar({ lobby, user, players }: Props) {
  const [leaving, setLeaving] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const { setError } = useContext(ErrorContext);
  const navigate = useNavigate();

  // Count active players:
  const activePlayers = players.filter(
    (p) => p.role === 'player' && p.status !== 'left',
  );
  const spectators = players.filter(
    (p) => p.role === 'spectator' && p.status === 'online',
  );
  const player = players.find((p) => p.uid === user.uid)!;
  const isCreator = player.uid === lobby.creator_uid;
  const canJoinAsPlayer = activePlayers.length < lobby.settings.max_players;

  async function handleLeave() {
    try {
      setLeaving(true);
      await leaveLobby(lobby, user.uid);
      navigate('/');
    } catch (e: any) {
      setError(e);
    } finally {
      setLeaving(false);
    }
  }

  async function handleSpectate() {
    try {
      setChangingRole(true);
      await setMyPlayerRole(lobby.id, 'spectator');
    } catch (e: any) {
      setError(e);
    } finally {
      setChangingRole(false);
    }
  }

  async function handleJoinAsPlayer() {
    try {
      setChangingRole(true);
      await setMyPlayerRole(lobby.id, 'player');
    } catch (e: any) {
      setError(e);
    } finally {
      setChangingRole(false);
    }
  }

  return (
    <div style={sidebarStyle} className="new-lobby-sidebar">
      <h3 className="player-list-header">
        Players {activePlayers.length}/{lobby.settings.max_players}
      </h3>
      <FillLayout
        style={scrollableColumnStyle}
        className="miniscrollbar miniscrollbar-dark"
      >
        <LobbyPlayerList
          lobby={lobby}
          user={user}
          players={activePlayers}
          minSlots={4}
          maxSlots={lobby.settings.max_players}
          extraEmptySlots={2}
        />
        {spectators.length > 0 && (
          <>
            <hr />
            <h3 className="spectator-list-header">
              Spectators {spectators.length}
            </h3>
            <LobbyPlayerList lobby={lobby} user={user} players={spectators} />
          </>
        )}
      </FillLayout>
      <hr />
      <footer>
        {player.role === 'player' && !isCreator && (
          <GameButton
            secondary
            centered
            onClick={handleSpectate}
            loading={changingRole}
          >
            Spectate
          </GameButton>
        )}
        {player.role === 'spectator' && canJoinAsPlayer && (
          <GameButton
            secondary
            centered
            onClick={handleJoinAsPlayer}
            loading={changingRole}
          >
            Join as player
          </GameButton>
        )}
        <GameButton onClick={handleLeave} disabled={leaving}>
          Leave
        </GameButton>
      </footer>
    </div>
  );
}
