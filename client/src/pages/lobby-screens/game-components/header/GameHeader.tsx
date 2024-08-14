import { useScreenWiderThan } from '../../../../components/layout/ScreenSizeSwitch';
import { useGameContext } from '../GameContext';
import { Scoreboard } from '../Scoreboard';
import { GamePlayerMenu } from './GamePlayerMenu';
import { PlayerCountBadge } from './PlayerCountBadge';
import { ScoreBadge } from './ScoreBadge';

/** Header with a toolbar at the top of the game page */
export function GameHeader() {
  const { lobby, turn, user, activePlayers, responses } = useGameContext();
  // On a big screen, the badges are hidden, and the scroboard is shown.
  const isWide = useScreenWiderThan(768);
  return (
    <>
      <div className="menu-row">
        <div className="menu-row-left">{!isWide && <PlayerCountBadge />}</div>

        <div className="menu-row-right">
          <div className="badges">{!isWide && <ScoreBadge />}</div>
          <GamePlayerMenu />
        </div>
      </div>

      {isWide && (
        // On a wide screen, the scoreboard is floating on the left side:
        <div className="floating-sidebar">
          <div className="ingame-scoreboard-container">
            <header>Standings</header>
            <Scoreboard
              lobby={lobby}
              user={user}
              players={activePlayers}
              turn={turn}
              responses={responses}
            />
          </div>
        </div>
      )}
    </>
  );
}
