import { RNG } from '../../shared/rng';
import { defaultLobbySettings, GameEntry, GameLobby } from '../../shared/types';
import { getHiraganaEntries, selectQuestion } from '../entry-api';

test('parse Hiragana', async () => {
  const hiragana = await getHiraganaEntries();
  expect(hiragana.length).toBe(73);
  expect(hiragana[0].writing).toBe('あ');
  expect(hiragana[0].reading_romaji).toBe('a');
  expect(hiragana[1].writing).toBe('い');
  expect(hiragana[1].reading_romaji).toBe('i');
  expect(hiragana[72].writing).toBe('ん');
  expect(hiragana[72].reading_romaji).toBe('n');
});

test('select question and choices', () => {
  const rng = RNG.fromIntSeed(12345);
  const lobby = new GameLobby('test', 'test_uid', defaultLobbySettings());
  lobby.questions = [
    makeEntry('one', 1),
    makeEntry('two', 2),
    makeEntry('three', 3),
    makeEntry('four', 4),
    makeEntry('five', 5),
  ];
  lobby.settings.answer_mode = 'choose_hiragana';
  lobby.settings.num_choices = 3;
  expect(lobby.used_question_count).toBe(0);

  const { question: q1, choices: ch1 } = selectQuestion(lobby, rng);
  expect(lobby.used_question_count).toBe(1);
  expect(q1?.id).toBe('one');
  expect(ch1?.map((c) => c.id)).toEqual(['one', 'three', 'four']);

  const { question: q2, choices: ch2 } = selectQuestion(lobby, rng);
  expect(lobby.used_question_count).toBe(2);
  expect(q2?.id).toBe('two');
  expect(ch2?.map((c) => c.id)).toEqual(['three', 'two', 'one']);

  const { question: q3, choices: ch3 } = selectQuestion(lobby, rng);
  expect(lobby.used_question_count).toBe(3);
  expect(q3?.id).toBe('three');
  expect(ch3?.map((c) => c.id)).toEqual(['two', 'one', 'three']);
});

function makeEntry(id: string, randomIndex: number = 0) {
  return new GameEntry(
    id,
    randomIndex,
    'Test?',
    'this is hiragana',
    'this is romaji',
    new Map([['english', ['this is english']]]),
  );
}
