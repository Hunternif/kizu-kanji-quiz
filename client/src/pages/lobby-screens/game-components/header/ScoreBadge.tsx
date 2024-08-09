import { IconCounter } from '../../../../components/IconCounter';
import { IconStarInline } from '../../../../components/Icons';
import { useGameContext } from '../GameContext';

/** Shows current player score and a dropdown menu with the scoreboard. */
export function ScoreBadge() {
  const { player } = useGameContext();
  return <IconCounter icon={<IconStarInline />} count={player.wins} />;
}
