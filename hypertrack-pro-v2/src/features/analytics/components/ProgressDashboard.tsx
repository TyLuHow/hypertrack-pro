import React from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ProgressSummary = {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  avgDuration: number;
  weeklyWorkoutTrend?: number;
  weeklySetTrend?: number;
  volumeTrend?: number;
  durationTrend?: number;
};

type ExerciseProgress = {
  exerciseName: string;
  maxWeight: number;
  maxVolume: number;
  weightTrend: number;
  volumeTrend: number;
  plateauRisk: boolean;
  lastPR: string | null;
  sessionsCount: number;
};

async function getProgressSummary(_userId: string): Promise<ProgressSummary> {
  // Placeholder: wire to Supabase RPC or client aggregation
  return {
    totalWorkouts: 0,
    totalSets: 0,
    totalVolume: 0,
    avgDuration: 0,
  };
}

async function getExerciseProgress(_userId: string): Promise<ExerciseProgress[]> {
  return [];
}

interface ProgressDashboardProps {
  userId: string;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId }) => {
  const { data: progressSummary, isLoading } = useQuery({
    queryKey: ['progress-summary', userId],
    queryFn: () => getProgressSummary(userId),
    refetchInterval: 30000,
  });

  const { data: exerciseProgress } = useQuery({
    queryKey: ['exercise-progress', userId],
    queryFn: () => getExerciseProgress(userId),
  });

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

        {/* TODO: RecentProgressChart and ExerciseProgressList once implemented */}
        <div className="bg-slate-700/40 rounded-2xl p-8 text-center text-gray-400">Charts coming soon</div>
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


