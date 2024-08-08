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

  return (
    <CenteredLayout innerClassName="question-screen">
      <div className="question-group">
        {turn.phase}
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
            readOnly={isSpectator}
            selected={response?.answer_entry_id === c.id}
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
  readOnly?: boolean;
  onClick?: () => void;
}

/** Choice card. Players click on it to select their answer. */
function Choice({ text, selected, readOnly, onClick }: ChoiceProps) {
  const classes = ['choice-card'];
  if (selected) classes.push('selected');
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
