import type { PeriodizationPhase } from '../types/periodization';
import { ResearchEvidence, ResearchQuery } from '../../../lib/research/schema';
import { ResearchQueryEngine } from '../../../lib/research/queryEngine';
import { calculateProgressionSlope } from './phaseTransitions';

export type ProgressionData = { recentPerformance: Array<{ ts: number; value: number }> };
export type VolumeData = Array<{ week: string; volume: number }>;

export function calculateResearchBackedPhaseTransition(
  currentPhase: PeriodizationPhase,
  progressData: ProgressionData,
  plateauRisk: number,
  volumeData: VolumeData,
  engine?: ResearchQueryEngine
): {
  shouldTransition: boolean;
  nextPhase?: PeriodizationPhase;
  reasoning: string;
  confidence: number;
  researchBasis: ResearchEvidence[];
  expectedOutcomes: string[];
} {
  const query: ResearchQuery = { topic: `periodization ${currentPhase.type} transition`, evidenceLevel: ['meta-analysis', 'systematic-review'], yearRange: [2015, 2025] };
  const periodizationResearch = engine ? engine.query(query) : [];
  const criteria = extractTransitionCriteria(periodizationResearch);
  const currentPhaseLength = getPhaseLength(currentPhase);
  const progressionRate = calculateProgressionSlope(progressData.recentPerformance);
  const volProg = calculateVolumeProgression(volumeData);
  const hasProgressData = (progressData?.recentPerformance?.length || 0) >= 4;
  const evidenceStrength = periodizationResearch.length
    ? Math.min(1, periodizationResearch.reduce((a, e) => a + (e.weight ?? 0.5), 0) / Math.max(1, periodizationResearch.length))
    : 0.2; // weak by default

  // Helper to compute dynamic confidence based on evidence + data sufficiency + timing + plateau signal
  const computeConfidence = (
    minWeeks: number,
    reasonSignal: 'time' | 'plateau' | 'stagnation'
  ): number => {
    const timeFactor = Math.min(1, currentPhaseLength / Math.max(1, minWeeks));
    const dataFactor = hasProgressData ? 1 : 0.6;
    const plateauFactor = plateauRisk; // already [0,1]
    const stagnationFactor = Math.max(0, Math.min(1, Math.abs(progressionRate))); // tiny positive when nearly flat
    const reasonFactor = reasonSignal === 'time' ? timeFactor : reasonSignal === 'plateau' ? plateauFactor : stagnationFactor;
    const raw = 0.35 * evidenceStrength + 0.3 * timeFactor + 0.25 * dataFactor + 0.1 * reasonFactor;
    return Math.max(0.5, Math.min(0.98, raw));
  };

  if (currentPhase.type === 'hypertrophy') {
    const byTime = currentPhaseLength >= criteria.hypertrophy.minWeeks;
    const byPlateau = plateauRisk > criteria.hypertrophy.plateauThreshold && hasProgressData && progressionRate <= criteria.hypertrophy.progressionThreshold;
    if (byTime || byPlateau) {
      const reason = byTime
        ? `Hypertrophy phase threshold met (${currentPhaseLength}w). Transition to strength for neural adaptations.`
        : 'Hypertrophy progress stalling with elevated plateau risk. Transition to strength emphasis to vary stimulus.';
      return {
        shouldTransition: true,
        nextPhase: createStrengthPhaseFromCriteria(criteria),
        reasoning: reason,
        confidence: computeConfidence(criteria.hypertrophy.minWeeks, byTime ? 'time' : 'plateau'),
        researchBasis: periodizationResearch,
        expectedOutcomes: ['Increased 1RM', 'Reduced monotony', 'Preparation for next hypertrophy block']
      };
    }
  }
  if (currentPhase.type === 'strength') {
    const byTime = currentPhaseLength >= criteria.strength.minWeeks;
    const byStagnation = hasProgressData && progressionRate < criteria.strength.progressionThreshold;
    if (byTime || byStagnation) {
      return {
        shouldTransition: true,
        nextPhase: createDeloadPhaseFromCriteria(criteria),
        reasoning: byTime ? 'Strength phase complete. Deload to dissipate fatigue.' : 'Strength progress has stalled. Insert deload before next block.',
        confidence: computeConfidence(criteria.strength.minWeeks, byTime ? 'time' : 'stagnation'),
        researchBasis: periodizationResearch,
        expectedOutcomes: ['Reduced fatigue', 'Improved readiness', 'Set up for hypertrophy']
      };
    }
  }
  if (currentPhase.type === 'deload' && currentPhaseLength >= 1) {
    return {
      shouldTransition: true,
      nextPhase: createHypertrophyPhaseFromCriteria(criteria, volProg),
      reasoning: 'Deload complete. Start new hypertrophy block.',
      confidence: computeConfidence(1, 'time'),
      researchBasis: periodizationResearch,
      expectedOutcomes: ['Renewed volume tolerance', 'Improved workout quality']
    };
  }
  return { shouldTransition: false, reasoning: 'Continue current phase', confidence: 0.6, researchBasis: periodizationResearch, expectedOutcomes: [] };
}

