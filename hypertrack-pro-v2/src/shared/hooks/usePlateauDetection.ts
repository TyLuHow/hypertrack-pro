import { useMemo } from 'react';
import { detectPlateau, getDeloadRecommendation, WorkoutExerciseSession } from '@research/plateau-detection/algorithm';

export function usePlateauDetection(sessions: WorkoutExerciseSession[]) {
  const analysis = useMemo(() => detectPlateau({ sessions }), [sessions]);
  const deload = analysis.plateauDetected ? getDeloadRecommendation() : undefined;
  return { analysis, deload };
}



