import { calculateProgression } from '@research/progressive-overload/algorithm';
import { detectPlateau } from '@research/plateau-detection/algorithm';

describe('Core flow smoke tests', () => {
  test('progression + plateau interop', () => {
    const prog = calculateProgression({ exerciseType: 'compound', currentWeight: 200, achievedReps: 10, daysSinceLastSession: 7 });
    expect(prog.recommendedWeight).toBeGreaterThan(200);
    const plateau = detectPlateau({ sessions: [
      { date: '2025-09-01', sets: [{ weight: 100, reps: 8 }] },
      { date: '2025-09-02', sets: [{ weight: 100, reps: 8 }] },
      { date: '2025-09-03', sets: [{ weight: 100, reps: 8 }] }
    ] });
    expect(typeof plateau.plateauDetected).toBe('boolean');
  });
});


