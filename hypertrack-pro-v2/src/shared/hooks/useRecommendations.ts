import { useMemo } from 'react';
import { calculateProgression } from '../../lib/algorithms/progression';
import { useWorkoutStore } from '../stores/workoutStore';
import { useQuery } from '@tanstack/react-query';
import { getPerMuscleWeeklySets } from '../../lib/supabase/queries';
import { RESEARCH_VOLUME_TARGETS } from '../constants/researchTargets';
import { inferExerciseType } from '../utils/exerciseClassification';

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
    // infer type from exercise name if present
    const ex = currentWorkout?.exercises.find(e => e.id === activeExerciseId);
    const inferred = inferExerciseType(ex?.name || '');
    return calculateProgression({
      exerciseType: inferred.type,
      currentWeight,
      achievedReps,
      daysSinceLastSession: 7
    });
  }, [activeExerciseId, currentWeight, achievedReps]);

  // research-backed volume recommendations per muscle
  const { data: weeklySets } = useQuery({ queryKey: ['per-muscle-weekly-sets'], queryFn: () => getPerMuscleWeeklySets(8) });
  const researchRecommendations = useMemo(() => {
    if (!weeklySets || weeklySets.length === 0) return [] as Array<{ muscle: string; type: 'volume_increase' | 'volume_reduce' | 'maintain'; current: number; recommended: number; citation: string; reasoning: string; urgency: 'high' | 'medium' | 'low' }>;
    // average last 4 weeks per muscle
    const byMuscle = new Map<string, number[]>();
    for (const w of weeklySets) {
      const arr = byMuscle.get(w.muscle) || [];
      arr.push(w.sets);
      byMuscle.set(w.muscle, arr);
    }
    const out: Array<{ muscle: string; type: 'volume_increase' | 'volume_reduce' | 'maintain'; current: number; recommended: number; citation: string; reasoning: string; urgency: 'high' | 'medium' | 'low' }> = [];
    Array.from(byMuscle.entries()).forEach(([muscle, sets]) => {
      const last4 = sets.slice(-4);
      const avg = last4.length ? Math.round(last4.reduce((a, b) => a + b, 0) / last4.length) : 0;
      const key = (muscle || '').toLowerCase();
      const targets = (RESEARCH_VOLUME_TARGETS as any)[key];
      if (!targets) return;
      if (avg < targets.min) {
        out.push({
          muscle,
          type: 'volume_increase',
          current: avg,
          recommended: targets.min,
          citation: targets.citation,
          reasoning: `Below minimum effective volume (~${targets.min} sets/week).`,
          urgency: 'high'
        });
      } else if (avg > targets.max) {
        out.push({
          muscle,
          type: 'volume_reduce',
          current: avg,
          recommended: targets.optimal,
          citation: targets.citation,
          reasoning: `Above likely maximum adaptive volume (>~${targets.max} sets/week).`,
          urgency: 'medium'
        });
      } else {
        out.push({
          muscle,
          type: 'maintain',
          current: avg,
          recommended: targets.optimal,
          citation: targets.citation,
          reasoning: 'Within evidence-based optimal range. Maintain volume.',
          urgency: 'low'
        });
      }
    });
    return out.sort((a, b) => (a.type === 'volume_increase' ? -1 : a.type === 'volume_reduce' && b.type !== 'volume_increase' ? -1 : 1));
  }, [weeklySets]);

  return { recommendation, researchRecommendations };
}



