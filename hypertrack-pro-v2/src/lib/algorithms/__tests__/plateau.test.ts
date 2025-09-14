import { detectPlateau, type WorkoutExerciseSession } from '../../../research/plateau-detection/algorithm';

const makeSession = (weight: number): WorkoutExerciseSession => ({
  date: new Date().toISOString(),
  sets: [{ weight, reps: 8 }]
});

describe('Plateau Detection (legacy thresholds)', () => {
  test('insufficient data (<3) -> no plateau', () => {
    const res = detectPlateau({ sessions: [makeSession(100), makeSession(101)] });
    expect(res.plateauDetected).toBe(false);
  });

  test('flat weights with low variance -> plateau', () => {
    const res = detectPlateau({ sessions: [makeSession(100), makeSession(100), makeSession(100), makeSession(100)] });
    expect(res.plateauDetected).toBe(true);
  });

  test('increasing weights -> not plateau', () => {
    const res = detectPlateau({ sessions: [makeSession(100), makeSession(102.5), makeSession(105), makeSession(107.5)] });
    expect(res.plateauDetected).toBe(false);
  });
});




