// Historical data migration - CommonJS runner to avoid ts-node issues
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
require('dotenv').config();

/** @typedef {{ weight:number, reps:number, rpe?:number, tempo?:string, rest_time_actual?:number }} LegacySet */
/** @typedef {{ name:string, muscle_group:string, category:string, sets:LegacySet[] }} LegacyExercise */
/** @typedef {{ workout_date:string, start_time?:string, end_time?:string, notes?:string, exercises:LegacyExercise[] }} LegacyWorkout */
/** @typedef {{ workouts:LegacyWorkout[] }} LegacyRoot */

function readJson(file) {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

(async () => {
  const file = path.join(__dirname, '..', '..', 'scripts', 'import_jun-sep1_2025.json');
  if (!fs.existsSync(file)) {
    console.error('Missing historical file:', file);
    process.exit(1);
  }
  /** @type {LegacyRoot} */
  const data = readJson(file);
  console.log('Workouts read:', data.workouts.length);

  const rows = [];
  let setCount = 0;
  /** @type {Map<string,{muscle_group:string, category:string}>} */
  const metaByName = new Map();
  for (const w of data.workouts) {
    const date = w.workout_date;
    for (const ex of w.exercises || []) {
      const sets = ex.sets || [];
      if (!metaByName.has(ex.name)) metaByName.set(ex.name, { muscle_group: ex.muscle_group, category: ex.category });
      sets.forEach((s, idx) => {
        rows.push({
          workout_date: date,
          exercise_name: ex.name,
          muscle_group: ex.muscle_group,
          category: ex.category,
          set_number: idx + 1,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe,
          tempo: s.tempo,
          rest_time_actual: s.rest_time_actual
        });
        setCount += 1;
      });
    }
  }

  const outDir = path.join(__dirname, 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const csv = Papa.unparse(rows, { quotes: true });
  fs.writeFileSync(path.join(outDir, 'historical.csv'), csv, 'utf8');
  const report = {
    workouts: data.workouts.length,
    exercises: Array.from(new Set(rows.map(r => r.exercise_name))).length,
    sets: setCount
  };
  fs.writeFileSync(path.join(outDir, 'migration-report.json'), JSON.stringify(report, null, 2));
  console.log('Wrote CSV and report to', outDir, report);

  const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  const directUrl = process.env.DATABASE_URL;
  if (!url || !serviceKey) {
    console.log('Skipping Supabase upserts (missing env)');
    process.exit(0);
  }
  let useDirect = false;
  if (directUrl) useDirect = true;

  let supabase;
  if (!useDirect) {
    const { createClient } = await import('@supabase/supabase-js');
    supabase = createClient(url, serviceKey);
  }

  console.log('Upserting canonical exercises...');
  const uniqueExercises = Array.from(new Set(rows.map(r => r.exercise_name)));
  const upsertPayload = uniqueExercises.map(name => {
    const meta = metaByName.get(name);
    const mg = (meta && meta.muscle_group) || 'Unknown';
    const catRaw = (meta && meta.category) || 'Isolation';
    const cat = catRaw.toLowerCase() === 'compound' ? 'Compound' : 'Isolation';
    const tier = cat === 'Compound' ? 1 : 2;
    const mvc = cat === 'Compound' ? 90 : 70;
    return { name, muscle_group: mg, category: cat, tier, mvc_percentage: mvc };
  });
  let nameToId = new Map();
  if (!useDirect) {
    const upsertRes = await supabase.from('exercises').upsert(upsertPayload, { onConflict: 'name' });
    if (upsertRes.error) console.warn('Exercise upsert error:', upsertRes.error.message);
    const exFetch = await supabase.from('exercises').select('id,name');
    if (exFetch.error) {
      console.error('Failed to fetch exercises after upsert:', exFetch.error.message);
      process.exit(1);
    }
    (exFetch.data || []).forEach(r => nameToId.set(r.name, r.id));
  } else {
    const { Client } = require('pg');
    const client = new Client({ connectionString: directUrl });
    await client.connect();
    for (const row of upsertPayload) {
      await client.query(
        `INSERT INTO exercises (name,muscle_group,category,tier,mvc_percentage)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (name) DO UPDATE SET muscle_group=EXCLUDED.muscle_group, category=EXCLUDED.category, tier=EXCLUDED.tier, mvc_percentage=EXCLUDED.mvc_percentage`,
        [row.name, row.muscle_group, row.category, row.tier, row.mvc_percentage]
      );
    }
    const res = await client.query('SELECT id,name FROM exercises');
    res.rows.forEach(r => nameToId.set(r.name, r.id));
    // Workouts tree via SQL
    const userId = process.env.MIGRATION_USER_ID || null;
    let wCount = 0, weCount = 0, sCount2 = 0;
    for (const w of data.workouts) {
      const start = w.start_time || `${w.workout_date}T06:00:00.000Z`;
      const end = w.end_time || `${w.workout_date}T07:30:00.000Z`;
      const totals = (w.exercises || []).reduce((acc, ex) => {
        for (const s of (ex.sets || [])) { acc.totalSets += 1; acc.totalVolume += (s.weight || 0) * (s.reps || 0); }
        return acc;
      }, { totalSets: 0, totalVolume: 0 });
      const wIns = await client.query(
        `INSERT INTO workouts (user_id, workout_date, start_time, end_time, notes, total_sets, total_volume)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [userId, w.workout_date, start, end, w.notes || null, totals.totalSets, Math.round(totals.totalVolume)]
      );
      const workoutId = wIns.rows[0].id; wCount++;
      let order = 1;
      for (const ex of w.exercises || []) {
        const exerciseId = nameToId.get(ex.name); if (!exerciseId) continue;
        const weIns = await client.query(
          `INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order)
           VALUES ($1,$2,$3) RETURNING id`, [workoutId, exerciseId, order++]
        );
        const weId = weIns.rows[0].id; weCount++;
        let setNum = 1;
        for (const s of (ex.sets || [])) {
          const rta = (s.rest_time_actual == null ? null : Math.round(Number(s.rest_time_actual)));
          await client.query(
            `INSERT INTO sets (workout_exercise_id,set_number,weight,reps,rpe,tempo,rest_time_actual,notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [weId, setNum++, s.weight, s.reps, s.rpe ?? null, s.tempo ?? null, rta, null]
          );
          sCount2++;
        }
      }
    }
    await client.end();
    console.log(`Inserted -> workouts: ${wCount}, workout_exercises: ${weCount}, sets: ${sCount2}`);
    process.exit(0);
  }

  console.log('Inserting workouts tree...');
  let wCount = 0, weCount = 0, sCount2 = 0;
  const userId = process.env.MIGRATION_USER_ID || null;
  for (const w of data.workouts) {
    const start = w.start_time || `${w.workout_date}T06:00:00.000Z`;
    const end = w.end_time || `${w.workout_date}T07:30:00.000Z`;
    const totals = (w.exercises || []).reduce((acc, ex) => {
      for (const s of (ex.sets || [])) {
        acc.totalSets += 1;
        acc.totalVolume += (s.weight || 0) * (s.reps || 0);
      }
      return acc;
    }, { totalSets: 0, totalVolume: 0 });

    const wIns = await supabase
      .from('workouts')
      .insert({ workout_date: w.workout_date, start_time: start, end_time: end, notes: w.notes || null, user_id: userId, total_sets: totals.totalSets, total_volume: Math.round(totals.totalVolume) })
      .select('id')
      .single();
    if (wIns.error) { console.warn('Workout insert error:', wIns.error.message); continue; }
    wCount++;
    const workoutId = wIns.data.id;

    let order = 1;
    for (const ex of w.exercises || []) {
      const exerciseId = nameToId.get(ex.name);
      if (!exerciseId) continue;
      const weIns = await supabase
        .from('workout_exercises')
        .insert({ workout_id: workoutId, exercise_id: exerciseId, exercise_order: order++ })
        .select('id')
        .single();
      if (weIns.error) { console.warn('Workout exercise insert error:', weIns.error.message); continue; }
      weCount++;
      const weId = weIns.data.id;

      let setNum = 1;
      const setRows = (ex.sets || []).map(s => ({
        workout_exercise_id: weId,
        set_number: setNum++,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe ?? null,
        tempo: s.tempo ?? null,
        rest_time_actual: (s.rest_time_actual == null ? null : Math.round(Number(s.rest_time_actual))),
        notes: null
      }));
      if (setRows.length > 0) {
        const sIns = await supabase.from('sets').insert(setRows);
        if (sIns.error) console.warn('Set insert error:', sIns.error.message); else sCount2 += setRows.length;
      }
    }
  }
  console.log(`Inserted -> workouts: ${wCount}, workout_exercises: ${weCount}, sets: ${sCount2}`);
  process.exit(0);
})();


