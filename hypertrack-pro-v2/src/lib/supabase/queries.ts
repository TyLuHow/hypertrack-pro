import { getSupabase } from './client';

type WorkoutInsert = {
  workout_date: string;
  start_time: string;
  end_time?: string | null;
  notes?: string | null;
  total_volume?: number | null;
  total_sets?: number | null;
  metadata?: unknown;
  tags?: unknown;
  user_id?: string | null;
};

export const workoutQueries = {
  async getAll() {
    const supabase = getSupabase();
    return (supabase as any).from('workouts').select('*').order('workout_date', { ascending: false });
  },
  async create(workout: WorkoutInsert) {
    const supabase = getSupabase();
    return (supabase as any).from('workouts').insert(workout as any).select('*').single();
  }
};


