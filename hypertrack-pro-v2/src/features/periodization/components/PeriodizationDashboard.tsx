import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePeriodization } from '../hooks/usePeriodization';
import { calculateResearchBackedPhaseTransition } from '../utils/researchBackedTransitions';
import type { ProgressionData } from '../utils/researchBackedTransitions';
import { ResearchBackedRecommendationCard } from '../../analytics/components/ResearchBackedRecommendationCard';

function formatDistanceToNow(date: Date): string {
  const ms = date.getTime() - Date.now();
  const days = Math.max(0, Math.ceil(ms / 86400000));
  return `${days} days`;
}

async function getProgressionHistory(): Promise<ProgressionData> {
  // Placeholder: could derive from PR timelines or workout metrics
  return { recentPerformance: [] };
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

function TransitionRecommendation({ recommendation, onAccept }: { recommendation: { reasoning: string; confidence: number; nextPhase?: any }; onAccept: () => void }) {
  return (
    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-600">
      <div className="text-white font-medium mb-2">Recommended Transition</div>
      <div className="text-gray-300 text-sm mb-3">{recommendation.reasoning} (confidence {Math.round(recommendation.confidence * 100)}%)</div>
      <button className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded text-white text-sm" onClick={onAccept}>Accept Transition</button>
    </div>
  );
}


