import { pingResponse, requestPause } from '../../api/turn/turn-response-api';
import { GameButton } from '../../components/Buttons';
import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { HorizontalGroup } from '../../components/layout/VerticalGroup copy';
import { useHandler1 } from '../../hooks/data-hooks';
import {
  isChoiceAnswer,
  isCorrectResponse,
  isTypedAnswer,
} from '../../shared/mode-utils';
import { throttle4 } from '../../shared/utils';
import { ChoiceCard } from './game-components/ChoiceCard';
import { useGameContext } from './game-components/GameContext';
import { QuestionCard } from './game-components/QuestionCard';
import { TimerBar } from './game-components/TimerBar';
import { TurnCount } from './game-components/TurnCount';
import { TypedAnswer } from './game-components/TypedAnswer';

// Throttle prevents us from accidentally updating the document too many times:
const throttledPing = throttle4(pingResponse, 200);

/** Game screen with a question and multiple choices of answers. */
export function QuestionScreen() {
  const { lobby, turn, player, responses, isSpectator, language } =
    useGameContext();
  const response = responses.find((r) => r.player_uid === player.uid);
  const isPaused = turn.pause === 'paused';

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

  const showChoices = isChoiceAnswer(turn.answer_mode);
  const showTyping = isTypedAnswer(turn.answer_mode);
  const isReveal = turn.phase === 'reveal';
  const isSkipped = isReveal && (response?.skip || response?.isEmpty());
  const isCorrect = isReveal && response && isCorrectResponse(turn, response);
  const isIncorrect = isReveal && !isSkipped && !isCorrect;

  const rootClasses = ['question-screen'];
  rootClasses.push(`phase-${turn.phase}`);
  if (isSkipped) rootClasses.push('skipped');
  else if (isCorrect) rootClasses.push('correct');
  else if (isIncorrect) rootClasses.push('incorrect');

  const isTimerEnabled =
    turn.next_phase_time != null && turn.phase_duration_ms != 0;
  const showContinue = turn.phase === 'reveal' || response?.isEmpty() === false;
  const showSkip = response == null || response.isEmpty();

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
        <QuestionCard
          entry={turn.question}
          questionMode={turn.question_mode}
          answerMode={turn.answer_mode}
          paused={turn.pause === 'paused'}
          reveal={turn.phase === 'reveal'}
          lang={language}
        />
      </div>
      {showChoices && (
        <div className="choices">
          {turn.choices?.map((c) => (
            <ChoiceCard key={c.id} entry={c} />
          ))}
        </div>
      )}
      {showTyping && <TypedAnswer disabled={isReveal} />}
      <br />
      {!isSpectator && (
        <HorizontalGroup className="control-button-group">
          {(isTimerEnabled || isPaused) && (
            <GameButton
              secondary={!isPaused}
              loading={pausing}
              onClick={() => handlePause(!isPaused)}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </GameButton>
          )}
          {showContinue ? (
            // TODO: make 'continue' quorum-based
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
      )}
    </CenteredLayout>
  );
}
