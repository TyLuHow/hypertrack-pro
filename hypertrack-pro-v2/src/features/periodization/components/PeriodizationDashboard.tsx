import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePeriodization } from '../hooks/usePeriodization';
import { calculateResearchBackedPhaseTransition } from '../utils/researchBackedTransitions';
import type { ProgressionData } from '../utils/researchBackedTransitions';
import { ResearchBackedRecommendationCard } from '../../analytics/components/ResearchBackedRecommendationCard';
import { getWorkoutMetricsSeries, getPRTimelines } from '../../../lib/supabase/queries';

function formatDistanceToNow(date: Date): string {
  const ms = date.getTime() - Date.now();
  const days = Math.max(0, Math.ceil(ms / 86400000));
  return `${days} days`;
}

async function getProgressionHistory(): Promise<ProgressionData> {
  try {
    // Get PR timelines for the last 12 weeks to analyze progression
    const prData = await getPRTimelines(84); // 12 weeks = 84 days
    
    if (!prData || prData.length === 0) {
      return { recentPerformance: [] };
    }
    
    // Calculate progression slope for each exercise
    const exerciseProgressions = new Map<string, number[]>();
    
    prData.forEach(pr => {
      if (pr.type === 'weight' && pr.value > 0) {
        const existing = exerciseProgressions.get(pr.exercise) || [];
        existing.push(pr.value);
        exerciseProgressions.set(pr.exercise, existing);
      }
    });
    
    // Calculate average progression rate
    const progressionRates: number[] = [];
    exerciseProgressions.forEach((values) => {
      if (values.length >= 3) {
        // Simple linear regression slope
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        if (!isNaN(slope) && isFinite(slope)) {
          progressionRates.push(slope);
        }
      }
    });
    
    const avgProgressionRate = progressionRates.length > 0 
      ? progressionRates.reduce((a, b) => a + b, 0) / progressionRates.length 
      : 0;
    
    return {
      recentPerformance: [{ ts: Date.now(), value: avgProgressionRate }],
      currentPhaseWeeks: 6, // Default, could be calculated from workout history
      currentPhase: 'hypertrophy' as const
    };
  } catch (error) {
    console.error('Error calculating progression history:', error);
    return { recentPerformance: [] };
  }
}

export function PeriodizationDashboard() {
  const { currentPhase, nextTransition, actions } = usePeriodization();
  const { data: progressData } = useQuery({ queryKey: ['progression-history'], queryFn: getProgressionHistory });
  const { data: volumeSeries } = useQuery({ queryKey: ['weekly-volume-series-ui'], queryFn: () => Promise.resolve([] as any) });
  const plateauRisk = 0.0;
  const transitionRecommendation = calculateResearchBackedPhaseTransition(
    currentPhase,
    (progressData || { recentPerformance: [] }) as any,
    plateauRisk,
    (volumeSeries || []) as any
  );

  return (
    <div className="bg-slate-700/40 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Training Periodization</h2>
      <PhaseIndicator phase={currentPhase} transitionIn={nextTransition} />
      <PhaseProgress currentWeek={currentPhase.weekNumber} totalWeeks={currentPhase.totalWeeks} goals={currentPhase.goals} />
      {transitionRecommendation.shouldTransition && transitionRecommendation.nextPhase && (
        <div className="mt-4">
          <ResearchBackedRecommendationCard
            recommendation={{
              title: `Transition to ${transitionRecommendation.nextPhase.type} Phase`,
              description: transitionRecommendation.reasoning,
              researchBasis: transitionRecommendation.researchBasis,
              confidence: transitionRecommendation.confidence
            }}
          />
          <div className="mt-3">
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded text-white text-sm" onClick={() => actions.transitionPhase(transitionRecommendation.nextPhase!)}>Accept Transition</button>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-400 mt-4">Research: {currentPhase.researchBacking}</div>
    </div>
  );
}

function PhaseIndicator({ phase, transitionIn }: { phase: { type: 'hypertrophy' | 'strength' | 'deload' | 'power'; weekNumber: number; totalWeeks: number }; transitionIn: Date }) {
  const phaseColors: Record<string, string> = {
    hypertrophy: 'bg-green-500/20 text-green-300',
    strength: 'bg-blue-500/20 text-blue-300',
    deload: 'bg-yellow-500/20 text-yellow-300',
    power: 'bg-purple-500/20 text-purple-300'
  };
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${phaseColors[phase.type]}`}>{phase.type.charAt(0).toUpperCase() + phase.type.slice(1)} Phase</div>
        <span className="text-gray-300">Week {phase.weekNumber} of {phase.totalWeeks}</span>
      </div>
      <div className="text-sm text-gray-400">Next transition: {formatDistanceToNow(transitionIn)}</div>
    </div>
  );
}

function PhaseProgress({ currentWeek, totalWeeks, goals }: { currentWeek: number; totalWeeks: number; goals: string[] }) {
  const pct = Math.round((currentWeek / Math.max(totalWeeks, 1)) * 100);
  return (
    <div className="mb-4">
      <div className="h-2 bg-slate-600 rounded">
        <div className="h-2 bg-teal-500 rounded" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-400 mt-2">Goals: {goals.join(' • ')}</div>
    </div>
  );
}

// Removed unused TransitionRecommendation component to satisfy lint rules


