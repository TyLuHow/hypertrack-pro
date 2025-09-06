import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getPRTimelines } from '../../../lib/supabase/queries';

export const PRTimeline: React.FC<{ userId?: string }> = ({ userId }) => {
  const [days, setDays] = useState<number>(180);
  const { data } = useQuery({ queryKey: ['pr-timelines', userId, days], queryFn: () => getPRTimelines(days, userId) });
  const [metric, setMetric] = useState<'weight' | 'reps' | 'volume' | 'onerm'>('weight');
  const [exerciseFilter, setExerciseFilter] = useState<string>('');
  const [muscleFilter, setMuscleFilter] = useState<string>('');

  const series = useMemo(() => {
    if (!data || data.length === 0) return { keys: [] as string[], rows: [] as any[], exercises: [] as string[] };
    const metricFiltered = data.filter(d => d.type === metric && (!muscleFilter || (d as any).muscle === muscleFilter));
    // rank exercises by total sets (number of entries) within window
    const counts = new Map<string, number>();
    metricFiltered.forEach((d) => counts.set(d.exercise, (counts.get(d.exercise) || 0) + 1));
    const exercises = Array.from(new Set(metricFiltered.map(d => d.exercise))).sort((a,b) => (counts.get(b)! - counts.get(a)!));
    const focusExercises = exerciseFilter ? [exerciseFilter] : exercises;
    const byDate = new Map<string, any>();
    for (const d of metricFiltered) {
      if (exerciseFilter && d.exercise !== exerciseFilter) continue;
      const row = byDate.get(d.date) || { date: d.date, ts: new Date(d.date).getTime() };
      row[d.exercise] = d.value;
      byDate.set(d.date, row);
    }
    let rows = Array.from(byDate.values()).sort((a,b) => (a.date < b.date ? -1 : 1));
    // compute overall trend (mean across visible exercises per day), then simple moving average (window 3)
    const trend = rows.map((r: any) => {
      const vals = focusExercises.map((k) => (typeof r[k] === 'number' ? r[k] : null)).filter((v) => v != null) as number[];
      const mean = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
      return { ts: r.ts, trend: mean };
    });
    const smoothed = trend.map((p, i, arr) => {
      const win = arr.slice(Math.max(0, i-2), i+1).map(x => x.trend).filter((v) => v != null) as number[];
      const ma = win.length ? (win.reduce((a,b)=>a+b,0)/win.length) : null;
      return { ts: p.ts, trend: ma };
    });
    return { keys: focusExercises, rows, exercises, trend: smoothed };
  }, [data, metric, exerciseFilter, muscleFilter]);

  if (!data || data.length === 0) return <div className="text-gray-400">No PR data</div>;

  const colors = ["#38bdf8","#22c55e","#f43f5e","#f59e0b","#a78bfa","#10b981","#eab308","#f472b6"];

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {(['weight','reps','volume','onerm'] as const).map((m) => (
          <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1 rounded ${metric===m? 'bg-teal-600 text-white':'bg-slate-700 text-gray-300'}`}>{m}</button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        {[30, 90, 180, 365].map((d) => (
          <button key={d} onClick={() => setDays(d)} className={`px-3 py-1 rounded ${days===d? 'bg-teal-600 text-white':'bg-slate-700 text-gray-300'}`}>{d}d</button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <select value={muscleFilter} onChange={(e) => setMuscleFilter(e.target.value)} className="bg-slate-700 text-gray-200 px-3 py-2 rounded">
          <option value="">All muscle groups</option>
          {Array.from(new Set((data||[]).map(d => (d as any).muscle).filter(Boolean))).map((m) => (
            <option key={m as string} value={m as string}>{m as string}</option>
          ))}
        </select>
        <select value={exerciseFilter} onChange={(e) => setExerciseFilter(e.target.value)} className="bg-slate-700 text-gray-200 px-3 py-2 rounded">
          <option value="">All exercises</option>
          {series.exercises.map((ex) => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series.rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="ts" type="number" domain={['dataMin','dataMax']} tickFormatter={(t) => new Date(t).toISOString().slice(0,10)} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
              formatter={(value: any, name: any, props: any) => {
                const p = props && props.payload;
                const trend = (p && typeof p.trend === 'number') ? p.trend : undefined;
                const pct = trend ? ` (+${(((value - trend) / trend) * 100).toFixed(1)}%)` : '';
                return [`${value}${pct}`, name];
              }}
              labelFormatter={(t) => new Date(Number(t)).toISOString().slice(0,10)}
            />
            {series.keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i % colors.length]} dot={false} connectNulls />
            ))}
            {/* Overall dotted trend */}
            <Line type="monotone" data={series.trend as any} dataKey="trend" stroke="#94a3b8" dot={false} strokeDasharray="5 5" isAnimationActive={false} xAxisId={0} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


