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
  },
  async completeWorkoutMetrics(workoutId: number) {
    const supabase = getSupabase() as any;
    // Aggregate totals from sets for this workout
    const { data, error } = await (supabase
      .from('sets')
      .select('weight,reps, workout_exercises!inner(workout_id)')
      .eq('workout_exercises.workout_id', workoutId));
    if (error) throw error;
    const rows = (data || []) as any[];
    const totals = rows.reduce((acc, r) => {
      acc.total_sets += 1;
      acc.total_volume += (Number(r.weight) || 0) * (Number(r.reps) || 0);
      return acc;
    }, { total_sets: 0, total_volume: 0 });
    await (supabase
      .from('workouts')
      .update({ total_sets: totals.total_sets, total_volume: Math.round(totals.total_volume) })
      .eq('id', workoutId));
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
  let q = (supabase
    .from('workouts')
    .select('id,start_time,end_time,total_volume,total_sets')
    .order('workout_date', { ascending: false }));
  if (uid) q = q.eq('user_id', uid);
  const { data, error } = await q;
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
    .select('weight,reps,workout_exercises!inner(exercises(name),workouts!inner(user_id,workout_date))')
    .limit(1000));
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
  // Sort by lastAchieved desc for deterministic order
  return Array.from(byName.values()).sort((a,b) => (a.lastAchieved < b.lastAchieved ? 1 : -1));
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
  let q = (supabase
    .from('workouts')
    .select('workout_date,user_id')
    .gte('workout_date', since)
    .order('workout_date', { ascending: false }));
  const uid = userId || (await getCurrentUserId());
  if (uid) q = q.eq('user_id', uid);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data || []) as Array<{ workout_date: string }>; 
  return rows.map((r) => ({ date: r.workout_date }));
}

export type WeeklyVolumePoint = { week: string; volume: number };
export async function getWeeklyVolumeSeries(weeks: number = 12, userId?: string): Promise<WeeklyVolumePoint[]> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10);
  let q = (supabase
    .from('workouts')
    .select('workout_date,total_volume,user_id')
    .gte('workout_date', since)
    .order('workout_date', { ascending: false }));
  const uid = userId || (await getCurrentUserId());
  if (uid) q = q.eq('user_id', uid);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data || []) as Array<{ workout_date: string; total_volume: number | null; user_id: string | null }>;
  const filtered = uid ? rows.filter(r => r.user_id === uid) : rows;
  const byWeek = new Map<string, number>();
  for (const r of filtered) {
    const d = new Date(r.workout_date);
    const week = getISOWeekKey(d);
    const v = (r.total_volume || 0);
    byWeek.set(week, (byWeek.get(week) || 0) + v);
  }
  // Fill missing weeks with zero so charts look continuous
  const series: WeeklyVolumePoint[] = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const key = getISOWeekKey(d);
    series.push({ week: key, volume: Math.round(byWeek.get(key) || 0) });
  }
  return series;
}

function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d as any) - (yearStart as any)) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2,'0')}`;
}

export async function getLastExerciseSetsByName(exerciseName: string, userId?: string): Promise<Array<{ weight: number; reps: number }>> {
  const supabase = getSupabase() as any;
  const uid = userId || (await getCurrentUserId());
  const { data, error } = await (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises(name),workouts!inner(user_id,workout_date))')
    .limit(200));
  if (error) throw error;
  const rows = (data || []) as any[];
  const filtered = rows.filter(r => r.workout_exercises?.exercises?.name === exerciseName && (!uid || r.workout_exercises?.workouts?.user_id === uid));
  // Group by workout_date and take the most recent workout
  const byDate = new Map<string, Array<{ weight: number; reps: number }>>();
  for (const r of filtered) {
    const d = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const list = byDate.get(d) || [];
    list.push({ weight: Number(r.weight) || 0, reps: Number(r.reps) || 0 });
    byDate.set(d, list);
  }
  const dates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));
  const recent = dates[0];
  return recent ? byDate.get(recent)! : [];
}

// -------- Persist a full workout session in one flow --------
export async function persistWorkoutSession(session: {
  name?: string;
  date: string;
  startTime: string;
  endTime?: string;
  exercises: Array<{ id: string; name: string; sets: Array<{ id: string; weight: number; reps: number }> }>;
}): Promise<number> {
  const supabase = getSupabase() as any;
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('Not authenticated');

  // 1) Create workout row
  const { data: workoutRow, error: wErr } = await (supabase
    .from('workouts')
    .insert({
      user_id: uid,
      name: session.name || null,
      workout_date: session.date,
      start_time: session.startTime,
      end_time: session.endTime || new Date().toISOString()
    })
    .select('id')
    .single());
  if (wErr) throw wErr;
  const workoutId = workoutRow.id as number;

  // 2) For each exercise, create workout_exercises and sets
  for (let i = 0; i < session.exercises.length; i++) {
    const ex = session.exercises[i];
    const order = i;
    const exId = Number(ex.id);
    const { data: weRow, error: weErr } = await (supabase
      .from('workout_exercises')
      .insert({ workout_id: workoutId, exercise_id: isFinite(exId) ? exId : null, exercise_order: order + 1 })
      .select('id')
      .single());
    if (weErr) throw weErr;
    const weId = weRow.id as number;
    const setRows = ex.sets.map((s, idx) => ({ workout_exercise_id: weId, set_number: idx + 1, weight: s.weight, reps: s.reps }));
    if (setRows.length > 0) {
      const { error: sErr } = await (supabase.from('sets').insert(setRows));
      if (sErr) throw sErr;
    }
  }

  // 3) Aggregate totals
  await workoutQueries.completeWorkoutMetrics(workoutId);
  return workoutId;
}


