import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getExercisePerformanceSeries, type ExerciseSessionSeries } from '../../../lib/supabase/queries';
import { detectPlateau } from '@research/plateau-detection/algorithm';

type ExercisePlateauData = {
  exerciseName: string;
  sessionsAnalyzed: number;
  currentMax: number;
  trendSlope: number; // as fraction per session
  plateauRisk: boolean;
  stagnationRisk?: boolean;
};

export const PlateauDetection: React.FC = () => {
  const { data } = useQuery<ExerciseSessionSeries>({ queryKey: ['exercise-performance-series'], queryFn: () => getExercisePerformanceSeries(90) });

  const analysisRows: ExercisePlateauData[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Group sessions by exercise
    const byExercise = new Map<string, Array<{ date: string; sets: { weight: number; reps: number }[] }>>();
    for (const s of data) {
      const list = byExercise.get(s.exercise) || [];
      list.push({ date: s.date, sets: s.sets });
      byExercise.set(s.exercise, list);
    }
    const rows: ExercisePlateauData[] = [];
    Array.from(byExercise.entries()).forEach(([exerciseName, sessions]) => {
      // sort most recent first as expected by algorithm hook
      const sorted = sessions.sort((a, b) => (a.date < b.date ? 1 : -1));
      const input = sorted.map(s => ({ date: s.date, sets: s.sets }));
      const analysis = detectPlateau({ sessions: input as any });
      const bestSet = sBest(sorted[0]?.sets || []);
      const trendSlope = typeof analysis.slope === 'number' ? analysis.slope : 0;
      rows.push({
        exerciseName,
        sessionsAnalyzed: (analysis as any).consideredCount ?? sorted.length,
        currentMax: bestSet?.weight || 0,
        trendSlope,
        plateauRisk: !!(analysis as any).plateauDetected,
        stagnationRisk: !(analysis as any).plateauDetected && Math.abs(trendSlope) < 0.01
      });
    });
    // prioritize risks first
    return rows.sort((a, b) => (Number(b.plateauRisk) - Number(a.plateauRisk)) || (b.sessionsAnalyzed - a.sessionsAnalyzed)).slice(0, 12);
  }, [data]);
  return (
    <div className="space-y-6">
      {analysisRows.map((exercise) => (
        <PlateauCard key={exercise.exerciseName} exercise={exercise} onViewDetails={() => {}} />
      ))}
      {(!analysisRows || analysisRows.length === 0) && (
        <div className="bg-slate-700/40 rounded-2xl p-8 text-center text-gray-400">No plateau risks detected</div>
      )}
    </div>
  );
};

const PlateauCard: React.FC<{ exercise: ExercisePlateauData; onViewDetails: () => void }> = ({ exercise, onViewDetails }) => {
  const riskLevel = exercise.plateauRisk ? 'high' : exercise.stagnationRisk ? 'medium' : 'low';
  const riskColors: Record<string, string> = {
    high: 'border-red-500 bg-red-500/10',
    medium: 'border-yellow-500 bg-yellow-500/10',
    low: 'border-green-500 bg-green-500/10',
  };
  const riskLabels: Record<string, string> = {
    high: 'Plateau Detected',
    medium: 'Stagnation Risk',
    low: 'Progressing Well',
  };
  return (
    <div className={`rounded-2xl border p-6 ${riskColors[riskLevel]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{exercise.exerciseName}</h3>
          <p className="text-sm text-gray-400">{exercise.sessionsAnalyzed} sessions analyzed</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}
        >
          {riskLabels[riskLevel]}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-white mb-1">{exercise.currentMax}lbs</div>
          <div className="text-sm text-gray-400">Current Max</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white mb-1">{exercise.trendSlope > 0 ? '+' : ''}{(exercise.trendSlope * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-400">6-Session Trend</div>
        </div>
      </div>
      {exercise.plateauRisk && (
        <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-white mb-2">Recommended Action</h4>
          <p className="text-sm text-gray-300 mb-3">{getDeloadRecommendation(exercise)}</p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-white text-sm font-medium">Apply Deload</button>
            <button onClick={onViewDetails} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white text-sm font-medium">View Details</button>
          </div>
        </div>
      )}
    </div>
  );
};

const getDeloadRecommendation = (exercise: ExercisePlateauData): string => {
  const recommendations = [
    `Reduce weight by 10-15% (try ${Math.round(exercise.currentMax * 0.85)}-${Math.round(exercise.currentMax * 0.9)}lbs)`,
    'Maintain reps but focus on form and tempo',
    'Take 1 week of reduced volume (-50%) then return to progressive loading',
    'Consider exercise variation or accessory work to address weak points',
  ];
  return recommendations.join(' • ');
};

function sBest(sets: Array<{ weight: number; reps: number }>): { weight: number; reps: number } | undefined {
  if (!sets || sets.length === 0) return undefined;
  return sets.reduce((best, s) => {
    const vol = (s.weight || 0) * (s.reps || 0);
    const bvol = (best.weight || 0) * (best.reps || 0);
    return vol > bvol ? s : best;
  }, sets[0]);
}


