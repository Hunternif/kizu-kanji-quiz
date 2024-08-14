import { User } from 'firebase/auth';
import { CSSProperties } from 'react';
import { IconCheckInline, IconXThickInline } from '../../../components/Icons';
import { isCorrectResponse } from '../../../shared/mode-utils';
import {
  GameLobby,
  GameTurn,
  Language,
  PlayerInLobby,
  PlayerResponse,
} from '../../../shared/types';

interface Props {
  lobby: GameLobby;
  user: User;
  players: PlayerInLobby[];
  // Turn and responses are used in-game, to mark response status
  turn?: GameTurn;
  responses?: PlayerResponse[];
  lang?: Language;
}

const tableContainerStyle: CSSProperties = {
  display: 'flex',
  overflowY: 'auto',
  maxHeight: '70vh',
};

/** Reusable scoreboard table component. */
export function Scoreboard({ lobby, user, players, turn, responses }: Props) {
  // const players2 = new Array<PlayerInLobby>(20).fill(players[0]);
  const playersByScore = players
    .filter(
      (p) =>
        (p.role === 'player' &&
          // Show people who left, but only if they have > 0 score:
          p.status !== 'left') ||
        p.wins > 0,
    )
    .sort((a, b) => b.wins - a.wins);
  const responseMap = new Map(responses?.map((r) => [r.player_uid, r]));

  return (
    <>
      <div
        style={tableContainerStyle}
        className="miniscrollbar miniscrollbar-dark"
      >
        <table className="table scoreboard-table">
          <tbody>
            {playersByScore.map((player) => (
              <PlayerRow
                key={player.uid}
                lobby={lobby}
                user={user}
                player={player}
                turn={turn}
                response={responseMap.get(player.uid)}
                isMe={user.uid === player.uid}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface RowProps {
  lobby: GameLobby;
  user: User;
  player: PlayerInLobby;
  isMe?: boolean;
  // Turn and responses are used in-game, to mark response status
  turn?: GameTurn;
  response?: PlayerResponse;
}
function PlayerRow({ lobby, user, player, isMe, turn, response }: RowProps) {
  const isFresh = response?.current_phase === turn?.phase;
  const isSubmitted = response?.isEmpty() === false;
  const isSkipped = response?.skip === true;
  const isAnswering = turn?.phase === 'answering';
  const isReveal = turn?.phase === 'reveal';
  const isCorrect =
    isReveal && isSubmitted && isCorrectResponse(turn, response);
  const isIncorrect = isReveal && isSubmitted && !isCorrect && !isSkipped;

  const classes = ['player-row'];
  if (isMe) classes.push('me');
  return (
    <tr className={classes.join(' ')}>
      <td className="sb-col-name">
        <span className="player-name">
          {/* <PlayerCard lobby={lobby} player={player} canKick={isCreator} /> */}
          {player.name}
        </span>
      </td>
      <td className="sb-col-score">
        {/* <IconStarInline /> */}
        {player.wins}
      </td>
      <td className="sb-col-response">
        {isSkipped ? (
          'skipped'
        ) : isCorrect ? (
          <IconCheckInline className="correct" />
        ) : isIncorrect ? (
          <IconXThickInline />
        ) : isSubmitted && isFresh && isAnswering ? (
          <IconCheckInline className="submitted" />
        ) : null}
      </td>
    </tr>
  );
}
