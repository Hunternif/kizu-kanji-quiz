import { useEffect, useState } from 'react';

interface Props {
  startTime: Date;
  endTime: Date;
  /** Overrides percentage value */
  pctValue?: number;
  onClear?: () => void;
}

function calculateElapsedPercent(startTime: Date, endTime: Date): number {
  const nowMs = new Date().getTime();
  const startMs = startTime.getTime();
  const endMs = endTime.getTime();
  let newValue = 100;
  if (endMs > startMs) {
    newValue = (100 * (nowMs - startMs)) / (endMs - startMs);
    newValue = Math.max(0, newValue);
    newValue = Math.min(100, newValue);
  }
  return newValue;
}

/**
 * A horizontal progress bar that corresponds to remaining time.
 */
export function TimerBar({ startTime, endTime, pctValue, onClear }: Props) {
  // Number from 0 to 100:
  const [percent, setPercent] = useState(
    pctValue ?? calculateElapsedPercent(startTime, endTime),
  );
  const [calledClear, setCalledClear] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    function stopTimer() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    if (pctValue === undefined) {
      interval = setInterval(() => {
        const newValue = calculateElapsedPercent(startTime, endTime);
        setPercent(newValue);
        if (newValue >= 100) {
          if (onClear && !calledClear) {
            onClear();
            setCalledClear(true);
          }
          stopTimer();
        }
      }, 50);
    }
  }, [startTime, endTime, pctValue, calledClear, onClear]);

  const barClasses = ['bar'];
  if (pctValue === undefined && percent < 100) {
    barClasses.push('moving');
  }

  return (
    <div className="timer-bar">
      <div
        className={barClasses.join(' ')}
        style={{
          width: `${percent}%`,
        }}
      />
    </div>
  );
}
