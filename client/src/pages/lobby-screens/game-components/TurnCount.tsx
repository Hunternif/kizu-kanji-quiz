import { useGameContext } from './GameContext';

export function TurnCount() {
  const { lobby } = useGameContext();
  return (
    <div className="turn-count">
      {lobby.used_question_count}/{lobby.questions.length}
    </div>
  );
}
