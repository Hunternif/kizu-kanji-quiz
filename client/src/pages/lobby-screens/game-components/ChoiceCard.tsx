import { submitPlayerResponse } from '../../../api/turn/turn-response-api';
import { useHandler } from '../../../hooks/data-hooks';
import {
  getAnswerContent,
  isCorrectChoiceAnswer,
} from '../../../shared/mode-utils';
import { GameEntry } from '../../../shared/types';
import { useGameContext } from './GameContext';
import { JapText } from './JapText';

interface ChoiceProps {
  entry: GameEntry;
  onClick?: () => void;
}

/** Choice card. Players click on it to select their answer. */
export function ChoiceCard({ entry, onClick }: ChoiceProps) {
  const { lobby, turn, player, isSpectator, responses, language } =
    useGameContext();
  const response = responses.find((r) => r.player_uid === player.uid);

  const isPaused = turn.pause === 'paused';
  const readOnly = isSpectator || turn.phase !== 'answering' || isPaused;
  const isCorrect = isCorrectChoiceAnswer(turn, entry, language);
  const isSelected = response?.answer_entry_id === entry.id;
  const isReveal = turn.phase === 'reveal';

  const classes = ['choice-card'];
  if (isSelected) classes.push('selected');
  if (isReveal && isCorrect) classes.push('answer');
  if (isReveal && isSelected && isCorrect) classes.push('correct');
  if (isReveal && isSelected && !isCorrect) classes.push('incorrect');
  if (readOnly) classes.push('readonly');
  if (!readOnly) classes.push('hoverable-card');
  if (isPaused) classes.push('disabled');

  const text = getAnswerContent(
    entry,
    turn.answer_mode,
    turn.game_mode,
    language,
  ).join(', ');

  const [handleSubmit] = useHandler(async () => {
    await submitPlayerResponse(lobby, turn, player, language, entry.id);
  }, [lobby, turn, player, entry, language]);

  return (
    <div
      className={classes.join(' ')}
      onClick={() => {
        if (!readOnly) {
          if (onClick) onClick();
          handleSubmit();
        }
      }}
    >
      <JapText text={text} />
    </div>
  );
}
