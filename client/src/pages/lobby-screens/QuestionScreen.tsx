import {
  pingResponse,
  requestPause,
  submitPlayerResponse,
} from '../../api/turn/turn-response-api';
import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { HorizontalGroup } from '../../components/layout/VerticalGroup copy';
import { useHandler1 } from '../../hooks/data-hooks';
import { isCorrectResponse } from '../../shared/mode-utils';
import { GameEntry } from '../../shared/types';
import { throttle4 } from '../../shared/utils';
import { ChoiceCard } from './game-components/ChoiceCard';
import { useGameContext } from './game-components/GameContext';
import { QuestionCard } from './game-components/QuestionCard';
import { TimerBar } from './game-components/TimerBar';
import { TurnCount } from './game-components/TurnCount';

// Throttle prevents us from accidentally updating the document too many times:
const throttledPing = throttle4(pingResponse, 1000);

/** Game screen with a question and multiple choices of answers. */
export function QuestionScreen() {
  const { lobby, turn, player, responses, language } = useGameContext();
  const response = responses.find((r) => r.player_uid === player.uid);
  const isPaused = turn.pause === 'paused';

  const [handleSelect] = useHandler1(
    async (entry: GameEntry) => {
      await submitPlayerResponse(lobby, turn, player, language, entry.id);
    },
    [lobby, turn, player, language],
  );

  /** Notifies the server that this player is ready for the next phase.
   * @param skip if true, will mark this response as skipped. */
  async function signalNextPhase(skip: boolean) {
    try {
      await throttledPing(lobby, turn, player, skip);
      // Don't display these errors because these shouldn't block the player.
    } catch (e: any) {
      console.log(e);
    }
  }

  const [handlePause, pausing] = useHandler1(
    async (shouldPause: boolean) => {
      await requestPause(lobby, turn, player, shouldPause);
    },
    [lobby, turn, player],
  );

  const isReveal = turn.phase === 'reveal';
  const isSkipped = isReveal && response?.answer_entry_id == null;
  const isCorrect = isReveal && response && isCorrectResponse(turn, response);
  const isIncorrect = isReveal && !isSkipped && !isCorrect;

  const rootClasses = ['question-screen'];
  rootClasses.push(`phase-${turn.phase}`);
  if (isSkipped) rootClasses.push('skipped');
  else if (isCorrect) rootClasses.push('correct');
  else if (isIncorrect) rootClasses.push('incorrect');

  const isTimerEnabled =
    turn.next_phase_time != null && turn.phase_duration_ms != 0;
  const showContinue =
    !isTimerEnabled && response?.isEmpty() === false && turn.phase === 'reveal';
  const showSkip = !isTimerEnabled && (response == null || response.isEmpty());

  return (
    <CenteredLayout innerClassName={rootClasses.join(' ')}>
      <div className="question-group">
        <TurnCount />
        <div className="result-text">
          {isCorrect ? 'Correct!' : isIncorrect ? 'Incorrect' : null}
        </div>
        <div className="timebar-container">
          {isTimerEnabled && turn.next_phase_time && (
            <TimerBar
              startTime={turn.getStartTime()}
              endTime={turn.next_phase_time}
              onClear={() => signalNextPhase(false)}
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
      <HorizontalGroup className="control-button-group">
        {isTimerEnabled ||
          (isPaused && (
            <GameButton
              secondary={!isPaused}
              loading={pausing}
              onClick={() => handlePause(!isPaused)}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </GameButton>
          ))}
        {showContinue ? (
          <GameButton onClick={() => signalNextPhase(true)}>
            Continue
          </GameButton>
        ) : (
          showSkip && (
            <GameButton secondary onClick={() => signalNextPhase(true)}>
              Skip
            </GameButton>
          )
        )}
      </HorizontalGroup>
    </CenteredLayout>
  );
}
