import { useRef, useState } from 'react';
import { useOnNewTurn, useOnTurnPause } from '../../../api/turn/turn-hooks';
import { submitPlayerResponse } from '../../../api/turn/turn-response-api';
import { GameButton } from '../../../components/Buttons';
import { TextInput } from '../../../components/FormControls';
import { useHandler1 } from '../../../hooks/data-hooks';
import { isCorrectResponse } from '../../../shared/mode-utils';
import { AnswerMode } from '../../../shared/types';
import { assertExhaustive } from '../../../shared/utils';
import { useGameContext } from './GameContext';

interface Props {
  disabled?: boolean;
}

/** Used the player types an answer instead of selecting. */
export function TypedAnswer({ disabled }: Props) {
  const { lobby, turn, player, responses, language } = useGameContext();
  const [text, setText] = useState('');

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
      if (!disabled && !isTimerEnabled) {
        await submitResponse(newText);
      }
    },
    [lobby, turn, player, language, isTimerEnabled, disabled],
  );

  // Reset and auto-focus input on new turn:
  const inputRef = useRef<HTMLInputElement>(null);
  useOnNewTurn(() => {
    setText('');
    inputRef.current?.focus();
  }, turn);
  useOnTurnPause(() => {
    if (turn.pause === 'none') {
      inputRef.current?.focus();
    }
  }, turn);

  const classes = ['typed-input-form'];
  if (isSkipped) classes.push('skipped');
  else if (isCorrect) classes.push('correct');
  else if (isIncorrect) classes.push('incorrect');

  const prompt = getPrompt(turn.answer_mode);

  return (
    <form className={classes.join(' ')} onSubmit={(e) => e.preventDefault()}>
      <div className="typed-prompt">{prompt}:</div>
      <div className="input-row">
        <TextInput
          ref={inputRef}
          className="user-typed-input"
          value={disabled ? response?.answer_typed ?? text : text}
          onChange={handleChange}
          disabled={disabled}
        ></TextInput>
        <GameButton
          submit
          onClick={() => submitResponse(text)}
          disabled={disabled}
        >
          Submit
        </GameButton>
      </div>
    </form>
  );
}

function getPrompt(answerMode: AnswerMode): string {
  switch (answerMode) {
    case 'choose_kanji':
      return 'Choose kanji';
    case 'choose_hiragana':
      return 'Choose hiragana';
    case 'choose_romaji':
      return 'Choose romaji';
    case 'choose_meaning':
      return 'Choose meaning';
    case 'type_romaji':
      return 'Type romaji';
    case 'type_meaning':
      return 'Type meaning';
    case 'draw_hiragana':
      return 'Draw hiragana';
    case 'draw_kanji':
      return 'Draw kanji';
    default:
      assertExhaustive(answerMode);
      return '';
  }
}
