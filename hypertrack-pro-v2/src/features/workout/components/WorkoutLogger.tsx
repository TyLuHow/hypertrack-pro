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
  const { recommendation } = useRecommendations(activeExercise ?? undefined);
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);

  // Reset inputs and rows when switching exercises; prefill from last exercise history (max 3 sets)
  useEffect(() => {
    // clear rows when changing active exercise
    setRows([]);
    setWeight(0);
    setReps(8);
    if (history.lastSets && history.lastSets.length > 0) {
      const lastThree = history.lastSets.slice(0, 3);
      const prefilled = lastThree.map((s, idx) => ({ id: `${Date.now()}-${idx}`, weight: s.weight, reps: s.reps }));
      setRows(prefilled);
      if (prefilled[0]) {
        setWeight(prefilled[0].weight);
        setReps(prefilled[0].reps);
      }
    } else if (recommendation?.recommendedWeight) {
      const first = { id: `${Date.now()}-0`, weight: recommendation.recommendedWeight, reps: 10 };
      setRows([first]);
      setWeight(first.weight);
      setReps(first.reps);
    } else if (history.lastWeight != null) {
      setWeight(history.lastWeight);
    }
  }, [activeExercise, history.lastWeight, history.lastSets, recommendation?.recommendedWeight]);

  const canAdd = useMemo(() => !!activeExercise && weight > 0 && reps > 0, [activeExercise, weight, reps]);

  // Removed unused quick adjust handler (re-add when UI provides controls)

  const handleAddSet = () => {
    if (!activeExercise || !canAdd) return;
    const id = `${Date.now()}`;
    addSet(activeExercise, { id, weight, reps });
    setRows((r) => [...r, { id, weight, reps }]);
    // Reset inputs for fast logging flow
    setReps(8);
  };
  const handleDeleteSet = (id: string) => {
    setRows((r) => r.filter((row) => row.id !== id));
  };
  const handleRowChange = (id: string, next: Partial<SetRow>) => {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, ...next } : row)));
    // Optionally also update the store optimistic set here if needed
  };

  return (
    <div className="bg-background text-textPrimary min-h-screen p-4 pb-6 md:pb-6">
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
                increments={[]}
                autoLabel={history.label || undefined}
              />
            </div>

            <div>
              <div className="text-sm text-textMuted mb-1">Reps</div>
              <div className="flex items-center">
                <input
                  type="number"
                  className="flex-1 h-11 bg-background rounded-lg px-3 text-xl number-xl"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <SetTable rows={rows} onChange={handleRowChange} onAdd={handleAddSet} onDelete={handleDeleteSet} />
            <button onClick={() => {
              if (activeExercise) {
                // If there are prefilled rows not yet added to the store, sync them in
                const existingIds = new Set((currentWorkout?.exercises.find(e => e.id === activeExercise)?.sets || []).map(s => s.id));
                rows.forEach(r => {
                  if (!existingIds.has(r.id)) {
                    addSet(activeExercise, { id: r.id, weight: r.weight, reps: r.reps });
                  }
                });
                completeExercise(activeExercise);
              }
            }} className="btn-muted w-full">Complete Exercise</button>
          </div>
        </div>
      )}

      {/* Side panel toggle handle */}
      <button
        aria-label="Toggle current workout panel"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-800 text-slate-200 px-2 py-3 rounded-l shadow hover:bg-slate-700"
        onClick={() => setPanelOpen((v) => !v)}
      >
        {panelOpen ? 'Hide' : 'Current Workout'}
      </button>

      <div className={`fixed right-0 top-24 bottom-0 w-full md:w-96 bg-background/90 backdrop-blur-md p-4 border-l border-gray-800 overflow-y-auto transform transition-transform duration-200 ${panelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="text-sm text-textMuted mb-2">Current Workout</div>
        <div className="space-y-2">
          {currentWorkout ? (
            currentWorkout.exercises.length > 0 ? (
              currentWorkout.exercises.map((ex) => {
                const totalVolume = ex.sets.reduce((acc, s) => acc + s.weight * s.reps, 0);
                return (
                <button key={ex.id} className="card p-3 text-left w-full" onClick={() => selectExercise(ex.id, true)}>
                  <div className="font-semibold mb-1">{ex.name}</div>
                  <div className="text-sm text-textSecondary">
                    {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  •  ')}
                  </div>
                  <div className="text-xs text-textMuted mt-1">Sets: {ex.sets.length} • Volume: {Math.round(totalVolume)} lbs</div>
                </button>
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
              // Guard: require at least one logged set before finishing
              const hasAnySet = (currentWorkout.exercises || []).some(e => (e.sets || []).length > 0);
              if (!hasAnySet) { alert('Please add at least one set before finishing.'); return; }
              const endTime = new Date().toISOString();
              try {
                const session = {
                  name: currentWorkout.name,
                  date: currentWorkout.date,
                  startTime: currentWorkout.startTime,
                  endTime,
                  exercises: currentWorkout.exercises.map((e) => ({ id: e.id, name: e.name, sets: e.sets.map(s => ({ id: s.id, weight: s.weight, reps: s.reps })) }))
                };
                await persistWorkoutSession(session as any);
                completeWorkout();
                setShowFinishModal(true);
              } catch (err: any) {
                console.error('Failed to persist workout session', err);
                alert('Could not save workout. Please sign in and ensure Supabase credentials are configured.');
              }
            }}
            className="mt-3 w-full btn-primary"
          >
            Finish Workout
          </button>
        )}
      </div>
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="text-white text-lg font-semibold mb-2">Workout saved</div>
            <div className="text-slate-300 text-sm">Your session has been saved to the cloud. You can view it under History and Analytics.</div>
            <div className="mt-4 flex gap-2 justify-end">
              <button className="px-3 py-2 bg-slate-700 text-white rounded" onClick={() => setShowFinishModal(false)}>Close</button>
              <a href="#/" className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded">Return Home</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



