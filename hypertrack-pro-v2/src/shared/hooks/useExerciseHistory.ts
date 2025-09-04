import { useEffect, useState } from 'react';
import { getSupabase } from '../../lib/supabase/client';

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
        const { data, error } = await (supabase
          .from('exercise_performance' as any)
          .select('exercise_name,max_weight,workout_date')
          .eq('exercise_name', exerciseName)
          .order('workout_date', { ascending: false })
          .limit(5));
        if (error) throw error;
        const last = data?.[0]?.max_weight ?? null;
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


