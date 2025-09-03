import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface RecoveryMetrics {
  score: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  recommendation: string;
  factors: {
    sleepQuality: number;
    trainingLoad: number;
    restDays: number;
    volumeProgression: number;
  };
}

async function calculateRecoveryScore(): Promise<RecoveryMetrics> {
  // Placeholder until wired to real data
  return {
    score: 75,
    status: 'Good',
    recommendation: 'Keep up your current recovery routine!',
    factors: { sleepQuality: 80, trainingLoad: 10000, restDays: 2, volumeProgression: 5 },
  };
}

export const AIIntelligence: React.FC = () => {
  const { data: recoveryData } = useQuery({ queryKey: ['recovery-analysis'], queryFn: calculateRecoveryScore, refetchInterval: 3600000 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Training Intelligence</h1>
        <p className="text-xl text-gray-300">Recovery & Readiness</p>
      </div>
      <div className="p-6">
        <div className="bg-slate-700/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-8 border-emerald-500/60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{recoveryData?.score ?? 75}</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-400">Recovery Score</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-lg font-medium text-white">{recoveryData?.status || 'Good'} - Normal training ready</span>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-4">
                <p className="text-gray-300">{recoveryData?.recommendation || 'Keep up your current recovery routine!'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


