import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getDailyProgressSeries } from '../../../lib/supabase/queries';

type ExerciseProgress = {
  exerciseName: string;
  // more fields added when data wiring is complete
};

export const RecentProgressChart: React.FC<{ workouts?: ExerciseProgress[]; className?: string }> = ({ workouts, className = '' }) => {
  const { data } = useQuery({ queryKey: ['daily-progress'], queryFn: () => getDailyProgressSeries(28) });
  if ((!workouts || workouts.length === 0) && (!data || data.length === 0)) {
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
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="totalVolume" stroke="#3b82f6" dot={{ r: 2 }} name="Volume" />
            <Line type="monotone" dataKey="estimatedRM" stroke="#ef4444" dot={{ r: 2 }} name="Est. 1RM (max per day)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


