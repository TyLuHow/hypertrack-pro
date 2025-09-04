import React, { useEffect, useMemo, useState } from 'react';
import { useWorkoutStore } from '../../../shared/stores/workoutStore';
import { WeightInput } from './WeightInput';
import { useExerciseHistory } from '../../../shared/hooks/useExerciseHistory';
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
    completeWorkout
  } = useWorkoutStore();
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(8);
  const activeExerciseName = useMemo(() => {
    const ex = currentWorkout?.exercises.find((e) => e.id === activeExercise);
    return ex?.name || undefined;
  }, [currentWorkout, activeExercise]);
  const history = useExerciseHistory(activeExerciseName);

  useEffect(() => {
    if (history.lastWeight != null && weight === 0) {
      setWeight(history.lastWeight);
    }
  }, [history.lastWeight]);

  const { recommendation } = useRecommendations(activeExercise ?? undefined);

  const canAdd = useMemo(() => !!activeExercise && weight > 0 && reps > 0, [activeExercise, weight, reps]);

  const handleQuickAdjust = (field: 'weight' | 'reps', delta: number) => {
    if (field === 'weight') setWeight((w) => Math.max(0, Math.round((w + delta) / 2.5) * 2.5));
    else setReps((r) => Math.max(1, r + delta));
  };

  const handleAddSet = () => {
    if (!activeExercise || !canAdd) return;
    addSet(activeExercise, { id: `${Date.now()}`, weight, reps });
    // Reset inputs for fast logging flow
    setReps(8);
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
        onClick={onExerciseSelect}
        className="w-full h-12 bg-surface rounded-lg text-left px-4 mb-4"
      >
        {activeExercise || 'Select Exercise'}
      </button>

      {currentWorkout && activeExercise && (
        <div className="card p-4 mb-4">
          {recommendation && (
            <div className="mb-3 text-sm text-textSecondary">
              Recommended: <span className="font-semibold">{recommendation.recommendedWeight} lbs</span>
            </div>
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

          <div className="mt-4 flex items-center space-x-3">
            <button
              onClick={handleAddSet}
              disabled={!canAdd}
              className="flex-1 btn-primary disabled:bg-blue-900 text-center text-lg"
            >
              Add Set
            </button>
            
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 bg-background/80 backdrop-blur-md p-4 border-t border-gray-800">
        <div className="text-sm text-textMuted mb-2">Current Workout</div>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {currentWorkout ? (
            currentWorkout.exercises.length > 0 ? (
              currentWorkout.exercises.map((ex) => (
                <div key={ex.id} className="card p-3">
                  <div className="font-semibold mb-1">{ex.name}</div>
                  <div className="text-sm text-textSecondary">
                    {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  •  ')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-textMuted">No sets yet</div>
            )
          ) : (
            <div className="text-textMuted">No active workout</div>
          )}
        </div>
        {currentWorkout && (
          <button
            onClick={completeWorkout}
            className="mt-3 w-full btn-muted"
          >
            Finish Workout
          </button>
        )}
      </div>
    </div>
  );
};



