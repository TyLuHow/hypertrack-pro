import React, { useState } from 'react';

type SetData = { weight: number; reps: number; rpe?: number };
type Exercise = { name: string; muscle_group: string; category: string; sets: SetData[]; notes?: string };
type WorkoutSession = { id?: string; name?: string; date: string; duration: number; exercises: Exercise[] };

interface WorkoutDetailsModalProps {
  workout: WorkoutSession;
  isOpen: boolean;
  onClose: () => void;
  onEditWorkout?: (workout: WorkoutSession) => void;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({ workout, isOpen, onClose, onEditWorkout }) => {
  const [_selectedExercise, setSelectedExercise] = useState<string | null>(null);
  if (!isOpen) return null;

  const totalVolume = calculateWorkoutVolume(workout);
  const duration = formatDuration(workout.duration);
  const exerciseCount = workout.exercises.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center">
      <div className="bg-slate-800 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-t-3xl md:rounded-2xl">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{new Date(workout.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric' })}</h2>
              <p className="text-gray-300">{workout.name || 'Workout Session'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center text-white">✕</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{exerciseCount}</div>
              <div className="text-xs text-gray-400">Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{totalVolume.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Volume (lbs)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{duration}</div>
              <div className="text-xs text-gray-400">Duration</div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <h3 className="text-lg font-semibold text-white mb-4">Exercises Performed</h3>
          <div className="space-y-4">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <div key={`${exercise.name}-${exerciseIndex}`} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{exercise.name}</h4>
                    <p className="text-sm text-gray-400 capitalize">{exercise.muscle_group} • {exercise.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">{exercise.sets.length} sets</div>
                    <div className="text-sm text-teal-400">{calculateExerciseVolume(exercise)} lbs total</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="bg-slate-800/50 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm text-gray-400">Set {setIndex + 1}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">{set.weight}lbs × {set.reps} reps</span>
                        {set.rpe && <span className="text-xs text-gray-400">RPE {set.rpe}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {exercise.notes && (
                  <div className="mt-3 p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-gray-300">{exercise.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-slate-700/30 border-t border-slate-600">
          <div className="flex gap-3">
            <button onClick={() => onEditWorkout?.(workout)} className="flex-1 bg-teal-600 hover:bg-teal-500 text-white py-3 px-4 rounded-xl font-medium">Edit Workout</button>
            <button onClick={onClose} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-xl font-medium">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateWorkoutVolume = (workout: WorkoutSession): number => {
  return workout.exercises.reduce((total, exercise) => total + calculateExerciseVolume(exercise), 0);
};

const calculateExerciseVolume = (exercise: Exercise): number => {
  return exercise.sets.reduce((total, set) => total + set.weight * set.reps, 0);
};

const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};


