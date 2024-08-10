import { useEffect, useState } from 'react';
import { submitPlayerResponse } from '../../../api/turn/turn-response-api';
import { GameButton } from '../../../components/Buttons';
import { TextInput } from '../../../components/FormControls';
import { useHandler1 } from '../../../hooks/data-hooks';
import { isCorrectResponse } from '../../../shared/mode-utils';
import { useGameContext } from './GameContext';

interface Props {
  disabled?: boolean;
}

/** Used the player types an answer instead of selecting. */
export function TypedAnswer({ disabled }: Props) {
  const { lobby, turn, player, responses, language } = useGameContext();
  const [text, setText] = useState('');
  // Remember turn ID, to reset input when the turn changes:
  const [lastTurnID, setLastTurnID] = useState(turn.id);
  const response = responses.find((r) => r.player_uid === player.uid);

  const isReveal = turn.phase === 'reveal';
  const isSkipped = isReveal && response?.answer_typed == null;
  const isCorrect = isReveal && response && isCorrectResponse(turn, response);
  const isIncorrect = isReveal && !isSkipped && !isCorrect;
  const isTimerEnabled =
    turn.next_phase_time != null && turn.phase_duration_ms != 0;

  const [submitResponse] = useHandler1(
    async (newText: string) => {
      await submitPlayerResponse(
        lobby,
        turn,
        player,
        language,
        undefined,
        newText,
      );
    },
    [lobby, turn, player, language],
  );

  const [handleChange] = useHandler1(
    async (newText: string) => {
      setText(newText);
      // Don't submit if there is no timer, so that the turn doesn't auto-advance.
      if (!disabled && isTimerEnabled) {
        await submitResponse(newText);
      }
    },
    [lobby, turn, player, language, isTimerEnabled, disabled],
  );

  // Reset input on new turn:
  useEffect(() => {
    if (lastTurnID !== turn.id) {
      setLastTurnID(turn.id);
      setText('');
    }
  }, [turn.id, lastTurnID]);

  const classes = ['typed-input-form'];
  if (isSkipped) classes.push('skipped');
  else if (isCorrect) classes.push('correct');
  else if (isIncorrect) classes.push('incorrect');

  return (
    <form className={classes.join(' ')} onSubmit={(e) => e.preventDefault()}>
      <TextInput
        value={disabled ? response?.answer_typed ?? text : text}
        onChange={handleChange}
        disabled={disabled}
      ></TextInput>
      {!isTimerEnabled && (
        <GameButton
          submit
          onClick={() => submitResponse(text)}
          disabled={disabled}
        >
          Submit
        </GameButton>
      )}
    </form>
  );
}
