import { IconCounter } from '../../../../components/IconCounter';
import { IconPersonInlineSmall } from '../../../../components/Icons';
import { useGameContext } from '../GameContext';

/** Shows player count and a dropdown menu with player list. */
export function PlayerCountBadge() {
  const { activePlayers } = useGameContext();
  return (
    <IconCounter
      icon={<IconPersonInlineSmall />}
      count={activePlayers.length}
    />
  );
}
