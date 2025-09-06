import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { getPRTimelines } from '../../../lib/supabase/queries';

export const PRTimeline: React.FC<{ userId?: string }> = ({ userId }) => {
  const { data } = useQuery({ queryKey: ['pr-timelines', userId], queryFn: () => getPRTimelines(180, userId) });
  const [metric, setMetric] = useState<'weight' | 'reps' | 'volume'>('weight');

  const series = useMemo(() => {
    if (!data || data.length === 0) return { keys: [] as string[], rows: [] as any[] };
    const filtered = data.filter(d => d.type === metric);
    const exercises = Array.from(new Set(filtered.map(d => d.exercise)));
    const byDate = new Map<string, any>();
    for (const d of filtered) {
      const row = byDate.get(d.date) || { date: d.date };
      row[d.exercise] = d.value;
      byDate.set(d.date, row);
    }
    const rows = Array.from(byDate.values()).sort((a,b) => (a.date < b.date ? -1 : 1));
    return { keys: exercises, rows };
  }, [data, metric]);

  if (!data || data.length === 0) return <div className="text-gray-400">No PR data</div>;

  const colors = ["#38bdf8","#22c55e","#f43f5e","#f59e0b","#a78bfa","#10b981","#eab308","#f472b6"];

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {(['weight','reps','volume'] as const).map((m) => (
          <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1 rounded ${metric===m? 'bg-teal-600 text-white':'bg-slate-700 text-gray-300'}`}>{m}</button>
        ))}
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
            <Legend />
            {series.keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


