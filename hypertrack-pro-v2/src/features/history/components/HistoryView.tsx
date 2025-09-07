import React from 'react';
import { workoutQueries } from '../../../lib/supabase/queries';
import { WorkoutDetailsModal } from './WorkoutDetailsModal';

interface WorkoutRow {
  id: number;
  workout_date: string;
  total_sets?: number | null;
  total_volume?: number | null;
  name?: string | null;
  duration_minutes?: number | null;
}

export const HistoryView: React.FC = () => {
  const [rows, setRows] = React.useState<WorkoutRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedWorkout, setSelectedWorkout] = React.useState<{
    id?: string;
    name?: string;
    date: string;
    duration: number;
    exercises: any[];
  } | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
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

  const handleWorkoutClick = async (workout: WorkoutRow) => {
    const exercises = await workoutQueries.getDetails(workout.id);
    setSelectedWorkout({
      id: String(workout.id),
      name: workout.name || 'Workout Session',
      date: workout.workout_date,
      duration: typeof workout.duration_minutes === 'number' ? workout.duration_minutes * 60 : 0,
      exercises,
    });
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedWorkout(null);
  };

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
            <button key={w.id} className="card p-4 w-full text-left" onClick={() => handleWorkoutClick(w)}>
              <div className="font-semibold">{w.workout_date}</div>
              <div className="text-textSecondary text-sm">Sets: {w.total_sets ?? '—'} · Volume: {w.total_volume ?? '—'}</div>
            </button>
          ))}
        </div>
      )}

      {selectedWorkout && (
        <WorkoutDetailsModal
          workout={selectedWorkout}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
          onEditWorkout={() => setIsDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};


