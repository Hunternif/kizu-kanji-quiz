import { getAnswerContent } from '../../../shared/mode-utils';
import { GameEntry } from '../../../shared/types';
import { useGameContext } from './GameContext';
import { JapText } from './JapText';

interface ChoiceProps {
  entry: GameEntry;
  onClick?: () => void;
}

/** Choice card. Players click on it to select their answer. */
export function ChoiceCard({ entry, onClick }: ChoiceProps) {
  const { turn, player, isSpectator, responses, language } = useGameContext();
  const response = responses.find((r) => r.player_uid === player.uid);

  const readOnly = isSpectator || turn.phase !== 'answering';
  const isAnswer = entry.id === turn.question.id;
  const isSelected = response?.answer_entry_id === entry.id;
  const isReveal = turn.phase === 'reveal';

  const classes = ['choice-card'];
  if (isSelected) classes.push('selected');
  if (isReveal && isAnswer) classes.push('answer');
  if (isReveal && isSelected && isAnswer) classes.push('correct');
  if (isReveal && isSelected && !isAnswer) classes.push('incorrect');
  if (readOnly) classes.push('readonly');
  if (!readOnly) classes.push('hoverable-card');

  const text = getAnswerContent(
    entry,
    turn.answer_mode,
    turn.game_mode,
    language,
  );
  return (
    <div
      className={classes.join(' ')}
      onClick={() => {
        if (onClick && !readOnly) {
          onClick();
        }
      }}
    >
      <JapText text={text} />
    </div>
  );
}
