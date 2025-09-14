import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { PerMuscleTrends } from './PerMuscleTrends';
import { PRTimeline } from './PRTimeline';
import { useQuery } from '@tanstack/react-query';
import { getProgressSummary, getWeeklyVolumeSeries, getMuscleGroupVolumeDistribution, getWorkoutMetricsSeries, getWeeklyWorkoutFrequency } from '../../../lib/supabase/queries';
import { useState } from 'react';
import { RESEARCH_CITATIONS, RESEARCH_VOLUME_TARGETS } from '../../../shared/constants/researchTargets';
import { useRecommendations } from '../../../shared/hooks/useRecommendations';
import { PeriodizationDashboard } from '../../periodization/components/PeriodizationDashboard';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { calculateHRVBasedReadiness } from '../utils/hrvReadiness';
import { ResearchBackedRecommendationCard } from './ResearchBackedRecommendationCard';

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
  const { researchRecommendations } = useRecommendations();
  const { data: weeklyFreq } = useQuery({ queryKey: ['weekly-frequency-progress', userId], queryFn: () => getWeeklyWorkoutFrequency(12, userId) });
  const readiness = calculateHRVBasedReadiness(
    (volumeSeries || []).map(v => v.volume),
    (weeklyFreq || []).map(f => f.count)
  );
  const urgentRecommendations = (researchRecommendations || []).filter((r: any) => r.urgency === 'high' && (typeof (r as any).confidence === 'number' ? (r as any).confidence > 0.7 : true));

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
        <div className="mb-6">
          <PeriodizationDashboard />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <MetricCard value={progressSummary?.totalWorkouts || 0} label="Total Workouts" trend={progressSummary?.weeklyWorkoutTrend} />
          <MetricCard value={progressSummary?.totalSets || 0} label="Total Sets" trend={progressSummary?.weeklySetTrend} />
          <MetricCard value={progressSummary?.totalVolume || 0} label="Total Volume (lbs)" trend={progressSummary?.volumeTrend} />
          <MetricCard value={progressSummary?.avgDuration || 0} label="Avg Duration (min)" trend={progressSummary?.durationTrend} suffix="min" />
        </div>

        <div className="bg-slate-700/40 rounded-2xl p-6">
          <div className="text-white font-semibold mb-3">Weekly Volume</div>
          {/* Research insight for overall volume guidance if distribution suggests extremes */}
          {muscleDistribution && muscleDistribution.length > 0 && (
            <ResearchInsight metric="weeklyVolume" value={(volumeSeries||[]).reduce((a,v)=>a+v.volume,0)} muscleGroup={undefined} />
          )}
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
            {/* Show top research-backed calls to action */}
            {researchRecommendations && researchRecommendations.slice(0,2).map((rec, idx) => (
              <ResearchInsight key={idx} metric="weeklySets" value={rec.current} muscleGroup={rec.muscle} />
            ))}
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
                      const d = payload && payload[0] ? payload[0].payload : undefined;
                      if (!d) return label;
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

        {/* Urgent recommendations */}
        {urgentRecommendations && urgentRecommendations.length > 0 && (
          <section className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-red-400">Urgent Training Adjustments</h3>
            <div className="space-y-4">
              {urgentRecommendations.map((rec: any, index: number) => {
                const basis = rec.citation
                  ? [{ title: String(rec.citation), year: Number(String(rec.citation).match(/(19|20)\d{2}/)?.[0] || new Date().getFullYear()) }]
                  : (rec.researchBasis || []);
                const title = rec.muscle ? `${rec.muscle}: ${rec.type === 'volume_increase' ? 'Increase' : rec.type === 'volume_reduce' ? 'Reduce' : 'Maintain'} volume` : (rec.title || 'Urgent Recommendation');
                const desc = rec.reasoning || rec.description || (rec.recommended ? `Target ~${rec.recommended} sets/week` : '');
                return (
                  <ResearchBackedRecommendationCard key={index} recommendation={{
                    title,
                    description: desc,
                    researchBasis: basis as any,
                    confidence: typeof rec.confidence === 'number' ? rec.confidence : 0.8
                  }} />
                );
              })}
            </div>
          </section>
        )}

        {/* All muscle group set discrepancies */}
        {researchRecommendations && researchRecommendations.length > 0 && (
          <section className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-white">Muscle Group Set Discrepancies</h3>
            <div className="bg-slate-700/40 rounded-lg p-4">
              <div className="space-y-2">
                {researchRecommendations
                  .sort((a: any, b: any) => {
                    // Sort by urgency first (high > medium > low), then by discrepancy magnitude
                    const urgencyOrder = { high: 3, medium: 2, low: 1 };
                    const aUrgency = urgencyOrder[a.urgency] || 0;
                    const bUrgency = urgencyOrder[b.urgency] || 0;
                    if (aUrgency !== bUrgency) return bUrgency - aUrgency;
                    
                    // Then sort by absolute discrepancy (largest first)
                    const aDiscrepancy = Math.abs(a.current - a.recommended);
                    const bDiscrepancy = Math.abs(b.current - b.recommended);
                    return bDiscrepancy - aDiscrepancy;
                  })
                  .map((rec: any, index: number) => {
                    const discrepancy = rec.current - rec.recommended;
                    const isAbove = discrepancy > 0;
                    const isBelow = discrepancy < 0;
                    const isOptimal = Math.abs(discrepancy) <= 1; // Within 1 set is considered optimal
                    
                    const getStatusColor = () => {
                      if (rec.urgency === 'high') return 'text-red-400';
                      if (rec.urgency === 'medium') return 'text-yellow-400';
                      if (isOptimal) return 'text-green-400';
                      return 'text-gray-400';
                    };
                    
                    const getStatusIcon = () => {
                      if (rec.urgency === 'high') return '⚠️';
                      if (rec.urgency === 'medium') return '⚡';
                      if (isOptimal) return '✅';
                      return '📊';
                    };
                    
                    return (
                      <div key={index} className="flex items-center justify-between py-2 px-3 bg-slate-600/30 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getStatusIcon()}</span>
                          <div>
                            <span className="font-medium text-white">{rec.muscle}</span>
                            <div className="text-sm text-gray-400">
                              Current: {rec.current} sets/week • Target: {rec.recommended} sets/week
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${getStatusColor()}`}>
                            {isAbove ? `+${Math.abs(discrepancy)}` : isBelow ? `-${Math.abs(discrepancy)}` : '0'} sets
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {rec.urgency} priority
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        )}

        {/* Readiness overview */}
        <section className="mt-6">
          <div className="bg-blue-50/10 border border-blue-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-200">Current Readiness</h4>
                <p className="text-sm text-blue-300">{readiness.reasoning}</p>
              </div>
              <div className="text-2xl font-bold text-blue-300">
                {readiness.readinessScore.toFixed(1)}/10
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <AdvancedAnalyticsDashboard />
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

function ResearchInsight({ metric, value, muscleGroup }: { metric: string; value: number; muscleGroup?: string }) {
  const getResearchInsight = (m: string, v: number, mg?: string) => {
    if (m === 'weeklySets' && mg) {
      const key = mg.toLowerCase();
      const tgt = (RESEARCH_VOLUME_TARGETS as any)[key];
      if (!tgt) return null;
      if (v < tgt.min) {
        return { message: `Below MEV for ${mg}. Aim ≥ ${tgt.min} sets/week.`, citation: RESEARCH_CITATIONS.schoenfeld_2017 };
      }
      if (v > tgt.max) {
        return { message: `Above likely MAV for ${mg}. Consider reducing toward ${tgt.optimal} sets/week.`, citation: RESEARCH_CITATIONS.baz_valle_2022 };
      }
      return { message: `${mg} volume is within optimal range. Maintain.`, citation: RESEARCH_CITATIONS.schoenfeld_2017 };
    }
    if (m === 'weeklyVolume') {
      return { message: 'Distribute weekly volume across muscles 10–20 sets/week per muscle as a guide.', citation: RESEARCH_CITATIONS.schoenfeld_2017 };
    }
    return null;
  };
  const insight = getResearchInsight(metric, value, muscleGroup);
  if (!insight) return null;
  return (
    <div className="bg-blue-50/10 border-l-4 border-blue-400 p-3 mb-4 rounded">
      <div className="text-sm text-blue-200">{insight.message}
        <button className="ml-2 text-xs text-blue-300 hover:underline" onClick={() => alert(`${insight.citation.title} (${insight.citation.year})`)}>
          Source: {insight.citation.authors[0]} et al. ({insight.citation.year})
        </button>
      </div>
    </div>
  );
}


