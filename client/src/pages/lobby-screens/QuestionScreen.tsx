import { CenteredLayout } from '../../components/layout/CenteredLayout';
import { useGameContext } from './game-components/GameContext';
import { JapText } from './game-components/JapText';

/** Game screen with a question and multiple choices of answers. */
export function QuestionScreen() {
  const { turn, isSpectator } = useGameContext();
  return (
    <CenteredLayout innerClassName="question-screen">
      <QuestionCard text={turn.question.writing} />
      <div className="choices">
        {turn.choices?.map((c) => (
          <Choice key={c.id} text={c.reading_romaji} readOnly={isSpectator} />
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
}

/** Choice card. Players click on it to select their answer. */
function Choice({ text, selected, readOnly }: ChoiceProps) {
  const classes = ['choice-card'];
  if (selected) classes.push('selected');
  if (readOnly) classes.push('readonly');
  if (!readOnly) classes.push('hoverable-card');
  return (
    <div className={classes.join(' ')}>
      <JapText text={text} />
    </div>
  );
}
