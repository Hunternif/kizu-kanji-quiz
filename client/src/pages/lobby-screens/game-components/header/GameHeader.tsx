import { PlayerCountBadge } from './PlayerCountBadge';
import { ScoreBadge } from './ScoreBadge';

/** Header with a toolbar at the top of the game page */
export function GameHeader() {
  return (
    <>
      <div className="menu-row">
        <div className="menu-row-left">
          <PlayerCountBadge />
        </div>

        <div className="menu-row-right">
          <div className="badges">
            <ScoreBadge />
          </div>
          {/* <GamePlayerMenu /> */}
        </div>
      </div>
    </>
  );
}
