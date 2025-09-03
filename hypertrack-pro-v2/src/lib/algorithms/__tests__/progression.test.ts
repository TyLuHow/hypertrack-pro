import { calculateProgression, ProgressionInput } from '../progression';

describe('Progression Algorithm (legacy-preserved)', () => {
  test('compound: gate passes at >=10 reps and increases with rounding', () => {
    const input: ProgressionInput = {
      exerciseType: 'compound',
      currentWeight: 200,
      achievedReps: 10,
      daysSinceLastSession: 7
    };
    const out = calculateProgression(input);
    expect(out.shouldProgress).toBe(true);
    // 200 * (1 + 0.0035 * 1) = 200.7 -> ceil(200.7/2.5)=81 -> 81*2.5=202.5
    expect(out.recommendedWeight).toBe(202.5);
  });

  test('compound: gate fails below 10 reps and holds', () => {
    const out = calculateProgression({
      exerciseType: 'compound',
      currentWeight: 200,
      achievedReps: 9,
      daysSinceLastSession: 7
    });
    expect(out.shouldProgress).toBe(false);
    expect(out.recommendedWeight).toBe(200);
  });

  test('isolation: gate passes at >=12 reps and increases with rounding', () => {
    const out = calculateProgression({
      exerciseType: 'isolation',
      currentWeight: 50,
      achievedReps: 12,
      daysSinceLastSession: 7
    });
    // 50 * (1 + 0.005 * 1) = 50.25 -> ceil(50.25/2.5)=21 -> 52.5
    expect(out.recommendedWeight).toBe(52.5);
  });

  test('daysSinceLastSession factor: min clamp 0.5', () => {
    const out = calculateProgression({
      exerciseType: 'compound',
      currentWeight: 100,
      achievedReps: 10,
      daysSinceLastSession: 2 // 2/7 < 0.5 -> 0.5
    });
    // 100 * (1 + 0.0035 * 0.5) = 100.175 -> ceil -> 102.5
    expect(out.recommendedWeight).toBe(102.5);
  });
});




