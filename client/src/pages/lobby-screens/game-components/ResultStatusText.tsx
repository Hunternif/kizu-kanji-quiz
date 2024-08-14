import { ReactNode, useEffect, useState } from 'react';
import { IconCheckInline, IconXThickInline } from '../../../components/Icons';

interface Props {
  correct?: boolean;
  incorrect?: boolean;
  /** If present, the text will linger on the screen. */
  linger?: boolean;
  /** Linger duration [ms], defaults to 1 second. */
  durationMs?: number;
}

type Status = 'correct' | 'incorrect' | 'none';

function getText(status: Status): ReactNode {
  switch (status) {
    case 'correct':
      return (
        <>
          <IconCheckInline className="correct" /> Correct!
        </>
      );
    case 'incorrect':
      return (
        <>
          <IconXThickInline className="incorrect" /> Incorrect
        </>
      );
    case 'none':
      return null;
  }
}

/**
 * Text that tells you if you are correct.
 *
 * The results linger on the screen for some time,
 * in case if the 'reveal' screen is skipped.
 */
export function ResultStatusText({
  correct,
  incorrect,
  linger,
  durationMs,
}: Props) {
  const [status, setStatus] = useState<Status>('none');

  useEffect(() => {
    let timeout: any;

    function stopTimer() {
      if (timeout !== undefined) {
        clearTimeout(timeout);
      }
    }

    if (correct) {
      stopTimer();
      setStatus('correct');
    }
    if (incorrect) {
      stopTimer();
      setStatus('incorrect');
    }
    if (!correct && !incorrect) {
      if (linger) {
        timeout = setTimeout(() => setStatus('none'), durationMs ?? 1000);
      } else {
        setStatus('none');
      }
    }
  }, [correct, incorrect, linger, durationMs]);
  return <div className="result-text">{getText(status)}</div>;
}
