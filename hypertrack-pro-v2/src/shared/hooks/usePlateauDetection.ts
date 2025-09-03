import { useMemo } from 'react';
import { detectPlateau, getDeloadRecommendation, WorkoutExerciseSession } from '../../lib/algorithms/plateau';

export function usePlateauDetection(sessions: WorkoutExerciseSession[]) {
  const analysis = useMemo(() => detectPlateau({ sessions }), [sessions]);
  const deload = analysis.plateauDetected ? getDeloadRecommendation() : undefined;
  return { analysis, deload };
}



