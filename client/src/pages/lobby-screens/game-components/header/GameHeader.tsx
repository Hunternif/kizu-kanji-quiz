import { GamePlayerMenu } from './GamePlayerMenu';

/** Header with a toolbar at the top of the game page */
export function GameHeader() {
  return (
    <>
      <div className="menu-row">
        <div className="menu-row-left"></div>

        <div className="menu-row-right">
          <div className="badges"></div>
          <GamePlayerMenu />
        </div>
      </div>
    </>
  );
}
