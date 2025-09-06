import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getWeeklyWorkoutFrequency } from '../../../lib/supabase/queries';

export const TrainingFrequencyChart: React.FC<{ userId?: string }> = ({ userId }) => {
  const { data } = useQuery({ queryKey: ['weekly-frequency', userId], queryFn: () => getWeeklyWorkoutFrequency(12, userId) });
  if (!data || data.length === 0) return <div className="text-gray-400">No frequency data</div>;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={Math.max(0, Math.floor(data.length / 6) - 1)} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
          <Tooltip labelFormatter={(l) => `Week ${l}`} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
          <Bar dataKey="count" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


