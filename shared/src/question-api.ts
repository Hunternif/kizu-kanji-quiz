import { getAnswerContent } from "./mode-utils";
import { RNG } from "./rng";
import { GameEntry, GameLobby } from "./types";

/**
 * Returns a new question and removes it from the list of questions.
 * If no more questions, returns null.
 *
 * Also provides a multiple choices, if applicable.
 * The choices include the true answer.
 */
export function selectQuestion(
  lobby: GameLobby,
  rng: RNG = RNG.fromStrSeedWithTimestamp('choices'),
): {
  question: GameEntry | null;
  choices?: GameEntry[];
} {
  // Assuming that the list of questions is already sorted in order.
  if (lobby.used_question_count >= lobby.questions.length) {
    return { question: null };
  }
  const question = lobby.questions[lobby.used_question_count];
  lobby.used_question_count++;
  // Could potentially return the next N answers, instead of random ones.

  // Add choices for all question types, just in case they switch question type mid-round.
  const choiceSet = new Set<GameEntry>([question]);
  // Check what the choice actually looks like, to remove identical choices:
  const choiceContentSet = new Set<string>();
  choiceContentSet.add(
    getAnswerContent(
      question,
      lobby.settings.question_mode,
      lobby.settings.answer_mode,
      'en',
    ).join(', '),
  );
  const choices = new Array<GameEntry>();
  const targetCount = Math.max(
    2,
    Math.min(lobby.settings.num_choices, lobby.questions.length),
  );
  // Count retries to prevent an infinite loop:
  let retryCounter = 0;
  while (choiceSet.size < targetCount) {
    const i = rng.randomIntClamped(0, lobby.questions.length - 1);
    const choice = lobby.questions[i];
    const choiceContent = getAnswerContent(
      choice,
      lobby.settings.question_mode,
      lobby.settings.answer_mode,
      'en',
    ).join(', ');
    if (choiceSet.has(choice) || choiceContentSet.has(choiceContent)) {
      retryCounter++;
      if (retryCounter >= 20) break;
    } else {
      choiceSet.add(choice);
      choiceContentSet.add(choiceContent);
    }
  }
  // Shuffle choices so that the answer is at a random spot.
  choices.push(...choiceSet);
  rng.shuffleArray(choices);
  return { question, choices };
}
