import { useGameContext } from './GameContext';

export function TurnCount() {
  const { lobby } = useGameContext();
  const max =
    lobby.settings.max_questions > 0
      ? lobby.settings.max_questions
      : lobby.questions.length;
  return (
    <div className="turn-count">
      {lobby.used_question_count}/{max}
    </div>
  );
}
