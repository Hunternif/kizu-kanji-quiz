import {
  pingResponse,
  requestPause,
  submitPlayerResponse,
} from '../../api/turn/turn-response-api';
import { Checkbox } from '../../components/Checkbox';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { useHandler1 } from '../../hooks/data-hooks';
import { GameEntry } from '../../shared/types';
import { throttle } from '../../shared/utils';
import { ChoiceCard } from './game-components/ChoiceCard';
import { useGameContext } from './game-components/GameContext';
import { QuestionCard } from './game-components/QuestionCard';
import { TimerBar } from './game-components/TimerBar';
import { TurnCount } from './game-components/TurnCount';

const throttledPing = throttle(pingResponse, 1000);

/** Game screen with a question and multiple choices of answers. */
export function QuestionScreen() {
  const { lobby, turn, player, responses } = useGameContext();
  const response = responses.find((r) => r.player_uid === player.uid);
  const isPaused = turn.pause === 'paused';

  const [handleSelect] = useHandler1(async (entry: GameEntry) => {
    await submitPlayerResponse(lobby, turn, player, entry.id);
  });

  async function handleTimeEnd() {
    try {
      await throttledPing(lobby, turn, player);
      // Don't display these errors because these shouldn't block the player.
    } catch (e: any) {
      console.log(e);
    }
  }

  const [handlePause] = useHandler1(async (shouldPause: boolean) => {
    await requestPause(lobby, turn, player, shouldPause);
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
        <TurnCount />
        <div className="result-text">
          {isCorrect ? 'Correct!' : isIncorrect ? 'Incorrect' : null}
        </div>
        <div className="timebar-container">
          {turn.next_phase_time && (
            <TimerBar
              startTime={turn.getStartTime()}
              endTime={turn.next_phase_time}
              onClear={handleTimeEnd}
              paused={isPaused}
            />
          )}
        </div>
        <QuestionCard />
      </div>
      <div className="choices">
        {turn.choices?.map((c) => (
          <ChoiceCard key={c.id} entry={c} onClick={() => handleSelect(c)} />
        ))}
      </div>
      <br />
      <Checkbox label="Pause" checked={isPaused} onToggle={handlePause} />
    </CenteredLayout>
  );
}
