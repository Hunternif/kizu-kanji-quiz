import { User } from 'firebase/auth';
import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  useLobby,
  usePlayerInLobby,
  usePlayers,
} from '../api/lobby/lobby-hooks';
import { ErrorContext, useErrorContext } from '../components/ErrorContext';
import { ErrorModal } from '../components/ErrorModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuthWithPresence } from '../hooks/auth-hooks';
import { assertExhaustive } from '../shared/utils';
import { LoginScreen } from './lobby-screens/LoginScreen';
import { useHandler } from '../hooks/data-hooks';
import { joinLobby } from '../api/lobby/lobby-join-api';

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
  const [handleLogin, joining] = useHandler(() => joinLobby(lobbyID));

  if (loadingUser) return <LoadingSpinner delay text="Logging in..." />;

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  if (joining) return <LoadingSpinner text="Joining lobby..." />;
  
  return <LoggedInLobbyScreen user={user} lobbyID={lobbyID} />;
}

interface LoggedInProps {
  lobbyID: string;
  user: User;
}

/** User logged in, but not necessarily joined the lobby. */
function LoggedInLobbyScreen({ lobbyID, user }: LoggedInProps) {
  const [player, loadingPlayer] = usePlayerInLobby(lobbyID, user);
  if (loadingPlayer) return <LoadingSpinner delay text="Loading user..." />;
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
      return <span>This is the New Lobby screen</span>;
    // return <NewLobbyScreen lobby={lobby} user={user} players={players} />;
    case 'in_progress':
      return <span>This is the Game screen</span>;
    // return <GameScreen lobby={lobby} user={user} players={players} />;
    case 'ended':
      return <span>This is the Scoreboard screen</span>;
    // return <ScoreboardScreen lobby={lobby} user={user} players={players} />;
    default:
      assertExhaustive(lobby.status);
  }
}
