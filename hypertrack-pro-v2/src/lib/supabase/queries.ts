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


// -------- Analytics & Records (live) --------

export type ProgressSummary = {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  avgDuration: number;
  weeklyWorkoutTrend?: number;
  weeklySetTrend?: number;
  volumeTrend?: number;
  durationTrend?: number;
};

export async function getProgressSummary(userId: string): Promise<ProgressSummary> {
  const supabase = getSupabase() as any;
  const { data, error } = await (supabase
    .from('workouts')
    .select('id,start_time,end_time,total_volume,total_sets')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false }));
  if (error) throw error;
  const rows = (data || []) as Array<{ id: number; start_time: string; end_time: string | null; total_volume: number | null; total_sets: number | null }>;
  const totalWorkouts = rows.length;
  const totalSets = rows.reduce((acc, r) => acc + (r.total_sets || 0), 0);
  const totalVolume = Math.round(rows.reduce((acc, r) => acc + (r.total_volume || 0), 0));
  const durations = rows.map((r) => {
    if (!r.start_time || !r.end_time) return 0;
    const start = new Date(r.start_time).getTime();
    const end = new Date(r.end_time).getTime();
    return Math.max(0, Math.round((end - start) / 60000));
  });
  const avgDuration = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  return { totalWorkouts, totalSets, totalVolume, avgDuration };
}

export type PersonalRecord = {
  exerciseName: string;
  maxWeight: number;
  maxVolume: number;
  maxReps: number;
  lastAchieved: string;
};

export async function getPersonalRecords(userId?: string): Promise<PersonalRecord[]> {
  const supabase = getSupabase() as any;
  // Use exercise_performance view to derive maxes
  const { data, error } = await (supabase
    .from('exercise_performance')
    .select('exercise_name,max_weight,total_volume,workout_date,user_id')
    .order('workout_date', { ascending: false }));
  if (error) throw error;
  const rows = (data || []) as Array<{ exercise_name: string | null; max_weight: number | null; total_volume: number | null; workout_date: string | null; user_id: string | null }>;
  const filtered = userId ? rows.filter((r) => r.user_id === userId) : rows;
  const byName = new Map<string, PersonalRecord>();
  for (const r of filtered) {
    const name = r.exercise_name || 'Unknown';
    const existing = byName.get(name);
    const maxWeight = Math.round((r.max_weight || 0) * 10) / 10;
    const maxVolume = Math.round((r.total_volume || 0));
    const lastDate = r.workout_date || new Date().toISOString();
    if (!existing) {
      byName.set(name, { exerciseName: name, maxWeight, maxVolume, maxReps: 0, lastAchieved: lastDate });
    } else {
      if (maxWeight > existing.maxWeight) existing.maxWeight = maxWeight;
      if (maxVolume > existing.maxVolume) existing.maxVolume = maxVolume;
      if (new Date(lastDate) > new Date(existing.lastAchieved)) existing.lastAchieved = lastDate;
    }
  }
  return Array.from(byName.values());
}

export async function getRecentPersonalRecords(days: number, userId?: string): Promise<Array<{ exerciseName: string; weight: number; reps: number; date: string }>> {
  const all = await getPersonalRecords(userId);
  const cutoff = Date.now() - days * 86400000;
  return all
    .filter((r) => new Date(r.lastAchieved).getTime() >= cutoff)
    .map((r) => ({ exerciseName: r.exerciseName, weight: r.maxWeight, reps: 1, date: r.lastAchieved }));
}

export async function getWorkoutsLastNDays(days: number, userId?: string): Promise<Array<{ date: string }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const q = (supabase
    .from('workouts')
    .select('workout_date,user_id')
    .gte('workout_date', since)
    .order('workout_date', { ascending: false }));
  const { data, error } = await (userId ? q.eq('user_id', userId) : q);
  if (error) throw error;
  const rows = (data || []) as Array<{ workout_date: string }>; 
  return rows.map((r) => ({ date: r.workout_date }));
}


