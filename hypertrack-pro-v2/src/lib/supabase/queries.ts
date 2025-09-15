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
  async getDetails(workoutId: number) {
    const supabase = getSupabase() as any;
    const { data, error } = await (supabase
      .from('workout_exercises')
      .select('id, exercises(name,muscle_group,category), sets(weight,reps,rpe)')
      .eq('workout_id', workoutId)
      .order('exercise_order', { ascending: true }));
    if (error) throw error;
    const exercises = (data || []).map((we: any) => ({
      name: we.exercises?.name || 'Exercise',
      muscle_group: we.exercises?.muscle_group || 'Unknown',
      category: we.exercises?.category || 'Isolation',
      sets: (we.sets || []).map((s: any) => ({ weight: Number(s.weight)||0, reps: Number(s.reps)||0, rpe: s.rpe || undefined }))
    }));
    return exercises;
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
  maxWeight: number; // best single-set weight PR (legacy)
  maxVolume: number; // max total volume in a single workout for this exercise
  maxReps: number;   // best single-set reps PR (legacy)
  maxAvgLoad: number; // max average set load (volume/sets) in a single workout
  lastAchieved: string; // latest date any PR metric achieved
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
  // First aggregate by exercise + workout date to compute per-workout totals
  const byExerciseDate = new Map<string, { volume: number; sets: number; maxSetWeight: number; maxSetReps: number }>();
  const lastByExercise = new Map<string, string>();
  for (const r of filtered) {
    const name = r.workout_exercises?.exercises?.name || 'Unknown';
    const date = r.workout_exercises?.workouts?.workout_date || new Date().toISOString();
    const key = `${name}__${date}`;
    const weight = Number(r.weight) || 0;
    const reps = Number(r.reps) || 0;
    const vol = weight * reps;
    const cur = byExerciseDate.get(key) || { volume: 0, sets: 0, maxSetWeight: 0, maxSetReps: 0 };
    cur.volume += vol;
    cur.sets += 1;
    cur.maxSetWeight = Math.max(cur.maxSetWeight, weight);
    cur.maxSetReps = Math.max(cur.maxSetReps, reps);
    byExerciseDate.set(key, cur);
    const prevDate = lastByExercise.get(name);
    if (!prevDate || new Date(date) > new Date(prevDate)) lastByExercise.set(name, date);
  }
  // Reduce to per-exercise records
  const byName = new Map<string, PersonalRecord>();
  Array.from(byExerciseDate.entries()).forEach(([key, v]) => {
    const [name, date] = key.split('__');
    const avgLoad = v.sets > 0 ? Math.round(v.volume / v.sets) : 0;
    const existing = byName.get(name) || { exerciseName: name, maxWeight: 0, maxVolume: 0, maxReps: 0, maxAvgLoad: 0, lastAchieved: date };
    existing.maxWeight = Math.max(existing.maxWeight, v.maxSetWeight);
    existing.maxReps = Math.max(existing.maxReps, v.maxSetReps);
    if (v.volume > existing.maxVolume) existing.maxVolume = v.volume;
    if (avgLoad > existing.maxAvgLoad) existing.maxAvgLoad = avgLoad;
    existing.lastAchieved = lastByExercise.get(name) || existing.lastAchieved;
    byName.set(name, existing);
  });
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

export async function getMuscleGroupVolumeDistribution(days: number = 28, userId?: string): Promise<Array<{ muscle: string; volume: number }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const uid = userId || (await getCurrentUserId());
  let q = (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises!inner(muscle_group), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data || []) as any[];
  const filtered = rows.filter(r => (!uid || r.workout_exercises?.workouts?.user_id === uid));
  const map = new Map<string, number>();
  for (const r of filtered) {
    const mg = r.workout_exercises?.exercises?.muscle_group || 'Unknown';
    const vol = (Number(r.weight) || 0) * (Number(r.reps) || 0);
    map.set(mg, (map.get(mg) || 0) + vol);
  }
  return Array.from(map.entries()).map(([muscle, volume]) => ({ muscle, volume: Math.round(volume) }))
    .sort((a,b) => b.volume - a.volume);
}

export async function getWeeklyWorkoutFrequency(weeks: number = 12, userId?: string): Promise<Array<{ week: string; count: number }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10);
  let q = (supabase
    .from('workouts')
    .select('workout_date,user_id')
    .gte('workout_date', since));
  const uid = userId || (await getCurrentUserId());
  if (uid) q = q.eq('user_id', uid);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data || []) as Array<{ workout_date: string; user_id: string | null }>;
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = getISOWeekKey(new Date(r.workout_date));
    map.set(key, (map.get(key) || 0) + 1);
  }
  const now = new Date();
  const series: Array<{ week: string; count: number }> = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const key = getISOWeekKey(d);
    series.push({ week: key, count: map.get(key) || 0 });
  }
  return series;
}

