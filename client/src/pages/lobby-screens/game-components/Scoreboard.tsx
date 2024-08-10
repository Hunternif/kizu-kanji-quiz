import { User } from 'firebase/auth';
import { CSSProperties } from 'react';
import { GameLobby, PlayerInLobby } from '../../../shared/types';

interface Props {
  lobby: GameLobby;
  user: User;
  players: PlayerInLobby[];
}

const tableContainerStyle: CSSProperties = {
  display: 'flex',
  overflowY: 'auto',
  maxHeight: '70vh',
};

/** Reusable scoreboard table component. */
export function Scoreboard({ lobby, user, players }: Props) {
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
}
function PlayerRow({ lobby, user, player, isMe }: RowProps) {
  const isCreator = lobby.creator_uid === user.uid;
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
    </tr>
  );
}
