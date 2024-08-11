import {
  getEntryMeaning,
  getQuestionContent,
} from '../../../shared/mode-utils';
import { GameEntry, Language } from '../../../shared/types';
import { useGameContext } from './GameContext';
import { JapText } from './JapText';

interface QuestionProps {}

/** The big card showing the question that all players need to answer. */
export function QuestionCard({}: QuestionProps) {
  const { turn, language } = useGameContext();
  const isPaused = turn.pause === 'paused';
  const isQuestion = turn.phase === 'answering';
  const isReveal = turn.phase === 'reveal';

  const cardClasses = ['question-card'];
  if (isPaused) cardClasses.push('paused');
  if (isQuestion) cardClasses.push('question');
  if (isReveal) cardClasses.push('explanation');

  const text = getQuestionContent(
    turn.question,
    turn.question_mode,
    turn.game_mode,
    language,
  ).join(', ');

  return (
    <div className={cardClasses.join(' ')}>
      {isPaused && <div className="pause">Paused</div>}
      <main className="main-content">
        <JapText
          short={2}
          className="question-text"
          text={isReveal ? turn.question.writing : text}
        />
      </main>
      <section className="details">
        {isReveal && <Explanation entry={turn.question} lang={language} />}
      </section>
    </div>
  );
}

interface ExplanationProps {
  entry: GameEntry;
  lang: Language;
}

/** Shows a detailed answer, for studying. */
function Explanation({ entry, lang }: ExplanationProps) {
  return (
    <>
      {entry.isKana ? (
        <JapText className="kana" text={entry.readings_romaji.join(', ')} />
      ) : (
        <>
          <aside className="readings">
            {/* <header>Reading</header> */}
            <JapText text={entry.readings_hiragana.join(', ')} />
          </aside>
          <aside className="meanings">
            {/* <header>Meaning</header> */}
            <JapText text={getEntryMeaning(entry, lang).join(', ')} />
          </aside>
        </>
      )}
    </>
  );
}