export async function getWorkoutMetricsSeries(days: number = 180, userId?: string): Promise<Array<{ date: string; exercise: string; muscle: string; weight: number; reps: number; sets: number; volume: number }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises(name,muscle_group), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  if (error) throw error;
  const rows = (data || []) as any[];
  // aggregate per exercise per date
  const map = new Map<string, { muscle: string; weightMax: number; repsMax: number; sets: number; volume: number }>();
  for (const r of rows) {
    const exercise = r.workout_exercises?.exercises?.name || 'Unknown';
    const date = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const muscle = r.workout_exercises?.exercises?.muscle_group || 'Unknown';
    const key = `${date}__${exercise}`;
    const weight = Number(r.weight) || 0;
    const reps = Number(r.reps) || 0;
    const cur = map.get(key) || { muscle, weightMax: 0, repsMax: 0, sets: 0, volume: 0 };
    cur.weightMax = Math.max(cur.weightMax, weight);
    cur.repsMax = Math.max(cur.repsMax, reps);
    cur.sets += 1;
    cur.volume += weight * reps;
    map.set(key, cur);
  }
  const out: Array<{ date: string; exercise: string; muscle: string; weight: number; reps: number; sets: number; volume: number }> = [];
  Array.from(map.entries()).forEach(([key, v]) => {
    const [date, exercise] = key.split('__');
    out.push({ date, exercise, muscle: v.muscle, weight: v.weightMax, reps: v.repsMax, sets: v.sets, volume: Math.round(v.volume) });
  });
  return out.sort((a,b) => (a.date < b.date ? -1 : 1));
}

export async function getPerMuscleWeeklyTrends(weeks: number = 12, userId?: string): Promise<Array<{ week: string; muscle: string; volume: number }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10);
  let q = (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises!inner(muscle_group), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  const uid = userId || (await getCurrentUserId());
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data || []) as any[];
  const filtered = rows.filter(r => (!uid || r.workout_exercises?.workouts?.user_id === uid));
  const map = new Map<string, number>();
  const muscles = new Set<string>();
  for (const r of filtered) {
    const date = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const week = getISOWeekKey(new Date(date));
    const muscle = r.workout_exercises?.exercises?.muscle_group || 'Unknown';
    muscles.add(muscle);
    const key = `${week}__${muscle}`;
    const vol = (Number(r.weight) || 0) * (Number(r.reps) || 0);
    map.set(key, (map.get(key) || 0) + vol);
  }
  const now = new Date();
  const result: Array<{ week: string; muscle: string; volume: number }> = [];
  const musc = Array.from(muscles);
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const week = getISOWeekKey(d);
    for (const m of musc) {
      const key = `${week}__${m}`;
      result.push({ week, muscle: m, volume: Math.round(map.get(key) || 0) });
    }
  }
  return result;
}

