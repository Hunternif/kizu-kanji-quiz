import {
  pingResponse,
  submitPlayerResponse,
} from '../../api/turn/turn-response-api';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { useHandler, useHandler1 } from '../../hooks/data-hooks';
import { GameEntry } from '../../shared/types';
import { useGameContext } from './game-components/GameContext';
import { JapText } from './game-components/JapText';
import { TimerBar } from './game-components/TimerBar';

/** Game screen with a question and multiple choices of answers. */
export function QuestionScreen() {
  const { lobby, turn, player, isSpectator, responses } = useGameContext();
  const response = responses.find((r) => r.player_uid === player.uid);

  const [handleSelect] = useHandler1(async (entry: GameEntry) => {
    await submitPlayerResponse(lobby, turn, player, entry.id);
  });

  const [handleTimeEnd] = useHandler(async () => {
    await pingResponse(lobby, turn, player);
  });

  const isReveal = turn.phase === 'reveal';
  const isSkipped = isReveal && response?.answer_entry_id == null;
  const isCorrect = isReveal && turn.question.id === response?.answer_entry_id;
  const isIncorrect = isReveal && !isSkipped && !isCorrect;

  const rootClasses = ['question-screen'];
  rootClasses.push(`phase-${turn.phase}`);
  if (isSkipped) rootClasses.push('skipped');
  else if (isCorrect) rootClasses.push('correct');
  else if (isIncorrect) rootClasses.push('incorrect');

  return (
    <CenteredLayout innerClassName={rootClasses.join(' ')}>
      <div className="question-group">
        <div className='result-text'>{isCorrect ? 'Correct!' : isIncorrect ? 'Incorrect' : null}</div>
        <div className="timebar-container">
          {turn.next_phase_time && (
            <TimerBar
              startTime={turn.phase_start_time}
              endTime={turn.next_phase_time}
              onClear={handleTimeEnd}
            />
          )}
        </div>
        <QuestionCard text={turn.question.writing} />
      </div>
      <div className="choices">
        {turn.choices?.map((c) => (
          <Choice
            key={c.id}
            text={c.reading_romaji}
            readOnly={isSpectator || turn.phase !== 'answering'}
            answer={c.id === turn.question.id}
            selected={response?.answer_entry_id === c.id}
            reveal={turn.phase === 'reveal'}
            onClick={() => handleSelect(c)}
          />
        ))}
      </div>
    </CenteredLayout>
  );
}

interface QuestionProps {
  text: string;
}

/** The big card showing the question that all players need to answer. */
function QuestionCard({ text }: QuestionProps) {
  const classes = ['question-card'];
  return (
    <div className={classes.join(' ')}>
      <JapText text={text} />
    </div>
  );
}

interface ChoiceProps {
  text: string;
  selected?: boolean;
  answer?: boolean;
  /** Should reveal answer? */
  reveal?: boolean;
  readOnly?: boolean;
  onClick?: () => void;
}

/** Choice card. Players click on it to select their answer. */
function Choice({
  text,
  selected,
  answer,
  reveal,
  readOnly,
  onClick,
}: ChoiceProps) {
  const classes = ['choice-card'];
  if (selected) classes.push('selected');
  if (reveal && answer) classes.push('answer');
  if (reveal && selected && answer) classes.push('correct');
  if (reveal && selected && !answer) classes.push('incorrect');
  if (readOnly) classes.push('readonly');
  if (!readOnly) classes.push('hoverable-card');
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
