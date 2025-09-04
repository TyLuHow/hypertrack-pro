import { getSupabase, getCurrentUserId } from './client';

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

export async function getProgressSummary(userId?: string): Promise<ProgressSummary> {
  const supabase = getSupabase() as any;
  const uid = userId || (await getCurrentUserId());
  const { data, error } = await (supabase
    .from('workouts')
    .select('id,start_time,end_time,total_volume,total_sets')
    .eq('user_id', uid)
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
  const uid = userId || (await getCurrentUserId());
  // Pull last 500 set rows with exercise name and workout date for user
  const { data, error } = await (supabase
    .from('sets')
    .select('weight,reps,workout_exercises!inner(exercises(name)),workout_exercises!inner(workouts!inner(user_id,workout_date))')
    .order('workout_exercises(workouts!inner.workout_date)', { ascending: false })
    .limit(500));
  if (error) throw error;
  const rows = (data || []) as any[];
  const filtered = rows.filter(r => (!uid || r.workout_exercises?.workouts?.user_id === uid));
  const byName = new Map<string, PersonalRecord>();
  for (const r of filtered) {
    const name = r.workout_exercises?.exercises?.name || 'Unknown';
    const weight = Number(r.weight) || 0;
    const reps = Number(r.reps) || 0;
    const vol = weight * reps;
    const date = r.workout_exercises?.workouts?.workout_date || new Date().toISOString();
    const rec = byName.get(name) || { exerciseName: name, maxWeight: 0, maxVolume: 0, maxReps: 0, lastAchieved: date };
    if (weight > rec.maxWeight) rec.maxWeight = weight;
    if (vol > rec.maxVolume) rec.maxVolume = vol;
    if (reps > rec.maxReps) rec.maxReps = reps;
    if (new Date(date) > new Date(rec.lastAchieved)) rec.lastAchieved = date;
    byName.set(name, rec);
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


