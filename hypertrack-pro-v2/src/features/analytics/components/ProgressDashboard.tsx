import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { PerMuscleTrends } from './PerMuscleTrends';
import { PRTimeline } from './PRTimeline';
import { useQuery } from '@tanstack/react-query';
import { getProgressSummary, getWeeklyVolumeSeries, getMuscleGroupVolumeDistribution, getWorkoutMetricsSeries } from '../../../lib/supabase/queries';
import { useState } from 'react';

// Reserved for future exercise-level metrics

interface ProgressDashboardProps {
  userId?: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId }) => {
  const { data: progressSummary, isLoading } = useQuery({
    queryKey: ['progress-summary', userId],
    queryFn: () => getProgressSummary(userId),
    refetchInterval: 30000,
  });

  const { data: volumeSeries } = useQuery({
    queryKey: ['weekly-volume', userId],
    queryFn: () => getWeeklyVolumeSeries(12, userId)
  });

  const { data: muscleDistribution } = useQuery({
    queryKey: ['muscle-distribution', userId],
    queryFn: () => getMuscleGroupVolumeDistribution(28, userId)
  });

  const [seriesDays, setSeriesDays] = useState<number>(180);
  const { data: workoutSeries } = useQuery({ queryKey: ['workout-metrics', userId, seriesDays], queryFn: () => getWorkoutMetricsSeries(seriesDays, userId) });

  if (isLoading) {
    return <div className="p-6 text-textPrimary">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Progress Analytics</h1>
        <p className="text-gray-300">Track your evidence-based training progress</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <MetricCard value={progressSummary?.totalWorkouts || 0} label="Total Workouts" trend={progressSummary?.weeklyWorkoutTrend} />
          <MetricCard value={progressSummary?.totalSets || 0} label="Total Sets" trend={progressSummary?.weeklySetTrend} />
          <MetricCard value={progressSummary?.totalVolume || 0} label="Total Volume (lbs)" trend={progressSummary?.volumeTrend} />
          <MetricCard value={progressSummary?.avgDuration || 0} label="Avg Duration (min)" trend={progressSummary?.durationTrend} suffix="min" />
        </div>

        <div className="bg-slate-700/40 rounded-2xl p-6">
          <div className="text-white font-semibold mb-3">Weekly Volume</div>
          {volumeSeries && volumeSeries.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} interval={Math.max(0, Math.floor(volumeSeries.length / 6) - 1)} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v}`}/>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} lbs`, 'Volume']} labelFormatter={(l: string) => `Week ${l}`} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="volume" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-400">No volume data yet</div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-700/40 rounded-2xl p-6">
            <div className="text-white font-semibold mb-3">Muscle Group Volume (28d)</div>
            {muscleDistribution && muscleDistribution.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={muscleDistribution} dataKey="volume" nameKey="muscle" outerRadius={90} label={(e) => e.muscle}>
                      {muscleDistribution.map((_, i) => (
                        <Cell key={i} fill={["#38bdf8","#22c55e","#f43f5e","#f59e0b","#a78bfa","#10b981"][i % 6]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center text-gray-400">No distribution data</div>
            )}
          </div>
          <div className="bg-slate-700/40 rounded-2xl p-6">
            <div className="text-white font-semibold mb-3">Per-Muscle Weekly Trends</div>
            <PerMuscleTrends userId={userId} />
          </div>
        </div>

        <div className="bg-slate-700/40 rounded-2xl p-6 mt-6">
          <div className="text-white font-semibold mb-3">Workout Timelines</div>
          <div className="flex gap-2 mb-3">
            {[30, 90, 180, 365].map((d) => (
              <button key={d} onClick={() => setSeriesDays(d)} className={`px-3 py-1 rounded ${seriesDays===d? 'bg-teal-600 text-white':'bg-slate-700 text-gray-300'}`}>{d}d</button>
            ))}
          </div>
          {workoutSeries && workoutSeries.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={workoutSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
                    formatter={(value: any, name: any, props: any) => {
                      return [value, name];
                    }}
                    labelFormatter={(label: string, payload: any) => {
                      // Aggregate for tooltip
                      const d = payload && payload[0] ? payload[0].payload : undefined;
                      if (!d) return label;
                      // split classification
                      const muscles = new Set<string>();
                      const items = (workoutSeries || []).filter(x => x.date === d.date);
                      items.forEach(x => muscles.add(x.muscle));
                      const has = (m: string) => Array.from(muscles).some(mm => mm.toLowerCase().includes(m));
                      const splits: string[] = [];
                      if (has('back') || has('bicep')) splits.push('pull');
                      if (has('chest') || has('tricep')) splits.push('push');
                      if (has('shoulder') || has('deltoid')) splits.push('shoulders');
                      if (has('quad') || has('hamstring') || has('glute') || has('leg')) splits.push('legs');
                      const totalSets = items.reduce((acc, x) => acc + x.sets, 0);
                      const totalVolume = items.reduce((acc, x) => acc + x.volume, 0);
                      return `${d.date} • sets: ${totalSets} • volume: ${Math.round(totalVolume)} • split: ${splits.join(' + ') || 'other'}`;
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#38bdf8" dot={{ r: 2 }} connectNulls name="Max Weight" />
                  <Line type="monotone" dataKey="reps" stroke="#22c55e" dot={{ r: 2 }} connectNulls name="Max Reps" />
                  <Line type="monotone" dataKey="sets" stroke="#f59e0b" dot={{ r: 2 }} connectNulls name="Sets" />
                  <Line type="monotone" dataKey="volume" stroke="#a78bfa" dot={{ r: 2 }} connectNulls name="Volume" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center text-gray-400">No workout data</div>
          )}
        </div>

        <div className="bg-slate-700/40 rounded-2xl p-6 mt-6">
          <div className="text-white font-semibold mb-3">PR Timelines</div>
          <PRTimeline userId={userId} />
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ value: number; label: string; trend?: number; suffix?: string }> = ({ value, label, trend, suffix = '' }) => {
  const trendColor = trend && trend > 0 ? 'text-green-400' : trend && trend < 0 ? 'text-red-400' : 'text-gray-400';
  return (
    <div className="bg-slate-700/50 rounded-2xl p-6 text-center">
      <div className="text-5xl font-bold text-slate-300 mb-2">{value.toLocaleString()}{suffix}</div>
      <div className="text-sm text-gray-400 mb-2">{label}</div>
      {typeof trend === 'number' && (
        <div className={`text-xs ${trendColor} flex items-center justify-center`}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
};