function extractTransitionCriteria(_research: ResearchEvidence[]): any {
  return {
    hypertrophy: { minWeeks: 6, optimalWeeks: 6, plateauThreshold: 0.7, progressionThreshold: 0.01 },
    strength: { minWeeks: 4, optimalWeeks: 4, progressionThreshold: 0.01 }
  };
}

function getPhaseLength(phase: PeriodizationPhase): number {
  const ms = Date.now() - phase.startDate.getTime();
  return Math.max(0, Math.ceil(ms / (7 * 86400000)));
}

function calculateVolumeProgression(volumeData: VolumeData): number {
  const flat = (volumeData || []).map(w => w.volume);
  if (!flat.length) return 0;
  const n = flat.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = flat.reduce((a, b) => a + b, 0);
  const sumXY = flat.reduce((acc, y, i) => acc + x[i] * y, 0);
  const sumXX = x.reduce((acc, v) => acc + v * v, 0);
  const denom = n * sumXX - sumX * sumX;
  if (!denom) return 0;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const avg = sumY / n;
  return avg === 0 ? 0 : slope / avg;
}

function createStrengthPhaseFromCriteria(criteria: any): PeriodizationPhase {
  const start = new Date();
  return {
    id: `phase_${start.getTime()}`,
    type: 'strength',
    weekNumber: 1,
    totalWeeks: criteria.strength.optimalWeeks || 4,
    volumeMultiplier: 0.7,
    intensityRange: [0.8, 0.9],
    repRange: [4, 8],
    startDate: start,
    endDate: new Date(start.getTime() + (criteria.strength.optimalWeeks || 4) * 7 * 86400000),
    goals: ['Increase neural drive', 'Raise 5–8RM'],
    researchBacking: 'Moesgaard et al. (2022)'
  };
}

function createDeloadPhaseFromCriteria(_criteria: any): PeriodizationPhase {
  const start = new Date();
  return {
    id: `phase_${start.getTime()}`,
    type: 'deload',
    weekNumber: 1,
    totalWeeks: 1,
    volumeMultiplier: 0.6,
    intensityRange: [0.5, 0.65],
    repRange: [8, 15],
    startDate: start,
    endDate: new Date(start.getTime() + 7 * 86400000),
    goals: ['Dissipate fatigue'],
    researchBacking: 'Block/undulating models recommend brief deloads'
  };
}

function createHypertrophyPhaseFromCriteria(criteria: any, _volProg: number): PeriodizationPhase {
  const start = new Date();
  return {
    id: `phase_${start.getTime()}`,
    type: 'hypertrophy',
    weekNumber: 1,
    totalWeeks: criteria.hypertrophy.optimalWeeks || 6,
    volumeMultiplier: 1.0,
    intensityRange: [0.65, 0.75],
    repRange: [8, 15],
    startDate: start,
    endDate: new Date(start.getTime() + (criteria.hypertrophy.optimalWeeks || 6) * 7 * 86400000),
    goals: ['Accumulate volume', 'Increase work capacity'],
    researchBacking: 'Volume-emphasis block ~6 weeks'
  };
}


