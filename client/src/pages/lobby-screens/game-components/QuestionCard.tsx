import { getQuestionContent } from "../../../shared/mode-utils";
import { useGameContext } from "./GameContext";
import { JapText } from "./JapText";

interface QuestionProps {}

/** The big card showing the question that all players need to answer. */
export function QuestionCard({}: QuestionProps) {
  const { turn, language } = useGameContext();
  const classes = ['question-card'];
  const text = getQuestionContent(
    turn.question,
    turn.question_mode,
    turn.game_mode,
    language,
  );
  return (
    <div className={classes.join(' ')}>
      <JapText text={text} />
    </div>
  );
}