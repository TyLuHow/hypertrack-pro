import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getPerMuscleWeeklyTrends } from '../../../lib/supabase/queries';

export const PerMuscleTrends: React.FC<{ userId?: string }> = ({ userId }) => {
  const { data } = useQuery({ queryKey: ['per-muscle-trends', userId], queryFn: () => getPerMuscleWeeklyTrends(12, userId) });
  const [muscleFilter, setMuscleFilter] = useState<string>('');
  const series = useMemo(() => {
    if (!data || data.length === 0) return { keys: [] as string[], rows: [] as any[], muscles: [] as string[] };
    const muscles = Array.from(new Set(data.map(d => d.muscle)));
    const byWeek = new Map<string, any>();
    for (const d of data) {
      const row = byWeek.get(d.week) || { week: d.week };
      row[d.muscle] = d.volume;
      byWeek.set(d.week, row);
    }
    const rows = Array.from(byWeek.values()).sort((a,b) => (a.week < b.week ? -1 : 1));
    // compute top 5 by total volume when no filter selected
    const totals = new Map<string, number>();
    data.forEach((d) => totals.set(d.muscle, (totals.get(d.muscle) || 0) + d.volume));
    const top5 = Array.from(totals.entries()).sort((a,b) => b[1]-a[1]).slice(0,5).map(([m]) => m);
    const keys = muscleFilter ? [muscleFilter] : top5;
    return { keys, rows, muscles };
  }, [data, muscleFilter]);

  if (!data || data.length === 0) return <div className="text-gray-400">No per-muscle data</div>;

  const colors = ["#38bdf8","#22c55e","#f43f5e","#f59e0b","#a78bfa","#10b981","#eab308","#f472b6"];

  return (
    <div>
      <div className="mb-3">
        <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="bg-slate-700 text-gray-200 px-3 py-2 rounded">
          <option value="">Top 5 muscles</option>
          {series.muscles.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={Math.max(0, Math.floor(series.rows.length / 6) - 1)} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
            {series.keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


