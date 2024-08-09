import { User } from 'firebase/auth';
import { CSSProperties, useContext, useEffect } from 'react';
import { useAllPlayerResponses, useLastTurn } from '../../api/turn/turn-hooks';
import { ErrorContext } from '../../components/ErrorContext';
import { FillLayout } from '../../components/layout/FillLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { GameLobby, GameTurn, PlayerInLobby } from '../../shared/types';
import { assertExhaustive } from '../../shared/utils';
import { GameContext, GameContextState } from './game-components/GameContext';
import { QuestionScreen } from './QuestionScreen';
import { GameHeader } from './game-components/header/GameHeader';

interface ScreenProps {
  lobby: GameLobby;
  user: User;
  players: PlayerInLobby[];
}

const gameContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
};

export function GameScreen({ lobby, user, players }: ScreenProps) {
  const [turn, loadingTurn, error] = useLastTurn(lobby);
  const { setError } = useContext(ErrorContext);
  useEffect(() => {
    if (error) setError(error);
  }, [error, setError]);

  return (
    <FillLayout
      style={gameContainerStyle}
      className="game-screen miniscrollbar miniscrollbar-dark"
    >
      {!turn ? (
        <LoadingSpinner delay text="Waiting for next turn..." />
      ) : (
        <TurnScreen turn={turn} lobby={lobby} user={user} players={players} />
      )}
    </FillLayout>
  );
}

interface PreTurnProps {
  lobby: GameLobby;
  turn: GameTurn;
  user: User;
  players: PlayerInLobby[];
}

function TurnScreen({ lobby, turn, user, players }: PreTurnProps) {
  const [responses, loadingResp, error] = useAllPlayerResponses(lobby, turn);

  const player = players.find((p) => p.uid === user.uid);
  const isSpectator = player?.role === 'spectator';
  const isCreator = lobby.creator_uid === user.uid;
  const activePlayers = players.filter(
    (p) => p.role === 'player' && p.status === 'online',
  );
  const lobbyControl = lobby.settings.lobby_control;

  let canControlLobby = false;
  switch (lobbyControl) {
    case 'anyone':
      canControlLobby = true;
      break;
    case 'players':
      canControlLobby = player?.role === 'player';
      break;
    case 'creator':
      canControlLobby = isCreator;
      break;
    default:
      assertExhaustive(lobbyControl);
  }

  const { setError } = useContext(ErrorContext);
  if (error) setError(error);

  if (!player) {
    setError('Current player is not in lobby');
    return <></>;
  }

  const gameState: GameContextState = {
    user,
    lobby,
    players,
    activePlayers,
    player,
    isSpectator,
    isCreator,
    // TODO: choose display language:
    language: 'english',
    turn,
    responses,
    canControlLobby,
  };

  return (
    <GameContext.Provider value={gameState}>
      <div className={`game-bg phase-${turn.phase}`} />
      <GameHeader />
      <QuestionScreen />
    </GameContext.Provider>
  );
}
