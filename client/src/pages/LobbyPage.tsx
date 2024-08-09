import { User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  useLobby,
  usePlayerInLobby,
  usePlayers,
} from '../api/lobby/lobby-hooks';
import { joinLobby } from '../api/lobby/lobby-join-api';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuthWithPresence } from '../hooks/auth-hooks';
import { useHandler } from '../hooks/data-hooks';
import { assertExhaustive } from '../shared/utils';
import { EndgameScreen } from './lobby-screens/EndgameScreen';
import { GameScreen } from './lobby-screens/GameScreen';
import { LoginScreen } from './lobby-screens/LoginScreen';
import { NewLobbyScreen } from './lobby-screens/NewLobbyScreen';
import { RejoinScreen } from './lobby-screens/RejoinScreen';

interface LoaderParams {
  params: any;
}

export function lobbyLoader({ params }: LoaderParams): string {
  return params['lobbyID'] as string;
}

/** Root component */
export function LobbyPage() {
  const [error, setError] = useState(null);
  return (
    <>
      <ErrorModal error={error} setError={setError} />
      <ErrorContext.Provider value={{ error, setError }}>
        <LobbyPageThrows />
      </ErrorContext.Provider>
    </>
  );
}

/** User opened the lobby screen, but not necessarily logged in or in this lobby. */
function LobbyPageThrows() {
  // Double-check that we are logged in.
  // Users who are sent the link will need to log in first.
  const [user, loadingUser] = useAuthWithPresence();
  const lobbyID = useLoaderData() as string;

  if (loadingUser) return <LoadingSpinner delay text="Logging in..." />;

  if (!user) {
    return <LoginScreen />;
  }

  return <LoggedInLobbyScreen user={user} lobbyID={lobbyID} />;
}

interface LoggedInProps {
  lobbyID: string;
  user: User;
}

/** User logged in, but not necessarily joined the lobby. */
function LoggedInLobbyScreen({ lobbyID, user }: LoggedInProps) {
  const [player, loadingPlayer] = usePlayerInLobby(lobbyID, user);
  const [join, joining] = useHandler(() => joinLobby(lobbyID), [lobbyID]);

  useEffect(() => {
    if (!loadingPlayer && !player) {
      join();
    }
  }, [loadingPlayer, player?.uid]);

  if (loadingPlayer) {
    return <LoadingSpinner delay text="Loading user..." />;
  }
  if (joining) {
    return <LoadingSpinner text="Joining lobby..." />;
  }
  if (player?.status === 'left') {
    return <RejoinScreen player={player} lobbyID={lobbyID} />;
  }
  // Maybe offer to change user's name before joining:
  return <JoinedLobbyScreen user={user} lobbyID={lobbyID} />;
}

interface LoggedInJoinedProps {
  lobbyID: string;
  user: User;
}

/** User logged in AND joined the lobby. */
function JoinedLobbyScreen({ lobbyID, user }: LoggedInJoinedProps) {
  const { setError } = useErrorContext();
  const [lobby, loadingLobby, lobbyError] = useLobby(lobbyID);
  const [players, loadingPlayers, playersError] = usePlayers(lobbyID);
  if (lobbyError || playersError) {
    setError(lobbyError || playersError);
  }

  if (loadingLobby || loadingPlayers)
    return <LoadingSpinner delay text="Loading lobby..." />;
  if (!lobby || !players) throw new Error(`Failed to load lobby ${lobbyID}`);
  switch (lobby.status) {
    case 'new':
    case 'starting':
      return <NewLobbyScreen lobby={lobby} user={user} players={players} />;
    case 'in_progress':
      return <GameScreen lobby={lobby} user={user} players={players} />;
    case 'ended':
      return <EndgameScreen lobby={lobby} user={user} players={players} />;
    default:
      assertExhaustive(lobby.status);
  }
}
