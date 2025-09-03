import React from 'react';
import { workoutQueries } from '../../../lib/supabase/queries';

export const HistoryView: React.FC = () => {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await workoutQueries.getAll();
        setRows(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 pb-20 text-textPrimary">
      <div className="text-xl font-semibold mb-3">History</div>
      {loading ? (
        <div className="card p-4">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="card p-4">No workouts yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((w) => (
            <div key={w.id} className="card p-4">
              <div className="font-semibold">{w.workout_date}</div>
              <div className="text-textSecondary text-sm">Sets: {w.total_sets ?? '—'} · Volume: {w.total_volume ?? '—'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


