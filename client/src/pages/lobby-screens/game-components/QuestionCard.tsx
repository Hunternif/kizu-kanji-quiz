import { getQuestionContent } from '../../../shared/mode-utils';
import { useGameContext } from './GameContext';
import { JapText } from './JapText';

interface QuestionProps {}

/** The big card showing the question that all players need to answer. */
export function QuestionCard({}: QuestionProps) {
  const { turn, language } = useGameContext();
  const isPaused = turn.pause === 'paused';

  const classes = ['question-card'];
  if (isPaused) classes.push('paused');

  const text = getQuestionContent(
    turn.question,
    turn.question_mode,
    turn.game_mode,
    language,
  ).join(', ');
  classes.push(
    text.length > 20 ? 'long' : text.length > 3 ? 'medium' : 'short',
  );

  return (
    <div className={classes.join(' ')}>
      {isPaused && <div className="pause">Paused</div>}
      <JapText className="question-text" text={text} />
    </div>
  );
}
