import { User } from 'firebase/auth';
import { CSSProperties, useContext, useEffect } from 'react';
import { useGameObserver } from '../../api/turn/use-game-observer';
import { useAllPlayerResponses, useLastTurn } from '../../api/turn/turn-hooks';
import { ErrorContext } from '../../components/ErrorContext';
import { FillLayout } from '../../components/layout/FillLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  GameLobby,
  GameTurn,
  PlayerInLobby,
  QuizUser,
} from '../../shared/types';
import { assertExhaustive } from '../../shared/utils';
import { GameContext, GameContextState } from './game-components/GameContext';
import { GameHeader } from './game-components/header/GameHeader';
import { QuestionScreen } from './QuestionScreen';
import { CountdownScreen } from './CountdownScreen';

interface ScreenProps {
  lobby: GameLobby;
  user: User;
  quizUser: QuizUser;
  players: PlayerInLobby[];
}

const gameContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
};

export function GameScreen({ lobby, user, quizUser, players }: ScreenProps) {
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
        <TurnScreen
          turn={turn}
          lobby={lobby}
          user={user}
          quizUser={quizUser}
          players={players}
        />
      )}
    </FillLayout>
  );
}

interface PreTurnProps {
  lobby: GameLobby;
  turn: GameTurn;
  user: User;
  quizUser: QuizUser;
  players: PlayerInLobby[];
}

function TurnScreen({ lobby, turn, user, quizUser, players }: PreTurnProps) {
  // This is the main game controller:
  useGameObserver(lobby, turn, quizUser);

  // Construct game context:
  const [responses, loadingResp, error] = useAllPlayerResponses(lobby, turn);

  const player = players.find((p) => p.uid === user.uid);
  const isSpectator = player?.role === 'spectator';
  const isCreator = lobby.creator_uid === user.uid;
  const activePlayers = players.filter(
    (p) => p.role === 'player' && p.status === 'online',
  );
  const spectators = players.filter(
    (p) => p.role === 'spectator' && p.status === 'online',
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
    quizUser,
    lobby,
    players,
    spectators,
    activePlayers,
    player,
    isSpectator,
    isCreator,
    // TODO: choose display language:
    language: 'en',
    turn,
    responses,
    canControlLobby,
  };

  return (
    <GameContext.Provider value={gameState}>
      <div className={`game-bg phase-${turn.phase}`} />
      <GameHeader />
      {lobby.status === 'starting_countdown' ? (
        <CountdownScreen />
      ) : (
        <QuestionScreen />
      )}
    </GameContext.Provider>
  );
}
