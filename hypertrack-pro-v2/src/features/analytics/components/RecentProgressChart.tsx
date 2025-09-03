import React from 'react';

type ExerciseProgress = {
  exerciseName: string;
  // more fields added when data wiring is complete
};

export const RecentProgressChart: React.FC<{ workouts: ExerciseProgress[]; className?: string }> = ({ workouts, className = '' }) => {
  if (!workouts || workouts.length === 0) {
    return (
      <div className={`bg-slate-700/40 rounded-2xl p-8 ${className}`}>
        <h3 className="text-xl font-semibold text-white mb-4">Recent Progress</h3>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mb-4" />
          <p className="text-gray-400 italic text-center">Start your first workout to see personalized volume recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-700/40 rounded-2xl p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Progress</h3>
      </div>
      <div className="h-80 flex items-center justify-center text-gray-400">Chart coming soon</div>
    </div>
  );
};


