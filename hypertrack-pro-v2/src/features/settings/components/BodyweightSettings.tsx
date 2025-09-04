import React, { useState } from 'react';

type BodyweightExercise = { name: string; weight?: number };

export const BodyweightSettings: React.FC = () => {
  const [bodyWeight, setBodyWeight] = useState<number>(180);
  const [bodyweightExercises, setBodyweightExercises] = useState<BodyweightExercise[]>([
    { name: 'Pull-ups' },
    { name: 'Chin-ups' },
    { name: 'Push-ups' },
    { name: 'Dips' },
    { name: 'Bodyweight Squats' },
  ]);

  const handleWeightUpdate = (exerciseName: string, weight: number) => {
    setBodyweightExercises((prev) => prev.map((ex) => (ex.name === exerciseName ? { ...ex, weight } : ex)));
  };

  const calculateBodyweightExerciseWeight = (exercise: BodyweightExercise): number => {
    switch (exercise.name.toLowerCase()) {
      case 'pull-ups':
      case 'chin-ups':
        return bodyWeight;
      case 'push-ups':
        return Math.round(bodyWeight * 0.64);
      case 'dips':
        return Math.round(bodyWeight * 0.7);
      case 'bodyweight squats':
        return Math.round(bodyWeight * 0.6);
      default:
        return bodyWeight;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Current Body Weight</h3>
        <div className="flex items-center gap-4">
          <input type="number" value={bodyWeight} onChange={(e) => setBodyWeight(Number(e.target.value))} className="bg-slate-600 text-white px-4 py-2 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <span className="text-gray-300">lbs</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">This will automatically update weights for all bodyweight exercises</p>
      </div>

      <div className="bg-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Bodyweight Exercise Weights</h3>
        <p className="text-sm text-gray-400 mb-4">Automatically calculated based on research. You can override any value manually.</p>
        <div className="space-y-3">
          {bodyweightExercises.map((exercise) => (
            <div key={exercise.name} className="flex justify-between items-center py-3 border-b border-slate-600 last:border-b-0">
              <div>
                <h4 className="text-white font-medium">{exercise.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={exercise.weight ?? calculateBodyweightExerciseWeight(exercise)}
                  onChange={(e) => handleWeightUpdate(exercise.name, Number(e.target.value))}
                  className="bg-slate-600 text-white px-3 py-2 rounded-lg w-20 text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-gray-300 text-sm">lbs</span>
                <button onClick={() => handleWeightUpdate(exercise.name, calculateBodyweightExerciseWeight(exercise))} className="text-teal-400 hover:text-teal-300 text-sm" title="Reset to calculated weight">
                  ↻
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


