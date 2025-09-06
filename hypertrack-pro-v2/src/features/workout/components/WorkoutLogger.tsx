import React, { useEffect, useMemo, useState } from 'react';
import { useWorkoutStore } from '../../../shared/stores/workoutStore';
import { WeightInput } from './WeightInput';
import { useExerciseHistory } from '../../../shared/hooks/useExerciseHistory';
import { SetTable, type SetRow } from './SetTable';
import { persistWorkoutSession } from '../../../lib/supabase/queries';
import { useRecommendations } from '../../../shared/hooks/useRecommendations';

interface WorkoutLoggerProps {
  onExerciseSelect: () => void;
  onStartRestTimer?: (duration: number) => void; // legacy optional for test compatibility
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  onExerciseSelect
}) => {
  const {
    currentWorkout,
    activeExercise,
    addSet,
    startWorkout,
    completeWorkout,
    completeExercise,
    selectExercise,
  } = useWorkoutStore();
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(8);
  const [rows, setRows] = useState<SetRow[]>([]);
  const activeExerciseName = useMemo(() => {
    const ex = currentWorkout?.exercises.find((e) => e.id === activeExercise);
    return ex?.name || undefined;
  }, [currentWorkout, activeExercise]);
  const history = useExerciseHistory(activeExerciseName);

  // Reset inputs and rows when switching exercises; prefill from last exercise history
  useEffect(() => {
    // clear rows when changing active exercise
    setRows([]);
    setWeight(0);
    setReps(8);
    if (history.lastSets && history.lastSets.length > 0) {
      const prefilled = history.lastSets.map((s, idx) => ({ id: `${Date.now()}-${idx}`, weight: s.weight, reps: s.reps }));
      setRows(prefilled);
      if (prefilled[0]) {
        setWeight(prefilled[0].weight);
        setReps(prefilled[0].reps);
      }
    } else if (history.lastWeight != null) {
      setWeight(history.lastWeight);
    }
  }, [activeExercise, history.lastWeight, history.lastSets]);

  const { recommendation } = useRecommendations(activeExercise ?? undefined);

  const canAdd = useMemo(() => !!activeExercise && weight > 0 && reps > 0, [activeExercise, weight, reps]);

  const handleQuickAdjust = (field: 'weight' | 'reps', delta: number) => {
    if (field === 'weight') setWeight((w) => Math.max(0, Math.round((w + delta) / 2.5) * 2.5));
    else setReps((r) => Math.max(1, r + delta));
  };

  const handleAddSet = () => {
    if (!activeExercise || !canAdd) return;
    const id = `${Date.now()}`;
    addSet(activeExercise, { id, weight, reps });
    setRows((r) => [...r, { id, weight, reps }]);
    // Reset inputs for fast logging flow
    setReps(8);
  };
  const handleRowChange = (id: string, next: Partial<SetRow>) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...next } : row)));
    // Optionally also update the store optimistic set here if needed
  };

  return (
    <div className="bg-background text-textPrimary min-h-screen p-4 pb-28">
      {!currentWorkout && (
        <div className="card p-5 mb-4">
          <div className="text-lg font-semibold mb-2">Ready to train?</div>
          <button
            onClick={() => startWorkout()}
            className="w-full btn-primary"
          >
            Start Workout
          </button>
        </div>
      )}
      <button
        onClick={() => { if (currentWorkout) { selectExercise('', true); onExerciseSelect(); } }}
        disabled={!currentWorkout || !!(currentWorkout && activeExercise && currentWorkout.exercises.find(e => e.id === activeExercise && e.sets.length > 0 && !e.completed))}
        className="w-full h-12 bg-surface rounded-lg text-left px-4 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {currentWorkout ? (activeExerciseName || 'Select Exercise') : 'Start Workout to Select Exercise'}
      </button>

      {currentWorkout && activeExercise && (
        <div className="card p-4 mb-4">
          {recommendation && (
            <div className="mb-3 text-sm text-textSecondary">
              Recommended: <span className="font-semibold">{recommendation.recommendedWeight} lbs</span>
            </div>
          )}
          {activeExerciseName && (
            <div className="text-lg font-semibold mb-2 text-textPrimary">{activeExerciseName}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-textMuted mb-1">Weight</div>
              <WeightInput
                  value={weight}
                onChange={(n) => setWeight(n ?? 0)}
                increments={[2.5, 5, 10]}
                autoLabel={history.label || undefined}
              />
            </div>

            <div>
              <div className="text-sm text-textMuted mb-1">Reps</div>
              <div className="flex items-center space-x-3">
                <button
                  className="h-11 w-11 rounded-full bg-gray-700 text-xl active:scale-95"
                  onClick={() => handleQuickAdjust('reps', -1)}
                >
                  -
                </button>
                <input
                  type="number"
                  className="flex-1 h-11 bg-background rounded-lg px-3 text-xl number-xl"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                />
                <button
                  className="h-11 w-11 rounded-full bg-gray-700 text-xl active:scale-95"
                  onClick={() => handleQuickAdjust('reps', 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <SetTable rows={rows} onChange={handleRowChange} onAdd={handleAddSet} />
            <button onClick={() => activeExercise && completeExercise(activeExercise)} className="btn-muted w-full">Complete Exercise</button>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 bg-background/80 backdrop-blur-md p-4 border-t border-gray-800">
        <div className="text-sm text-textMuted mb-2">Current Workout</div>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {currentWorkout ? (
            currentWorkout.exercises.length > 0 ? (
              currentWorkout.exercises.map((ex) => {
                const totalVolume = ex.sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
                return (
                <div key={ex.id} className="card p-3">
                  <div className="font-semibold mb-1">{ex.name}</div>
                  <div className="text-sm text-textSecondary">
                    {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  •  ')}
                  </div>
                  <div className="text-xs text-textMuted mt-1">Sets: {ex.sets.length} • Volume: {Math.round(totalVolume)} lbs</div>
                </div>
              )})
            ) : (
              <div className="text-textMuted">No sets yet</div>
            )
          ) : (
            <div className="text-textMuted">No active workout</div>
          )}
        </div>
        {currentWorkout && (
          <button
            onClick={async () => {
              completeWorkout();
              const session = {
                name: currentWorkout.name,
                date: currentWorkout.date,
                startTime: currentWorkout.startTime,
                endTime: currentWorkout.endTime,
                exercises: currentWorkout.exercises.map((e) => ({ id: e.id, name: e.name, sets: e.sets.map(s => ({ id: s.id, weight: s.weight, reps: s.reps })) }))
              };
              try { await persistWorkoutSession(session as any); } catch { /* surface toast later */ }
            }}
            className="mt-3 w-full btn-primary"
          >
            Finish Workout
          </button>
        )}
      </div>
    </div>
  );
};



