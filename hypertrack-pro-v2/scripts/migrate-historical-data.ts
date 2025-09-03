/* Node script skeleton for historical data migration */
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

interface LegacySet { weight: number; reps: number; rpe?: number; tempo?: string; rest_time_actual?: number }
interface LegacyExercise { name: string; muscle_group: string; category: string; sets: LegacySet[] }
interface LegacyWorkout { workout_date: string; start_time?: string; end_time?: string; notes?: string; exercises: LegacyExercise[] }

interface LegacyRoot { workouts: LegacyWorkout[] }

function readJson(file: string): LegacyRoot {
  const raw = fs.readFileSync(file, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const file = path.join(__dirname, '..', '..', 'scripts', 'import_jun-sep1_2025.json');
  if (!fs.existsSync(file)) {
    console.error('Missing historical file:', file);
    process.exit(1);
  }
  const data = readJson(file);
  console.log('Workouts read:', data.workouts.length);

  // Flatten to CSV rows compatible with new schema (workouts/workout_exercises/sets)
  type CsvRow = {
    workout_date: string;
    exercise_name: string;
    muscle_group: string;
    category: string;
    set_number: number;
    weight: number;
    reps: number;
    rpe?: number;
    tempo?: string;
    rest_time_actual?: number;
  };

  const rows: CsvRow[] = [];
  let setCount = 0;
  const metaByName = new Map<string, { muscle_group: string; category: string }>();
  for (const w of data.workouts) {
    const date = w.workout_date;
    for (const ex of w.exercises || []) {
      const sets = ex.sets || [];
      if (!metaByName.has(ex.name)) {
        metaByName.set(ex.name, { muscle_group: ex.muscle_group, category: ex.category });
      }
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
    exercises: rows.reduce((acc, r) => acc.add(r.exercise_name), new Set<string>()).size,
    sets: setCount
  };
  fs.writeFileSync(path.join(outDir, 'migration-report.json'), JSON.stringify(report, null, 2));
  console.log('Wrote CSV and report to', outDir, report);

  // Optional: upsert to Supabase if env present
  const url = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    console.log('Upserting canonical exercises...');
    const uniqueExercises = Array.from(new Set(rows.map(r => r.exercise_name)));
    const upsertRes = await supabase.from('exercises' as any).upsert(
      uniqueExercises.map(name => {
        const meta = metaByName.get(name);
        const mg = meta?.muscle_group || 'Unknown';
        const catRaw = meta?.category || 'Isolation';
        const cat = catRaw.toLowerCase() === 'compound' ? 'Compound' : 'Isolation';
        const tier = cat === 'Compound' ? 1 : 2;
        const mvc = cat === 'Compound' ? 90 : 70;
        return { name, muscle_group: mg, category: cat, tier, mvc_percentage: mvc } as any;
      }),
      { onConflict: 'name' }
    );
    if (upsertRes.error) console.warn('Exercise upsert error:', upsertRes.error.message);

    const { data: exRows, error: exErr } = await (supabase.from('exercises' as any).select('id,name') as any);
    if (exErr) {
      console.error('Failed to fetch exercises after upsert:', exErr.message);
      return;
    }
    const nameToId = new Map<string, number>();
    (exRows || []).forEach((r: any) => nameToId.set(r.name, r.id));

    console.log('Inserting workouts tree...');
    let wCount = 0, weCount = 0, sCount = 0;
    const userId = process.env.MIGRATION_USER_ID || null;
    for (const w of data.workouts) {
      const start = w.start_time || `${w.workout_date}T06:00:00.000Z`;
      const end = w.end_time || `${w.workout_date}T07:30:00.000Z`;
      // compute totals
      const totals = (w.exercises || []).reduce((acc, ex) => {
        for (const s of (ex.sets || [])) {
          acc.totalSets += 1;
          acc.totalVolume += (s.weight || 0) * (s.reps || 0);
        }
        return acc;
      }, { totalSets: 0, totalVolume: 0 });

      const { data: wIns, error: wErr } = await (supabase
        .from('workouts' as any)
        .insert({
          workout_date: w.workout_date,
          start_time: start,
          end_time: end,
          notes: w.notes || null,
          user_id: userId,
          total_sets: totals.totalSets,
          total_volume: totals.totalVolume
        } as any)
        .select('id')
        .single() as any);
      if (wErr) { console.warn('Workout insert error:', wErr.message); continue; }
      wCount++;
      const workoutId = wIns.id;

      let order = 1;
      for (const ex of w.exercises || []) {
        const exerciseId = nameToId.get(ex.name);
        if (!exerciseId) continue;
        const { data: weIns, error: weErr } = await (supabase
          .from('workout_exercises' as any)
          .insert({ workout_id: workoutId, exercise_id: exerciseId, exercise_order: order++ } as any)
          .select('id')
          .single() as any);
        if (weErr) { console.warn('Workout exercise insert error:', weErr.message); continue; }
        weCount++;
        const weId = weIns.id;

        let setNum = 1;
        const setRows = (ex.sets || []).map(s => ({
          workout_exercise_id: weId,
          set_number: setNum++,
          weight: s.weight,
          reps: s.reps,
          rpe: s.rpe ?? null,
          tempo: s.tempo ?? null,
          rest_time_actual: s.rest_time_actual ?? null,
          notes: null
        }));
        if (setRows.length > 0) {
          const { error: sErr } = await (supabase.from('sets' as any).insert(setRows as any) as any);
          if (sErr) console.warn('Set insert error:', sErr.message); else sCount += setRows.length;
        }
      }
    }
    console.log(`Inserted -> workouts: ${wCount}, workout_exercises: ${weCount}, sets: ${sCount}`);
  }
}

main();


