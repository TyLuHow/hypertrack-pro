import React from 'react';

type FrequencyAnalysis = {
  weeklyPattern: { day: string; workouts: number }[];
  averagePerWeek: number;
  consistency: number; // percent
  optimalFrequency: boolean;
};

export const TrainingFrequencyChart: React.FC<{ data: FrequencyAnalysis }> = ({ data }) => {
  return (
    <div className="bg-slate-700/40 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Weekly Training Pattern</h3>
      <div className="h-64 mb-6 flex items-center justify-center text-gray-400">Bar chart coming soon</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-teal-400 mb-1">{data.averagePerWeek.toFixed(1)}</div>
          <div className="text-sm text-gray-400">Avg workouts/week</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400 mb-1">{data.consistency}%</div>
          <div className="text-sm text-gray-400">Weekly consistency</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400 mb-1">{data.optimalFrequency ? 'Yes' : 'Adjust'}</div>
          <div className="text-sm text-gray-400">Optimal frequency</div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
        <h4 className="font-medium text-white mb-2">Research-Based Insights</h4>
        <p className="text-sm text-gray-300">Aim for 3-4 sessions/week; balance intensity and recovery for progress.</p>
      </div>
    </div>
  );
};


