import { RNG } from '../../shared/rng';

test('fair random distribution', () => {
  const results = new Array<number>(10).fill(0);
  const rng = RNG.fromIntSeed(12345);
  for (let i = 0; i < 10000; i++) {
    const idx = rng.randomIntClamped(0, 9);
    results[idx]++;
  }
  for (let i = 0; i < 10; i++) {
    expect(results[i]).toBeGreaterThan(900);
  }
  console.info(results);
});

test('shuffle array', () => {
  const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rng = RNG.fromIntSeed(12345);
  rng.shuffleArray(array);
  expect(array).toEqual([2, 7, 9, 8, 1, 4, 3, 5, 6]);
});
