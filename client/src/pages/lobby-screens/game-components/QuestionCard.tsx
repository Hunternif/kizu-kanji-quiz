import {
  getEntryMeaning,
  getQuestionContent,
} from '../../../shared/mode-utils';
import {
  AnswerMode,
  GameEntry,
  Language,
  QuestionMode,
} from '../../../shared/types';
import { JapText } from './JapText';

interface QuestionProps {
  entry: GameEntry;
  questionMode: QuestionMode;
  answerMode: AnswerMode;
  lang: Language;
  paused?: boolean;
  reveal?: boolean;
}

/** The big card showing the question that all players need to answer. */
export function QuestionCard({
  entry,
  questionMode,
  answerMode,
  lang,
  paused,
  reveal,
}: QuestionProps) {
  const cardClasses = ['question-card'];
  if (paused) cardClasses.push('paused');
  if (!reveal) cardClasses.push('question');
  if (reveal) cardClasses.push('explanation');

  const text = getQuestionContent(entry, questionMode, answerMode, lang).join(
    ', ',
  );

  return (
    <div className={cardClasses.join(' ')}>
      {paused && <div className="pause">Paused</div>}
      <main className="main-content">
        <JapText
          splitJapWords
          short={2}
          className="question-text"
          text={reveal ? entry.writing : text}
        />
      </main>
      <section className="details">
        {reveal && <Explanation entry={entry} lang={lang} />}
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
            <JapText splitJapWords text={entry.readings_hiragana.join(', ')} />
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
