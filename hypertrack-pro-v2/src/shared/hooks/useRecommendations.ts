import { useMemo } from 'react';
import { calculateProgression } from '../../lib/algorithms/progression';
import { useWorkoutStore } from '../stores/workoutStore';

export function useRecommendations(activeExerciseId?: string) {
  const { currentWorkout } = useWorkoutStore();

  const { currentWeight, achievedReps } = useMemo(() => {
    if (!activeExerciseId || !currentWorkout) return { currentWeight: 0, achievedReps: 0 };
    const ex = currentWorkout.exercises.find(e => e.id === activeExerciseId);
    const last = ex?.sets[ex.sets.length - 1];
    return {
      currentWeight: last?.weight ?? 0,
      achievedReps: last?.reps ?? 0
    };
  }, [activeExerciseId, currentWorkout]);

  const recommendation = useMemo(() => {
    if (!activeExerciseId || currentWeight <= 0 || achievedReps <= 0) return undefined;
    // TODO: determine actual exercise type from library; default to compound for now
    return calculateProgression({
      exerciseType: 'compound',
      currentWeight,
      achievedReps,
      daysSinceLastSession: 7
    });
  }, [activeExerciseId, currentWeight, achievedReps]);

  return { recommendation };
}



