import { useEffect, useState } from 'react';
import { getSupabase, getCurrentUserId } from '../../lib/supabase/client';

export interface ExerciseHistorySuggestion {
  lastWeight: number | null;
  suggestedWeight: number | null;
  label: string | null;
}

export const useExerciseHistory = (exerciseName?: string | null): ExerciseHistorySuggestion => {
  const [state, setState] = useState<ExerciseHistorySuggestion>({ lastWeight: null, suggestedWeight: null, label: null });

  useEffect(() => {
    if (!exerciseName) {
      setState({ lastWeight: null, suggestedWeight: null, label: null });
      return;
    }
    const run = async () => {
      try {
        const supabase = getSupabase() as any;
        const uid = await getCurrentUserId();
        // Join sets -> workout_exercises -> exercises -> workouts to compute recent max weight
        const { data, error } = await (supabase
          .from('sets')
          .select('weight, workout_exercises!inner(exercise_id, exercises(name)), workout_exercises!inner(workouts!inner(user_id,workout_date))')
          .order('workout_exercises(workouts!inner.workout_date)', { ascending: false })
          .limit(50));
        if (error) throw error;
        const rows = (data || []) as any[];
        const filtered = rows.filter(r => r.workout_exercises?.exercises?.name === exerciseName && (!uid || r.workout_exercises?.workouts?.user_id === uid));
        const last = filtered.length ? Math.max(...filtered.slice(0, 10).map(r => Number(r.weight) || 0)) : null;
        const suggested = last == null ? null : Math.ceil((last * 1.02) / 2.5) * 2.5; // +2% rounded to 2.5
        setState({ lastWeight: last, suggestedWeight: suggested, label: last == null ? null : `Last: ${last}lbs` });
      } catch {
        setState({ lastWeight: null, suggestedWeight: null, label: null });
      }
    };
    run();
  }, [exerciseName]);

  return state;
};


