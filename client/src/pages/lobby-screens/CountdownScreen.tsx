import { signalEndOfCountdown } from '../../api/lobby/lobby-control-api';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { Timer } from '../../components/Timer';
import { useHandler } from '../../hooks/data-hooks';
import { useGameContext } from './game-components/GameContext';

/** A huge countdown timer before the start of the first turn. */
export function CountdownScreen() {
  const { lobby } = useGameContext();

  const [handleStart] = useHandler(async () => {
    await signalEndOfCountdown(lobby);
  }, [lobby]);

  const rootClasses = ['countdown-screen'];

  return (
    <CenteredLayout innerClassName={rootClasses.join(' ')}>
      <header>Starting in:</header>
      <div className="countdown-timer">
        <Timer
          onlySeconds
          totalMs={lobby.settings.start_countdown_sec * 1000}
          onClear={handleStart}
        />
      </div>
    </CenteredLayout>
  );
}
