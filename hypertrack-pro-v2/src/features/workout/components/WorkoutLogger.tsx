import React, { useMemo, useState } from 'react';
import { useWorkoutStore } from '../../../shared/stores/workoutStore';
import { useRecommendations } from '../../../shared/hooks/useRecommendations';

interface WorkoutLoggerProps {
  onExerciseSelect: () => void;
  onStartRestTimer: (duration: number) => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  onExerciseSelect,
  onStartRestTimer
}) => {
  const {
    currentWorkout,
    activeExercise,
    addSet,
    startWorkout,
    completeWorkout,
    startRestTimer
  } = useWorkoutStore();
  const [weight, setWeight] = useState<number>(0);
  const [reps, setReps] = useState<number>(8);

  const { recommendation } = useRecommendations(activeExercise ?? undefined);

  const canAdd = useMemo(() => !!activeExercise && weight > 0 && reps > 0, [activeExercise, weight, reps]);

  const handleQuickAdjust = (field: 'weight' | 'reps', delta: number) => {
    if (field === 'weight') setWeight((w) => Math.max(0, Math.round((w + delta) / 2.5) * 2.5));
    else setReps((r) => Math.max(1, r + delta));
  };

  const handleAddSet = () => {
    if (!activeExercise || !canAdd) return;
    addSet(activeExercise, { id: `${Date.now()}`, weight, reps });
    // Start rest timer (React overlay) with default 90s; store flag optional
    startRestTimer(90);
    onStartRestTimer(90);
    // Reset inputs for fast logging flow
    setReps(8);
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen p-4 pb-28">
      {!currentWorkout && (
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <div className="text-lg font-semibold mb-2">Ready to train?</div>
          <button
            onClick={startWorkout}
            className="w-full h-12 bg-blue-600 rounded-lg"
          >
            Start Workout
          </button>
        </div>
      )}
      <button
        onClick={onExerciseSelect}
        className="w-full h-12 bg-gray-800 rounded-lg text-left px-4 mb-4"
      >
        {activeExercise || 'Select Exercise'}
      </button>

      {currentWorkout && activeExercise && (
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          {recommendation && (
            <div className="mb-3 text-sm text-gray-300">
              Recommended: <span className="font-semibold">{recommendation.recommendedWeight} lbs</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Weight</div>
              <div className="flex items-center space-x-3">
                <button
                  className="h-11 w-11 rounded-full bg-gray-700 text-xl"
                  onClick={() => handleQuickAdjust('weight', -2.5)}
                >
                  -
                </button>
                <input
                  type="number"
                  className="flex-1 h-11 bg-gray-900 rounded-lg px-3 text-xl"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
                <button
                  className="h-11 w-11 rounded-full bg-gray-700 text-xl"
                  onClick={() => handleQuickAdjust('weight', 2.5)}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-1">Reps</div>
              <div className="flex items-center space-x-3">
                <button
                  className="h-11 w-11 rounded-full bg-gray-700 text-xl"
                  onClick={() => handleQuickAdjust('reps', -1)}
                >
                  -
                </button>
                <input
                  type="number"
                  className="flex-1 h-11 bg-gray-900 rounded-lg px-3 text-xl"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                />
                <button
                  className="h-11 w-11 rounded-full bg-gray-700 text-xl"
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
              className="flex-1 h-12 bg-blue-600 disabled:bg-blue-900 rounded-lg text-center text-lg"
            >
              Add Set
            </button>
            <button
              onClick={() => onStartRestTimer(90)}
              className="h-12 px-4 bg-gray-700 rounded-lg"
            >
              Rest
            </button>
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 bg-gray-900/80 backdrop-blur-md p-4 border-t border-gray-800">
        <div className="text-sm text-gray-400 mb-2">Current Workout</div>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {currentWorkout ? (
            currentWorkout.exercises.length > 0 ? (
              currentWorkout.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="font-semibold mb-1">{ex.name}</div>
                  <div className="text-sm text-gray-300">
                    {ex.sets.map((s) => `${s.weight}×${s.reps}`).join('  •  ')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No sets yet</div>
            )
          ) : (
            <div className="text-gray-500">No active workout</div>
          )}
        </div>
        {currentWorkout && (
          <button
            onClick={completeWorkout}
            className="mt-3 w-full h-11 bg-gray-700 rounded-lg"
          >
            Finish Workout
          </button>
        )}
      </div>
    </div>
  );
};



