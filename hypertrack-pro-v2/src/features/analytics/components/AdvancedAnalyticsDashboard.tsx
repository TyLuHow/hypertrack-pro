import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePeriodization } from '../../periodization/hooks/usePeriodization';
import { generatePerformanceForecast, type ExercisePerformanceData } from '../utils/performancePrediction';
import { exportToCSV, generateComprehensiveReport, type DateRange, type AnalyticsReport } from '../utils/analyticsExport';
import { getExercisePerformanceSeries } from '../../../lib/supabase/queries';
import { inferExerciseType } from '../../../shared/utils/exerciseClassification';

function epley(weight: number, reps: number): number { return weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0; }

export function AdvancedAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('12weeks');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const { currentPhase } = usePeriodization();
  const userProfile = { experience: 'intermediate' as const };

  const days = selectedTimeframe === '12weeks' ? 84 : 168;
  const { data: exerciseSessions } = useQuery({ queryKey: ['exercise-performance-series', days], queryFn: () => getExercisePerformanceSeries(days) });

  const compoundExercises: ExercisePerformanceData[] = useMemo(() => {
    if (!exerciseSessions) return [];
    const byExercise = new Map<string, Array<{ ts: number; value: number }>>();
    for (const s of exerciseSessions) {
      const maxSet = (s.sets || []).reduce((acc, set) => Math.max(acc, epley(Number(set.weight)||0, Number(set.reps)||0)), 0);
      const ts = new Date(s.date).getTime();
      if (!byExercise.has(s.exercise)) byExercise.set(s.exercise, []);
      byExercise.get(s.exercise)!.push({ ts, value: Math.round(maxSet) });
    }
    const out: ExercisePerformanceData[] = [];
    Array.from(byExercise.entries()).forEach(([name, series]) => {
      const inferred = inferExerciseType(name);
      if (inferred.type !== 'compound') return;
      const sorted = series.sort((a,b)=>a.ts-b.ts);
      const currentMax = sorted.reduce((m, p) => Math.max(m, p.value), 0);
      out.push({ name, currentMax, data: sorted });
    });
    return out;
  }, [exerciseSessions]);

  const forecastData = useMemo(() => generatePerformanceForecast(compoundExercises, currentPhase, userProfile), [compoundExercises, currentPhase]);

  const handleExport = async (fmt: 'csv' | 'pdf') => {
    const range: DateRange = { start: new Date(Date.now() - 12 * 7 * 86400000).toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) };
    const report: AnalyticsReport = generateComprehensiveReport('me', range);
    if (fmt === 'csv') {
      const csv = exportToCSV(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'hypertrack-report.csv'; a.click(); URL.revokeObjectURL(url);
    } else {
      // placeholder: PDF export stub
      alert('PDF export will be available soon.');
    }
  };

  return (
    <div className="advanced-analytics bg-slate-900 text-slate-100 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Advanced Analytics</h2>
        <div className="flex items-center gap-3">
          <select value={selectedTimeframe} onChange={e => setSelectedTimeframe(e.target.value)} className="bg-slate-700 px-3 py-2 rounded">
            <option value="12weeks">Last 12 weeks</option>
            <option value="24weeks">Last 24 weeks</option>
          </select>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value as any)} className="bg-slate-700 px-3 py-2 rounded">
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button onClick={() => handleExport(exportFormat)} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800/60 rounded p-4">
          <h3 className="font-medium mb-3">Plateau Risk (Compound Lifts)</h3>
          {compoundExercises.length ? (
            <ul className="text-sm text-slate-300 space-y-1">
              {compoundExercises.map(ex => {
                const slope = (() => {
                  const pts = ex.data;
                  if (!pts || pts.length < 2) return 0;
                  const xs = pts.map(p=>p.ts);
                  const ys = pts.map(p=>p.value);
                  const n = xs.length;
                  const mx = xs.reduce((a,b)=>a+b,0)/n;
                  const my = ys.reduce((a,b)=>a+b,0)/n;
                  const num = xs.reduce((acc, x, i) => acc + (x-mx)*(ys[i]-my), 0);
                  const den = xs.reduce((acc, x) => acc + (x-mx)*(x-mx), 0);
                  if (den === 0 || my === 0) return 0;
                  const slopePerMs = num / den;
                  const weekly = slopePerMs * 7 * 86400000;
                  return weekly / my; // fraction/week
                })();
                const risk = Math.max(0, Math.min(1, 0.5 - slope));
                const label = risk > 0.7 ? 'High' : risk > 0.5 ? 'Moderate' : 'Low';
                return (<li key={ex.name}>{ex.name}: {label} risk (current {ex.currentMax} lbs)</li>);
              })}
            </ul>
          ) : (
            <div className="text-sm text-slate-300">No compound-lift data yet.</div>
          )}
        </div>
        <div className="bg-slate-800/60 rounded p-4">
          <h3 className="font-medium mb-3">Performance Forecast (Compound Lifts)</h3>
          {forecastData.length === 0 ? <div className="text-sm text-slate-300">No forecast available</div> : (
            <ul className="text-sm text-slate-300 space-y-1">
              {forecastData.map(f => (
                <li key={f.exercise}>{f.exercise}: {f.currentMax} → {f.predictedMax} in {f.timeframe}w (conf {Math.round(f.confidence*100)}%)</li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-slate-800/60 rounded p-4">
          <h3 className="font-medium mb-3">Periodization</h3>
          <div className="text-sm text-slate-300">Current phase: {currentPhase.type}</div>
        </div>
      </div>
    </div>
  );
}


