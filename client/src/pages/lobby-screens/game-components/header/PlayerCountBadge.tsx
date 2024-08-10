import { InlineButton } from '../../../../components/Buttons';
import { Dropdown, DropdownMenu } from '../../../../components/Dropdown';
import { IconCounter } from '../../../../components/IconCounter';
import { IconPersonInlineSmall } from '../../../../components/Icons';
import { useGameContext } from '../GameContext';
import { Scoreboard } from '../Scoreboard';

/** Shows player count and a dropdown menu with player list. */
export function PlayerCountBadge() {
  const { lobby, user, activePlayers } = useGameContext();
  return (
    <Dropdown
      toggle={
        <InlineButton className="menu-player-counter" title="Players">
          <IconCounter
            icon={<IconPersonInlineSmall />}
            count={activePlayers.length}
          />
        </InlineButton>
      }
    >
      <DropdownMenu>
        <header className="scoreboard-header">Standings</header>
        <Scoreboard lobby={lobby} user={user} players={activePlayers} />
      </DropdownMenu>
    </Dropdown>
  );
}
