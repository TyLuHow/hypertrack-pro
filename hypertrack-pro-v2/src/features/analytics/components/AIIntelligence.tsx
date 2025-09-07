import React from 'react';
import { calculateHRVBasedReadiness } from '../utils/hrvReadiness';
import { ResearchBackedRecommendationCard } from './ResearchBackedRecommendationCard';
import { useQuery } from '@tanstack/react-query';
import { getWeeklyVolumeSeries, getWeeklyWorkoutFrequency } from '../../../lib/supabase/queries';

export const AIIntelligence: React.FC = () => {
  const { data: volumeSeries } = useQuery({ queryKey: ['weekly-volume-readiness-ui'], queryFn: () => getWeeklyVolumeSeries(12) });
  const { data: weeklyFreq } = useQuery({ queryKey: ['weekly-frequency-readiness-ui'], queryFn: () => getWeeklyWorkoutFrequency(12) });
  const readiness = calculateHRVBasedReadiness(
    (volumeSeries || []).map(v => v.volume),
    (weeklyFreq || []).map(f => f.count)
  );

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
                <span className="text-4xl font-bold text-white">{readiness.readinessScore ?? 7}</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-400">Recovery Score</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${!readiness ? 'bg-yellow-500' : readiness.readinessScore < 4 ? 'bg-red-500' : readiness.readinessScore < 6 ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                <span className="text-lg font-medium text-white">{readiness ? (readiness.readinessScore < 4 ? 'Poor' : readiness.readinessScore < 6 ? 'Fair' : 'Good') : 'Good'} - Training readiness</span>
              </div>
              <div className="bg-slate-800/80 rounded-xl p-4">
                <p className="text-gray-300">{readiness ? (readiness.recommendation === 'deload' ? 'Prioritize rest and reduce volume this week' : readiness.recommendation === 'reduce' ? 'Slightly reduce volume or intensity' : 'Proceed with planned training') : 'Keep up your current recovery routine!'}</p>
        <div className="mt-6">
          <ResearchBackedRecommendationCard
            recommendation={{
              title: `${readiness.recommendation.toUpperCase()} Training`,
              description: readiness.reasoning,
              researchBasis: readiness.researchBasis || [],
              confidence: readiness.readinessScore / 10
            }}
          />
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