// Weekly set counts per muscle to compare against research targets
export async function getPerMuscleWeeklySets(weeks: number = 12, userId?: string): Promise<Array<{ week: string; muscle: string; sets: number }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabase
    .from('sets')
    .select('workout_exercises!inner(exercises!inner(muscle_group), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  if (error) throw error;
  const rows = (data || []) as any[];
  const uid = userId || (await getCurrentUserId());
  const filtered = rows.filter(r => (!uid || r.workout_exercises?.workouts?.user_id === uid));
  const map = new Map<string, number>();
  const muscles = new Set<string>();
  for (const r of filtered) {
    const date = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const week = getISOWeekKey(new Date(date));
    const muscle = r.workout_exercises?.exercises?.muscle_group || 'Unknown';
    muscles.add(muscle);
    const key = `${week}__${muscle}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const now = new Date();
  const result: Array<{ week: string; muscle: string; sets: number }> = [];
  const musc = Array.from(muscles);
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 86400000);
    const week = getISOWeekKey(d);
    for (const m of musc) {
      const key = `${week}__${m}`;
      result.push({ week, muscle: m, sets: Math.round(map.get(key) || 0) });
    }
  }
  return result;
}

export async function getPRTimelines(days: number = 180, userId?: string): Promise<Array<{ date: string; exercise: string; muscle: string; type: 'weight' | 'reps' | 'volume' | 'onerm' | 'avgLoad'; value: number }>> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises(name,muscle_group), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  if (error) throw error;
  const rows = (data || []) as any[];
  // Track best metrics per exercise per date, then reduce to most recent changes
  const byDateExercise = new Map<string, { muscle: string; weight: number; reps: number; volume: number; onerm: number; sets: number }>();
  for (const r of rows) {
    const exercise = r.workout_exercises?.exercises?.name || 'Unknown';
    const muscle = r.workout_exercises?.exercises?.muscle_group || 'Unknown';
    const date = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const key = `${date}__${exercise}`;
    const weight = Number(r.weight) || 0;
    const reps = Number(r.reps) || 0;
    const volume = weight * reps;
    const onerm = weight > 0 && reps > 0 ? Math.round(weight * (1 + reps / 30)) : 0; // Epley
    const cur = byDateExercise.get(key) || { muscle, weight: 0, reps: 0, volume: 0, onerm: 0, sets: 0 };
    if (weight > cur.weight) cur.weight = weight;
    if (reps > cur.reps) cur.reps = reps;
    cur.volume += volume;
    if (onerm > cur.onerm) cur.onerm = onerm;
    cur.sets += 1;
    cur.muscle = muscle;
    byDateExercise.set(key, cur);
  }
  const out: Array<{ date: string; exercise: string; muscle: string; type: 'weight' | 'reps' | 'volume' | 'onerm' | 'avgLoad'; value: number }> = [];
  Array.from(byDateExercise.entries()).forEach(([key, pr]) => {
    const [date, exercise] = key.split('__');
    const avgLoad = pr.sets > 0 ? Math.round(pr.volume / pr.sets) : 0;
    out.push({ date, exercise, muscle: pr.muscle, type: 'weight', value: pr.weight });
    out.push({ date, exercise, muscle: pr.muscle, type: 'reps', value: pr.reps });
    out.push({ date, exercise, muscle: pr.muscle, type: 'volume', value: pr.volume });
    out.push({ date, exercise, muscle: pr.muscle, type: 'onerm', value: pr.onerm });
    out.push({ date, exercise, muscle: pr.muscle, type: 'avgLoad', value: avgLoad });
  });
  return out.sort((a,b) => (a.date < b.date ? -1 : 1));
}

// -------- Exercise performance series for plateau detection --------
export type ExerciseSessionSeries = Array<{ exercise: string; date: string; sets: Array<{ weight: number; reps: number }> }>;
export async function getExercisePerformanceSeries(days: number = 90, userId?: string): Promise<ExerciseSessionSeries> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises(name), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  if (error) throw error;
  const rows = (data || []) as any[];
  const uid = userId || (await getCurrentUserId());
  const filtered = rows.filter(r => (!uid || r.workout_exercises?.workouts?.user_id === uid));
  const byExerciseDate = new Map<string, Array<{ weight: number; reps: number }>>();
  for (const r of filtered) {
    const ex = r.workout_exercises?.exercises?.name || 'Unknown';
    const date = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const key = `${ex}__${date}`;
    const list = byExerciseDate.get(key) || [];
    list.push({ weight: Number(r.weight) || 0, reps: Number(r.reps) || 0 });
    byExerciseDate.set(key, list);
  }
  const out: ExerciseSessionSeries = [];
  Array.from(byExerciseDate.entries()).forEach(([key, sets]) => {
    const [exercise, date] = key.split('__');
    out.push({ exercise, date, sets });
  });
  // sort by date asc for stable UI usage
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

// -------- Daily progress series (aggregate) for recent progress chart --------
export type DailyProgressPoint = { date: string; totalVolume: number; estimatedRM: number };
export async function getDailyProgressSeries(days: number = 28, userId?: string): Promise<DailyProgressPoint[]> {
  const supabase = getSupabase() as any;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabase
    .from('sets')
    .select('weight,reps, workout_exercises!inner(exercises(name), workouts!inner(user_id,workout_date))')
    .gte('workout_exercises.workouts.workout_date', since));
  if (error) throw error;
  const rows = (data || []) as any[];
  const uid = userId || (await getCurrentUserId());
  const filtered = rows.filter(r => (!uid || r.workout_exercises?.workouts?.user_id === uid));
  const byDate = new Map<string, { volume: number; maxOnerm: number }>();
  for (const r of filtered) {
    const date = r.workout_exercises?.workouts?.workout_date || '1970-01-01';
    const weight = Number(r.weight) || 0;
    const reps = Number(r.reps) || 0;
    const onerm = weight > 0 && reps > 0 ? Math.round(weight * (1 + reps / 30)) : 0;
    const cur = byDate.get(date) || { volume: 0, maxOnerm: 0 };
    cur.volume += weight * reps;
    if (onerm > cur.maxOnerm) cur.maxOnerm = onerm;
    byDate.set(date, cur);
  }
  const out: DailyProgressPoint[] = Array.from(byDate.entries())
    .map(([date, v]) => ({ date, totalVolume: Math.round(v.volume), estimatedRM: v.maxOnerm }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  return out;
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


