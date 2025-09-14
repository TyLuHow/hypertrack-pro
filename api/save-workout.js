// Serverless endpoint to persist a workout session using Supabase service role
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = req.body || {};
    if (!session.date || !session.startTime || !Array.isArray(session.exercises)) {
      return res.status(400).json({ error: 'Invalid session payload' });
    }

    // Create workout row (user_id optional; null acceptable for single-user usage)
    const { data: wrow, error: wErr } = await supabase
      .from('workouts')
      .insert({
        user_id: session.userId || null,
        name: session.name || null,
        workout_date: session.date,
        start_time: session.startTime,
        end_time: session.endTime || new Date().toISOString(),
        metadata: null,
        tags: null
      })
      .select('id')
      .single();
    if (wErr) return res.status(400).json({ error: wErr.message });
    const workoutId = wrow.id;

    // Insert exercises and sets
    for (let i = 0; i < (session.exercises || []).length; i++) {
      const ex = session.exercises[i];
      const order = i + 1;
      const exIdNum = Number(ex.id);
      const { data: weRow, error: weErr } = await supabase
        .from('workout_exercises')
        .insert({ workout_id: workoutId, exercise_id: Number.isFinite(exIdNum) ? exIdNum : null, exercise_order: order })
        .select('id')
        .single();
      if (weErr) return res.status(400).json({ error: weErr.message });
      const weId = weRow.id;
      const setRows = (ex.sets || []).map((s, idx) => ({ workout_exercise_id: weId, set_number: idx + 1, weight: s.weight, reps: s.reps }));
      if (setRows.length > 0) {
        const { error: sErr } = await supabase.from('sets').insert(setRows);
        if (sErr) return res.status(400).json({ error: sErr.message });
      }
    }

    // Compute totals and update workout
    const { data: setAgg, error: aggErr } = await supabase
      .from('sets')
      .select('weight,reps, workout_exercises!inner(workout_id)')
      .eq('workout_exercises.workout_id', workoutId);
    if (!aggErr) {
      const totals = (setAgg || []).reduce((acc, r) => {
        acc.total_sets += 1;
        acc.total_volume += (Number(r.weight) || 0) * (Number(r.reps) || 0);
        return acc;
      }, { total_sets: 0, total_volume: 0 });
      await supabase
        .from('workouts')
        .update({ total_sets: totals.total_sets, total_volume: Math.round(totals.total_volume) })
        .eq('id', workoutId);
    }

    return res.status(201).json({ workoutId });
  } catch (error) {
    console.error('save-workout error', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}


