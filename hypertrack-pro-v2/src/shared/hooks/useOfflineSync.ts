import { useEffect, useState } from 'react';
import { OfflineDatabase } from '../../lib/offline/database';
import { getSupabase, getCurrentUserId } from '../../lib/supabase/client';

export function useOfflineSync() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [db] = useState(() => new OfflineDatabase());

  useEffect(() => {
    db.initialize();
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [db]);

  const runSync = async () => {
    setSyncing(true);
    try {
      const supabase = getSupabase() as any;
      const uid = await getCurrentUserId();
      await db.drainQueue(async (item) => {
        // Minimal handler: only createWorkout is currently queued
        if (item.type === 'createWorkout') {
          const workout = (item.payload as any);
          const { exercises, ...workoutFields } = workout;
          const { data: wrow, error: wErr } = await (supabase
            .from('workouts')
            .insert({
              user_id: uid,
              name: workoutFields.name ?? null,
              workout_date: workoutFields.date,
              start_time: workoutFields.startTime,
              end_time: workoutFields.endTime ?? new Date().toISOString(),
              metadata: null,
              tags: null
            })
            .select('id')
            .single());
          if (wErr) throw wErr;
          const workoutId = wrow.id as number;
          for (let i = 0; i < (exercises?.length || 0); i++) {
            const ex = exercises[i];
            const order = i;
            const exId = Number(ex.id);
            const { data: weRow, error: weErr } = await (supabase
              .from('workout_exercises')
              .insert({ workout_id: workoutId, exercise_id: isFinite(exId) ? exId : null, exercise_order: order + 1 })
              .select('id')
              .single());
            if (weErr) throw weErr;
            const weId = weRow.id as number;
            const setRows = (ex.sets || []).map((s: any, idx: number) => ({ workout_exercise_id: weId, set_number: idx + 1, weight: s.weight, reps: s.reps }));
            if (setRows.length > 0) {
              const { error: sErr } = await (supabase.from('sets').insert(setRows));
              if (sErr) throw sErr;
            }
          }
        }
      });
    } finally {
      setSyncing(false);
    }
  };

  return { online, syncing, runSync, db };
}



