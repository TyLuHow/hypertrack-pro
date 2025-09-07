import { PeriodizationPhase } from '../types/periodization';

export type ProgressionData = {
  recentPerformance: Array<{ ts: number; value: number }>;
};

export function getPhaseLength(phase: PeriodizationPhase): number {
  const ms = new Date().getTime() - phase.startDate.getTime();
  return Math.max(0, Math.ceil(ms / (7 * 86400000)));
}

export function calculateProgressionSlope(points: Array<{ ts: number; value: number }>): number {
  if (!points || points.length < 2) return 0;
  const xs = points.map((p) => p.ts);
  const ys = points.map((p) => p.value);
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((acc, x, i) => acc + (x - meanX) * (ys[i] - meanY), 0);
  const den = xs.reduce((acc, x) => acc + (x - meanX) * (x - meanX), 0);
  if (den === 0) return 0;
  // Normalize slope by meanY for scale invariance (percentage per ms), then weeklyize
  const slopePerMs = num / den;
  const slopePct = meanY === 0 ? 0 : (slopePerMs * 7 * 86400000) / meanY;
  return slopePct; // per week fraction
}

export function createHypertrophyPhase(): PeriodizationPhase {
  const start = new Date();
  const end = new Date(start.getTime() + 6 * 7 * 86400000);
  return {
    id: `phase_${start.getTime()}`,
    type: 'hypertrophy',
    weekNumber: 1,
    totalWeeks: 6,
    volumeMultiplier: 1.0,
    intensityRange: [0.65, 0.75],
    repRange: [8, 15],
    startDate: start,
    endDate: end,
    goals: ['Accumulate volume', 'Increase work capacity'],
    researchBacking: 'Moesgaard et al. (2022): periodization supports long-term progress; use block model.'
  };
}

export function createStrengthPhase(): PeriodizationPhase {
  const start = new Date();
  const end = new Date(start.getTime() + 4 * 7 * 86400000);
  return {
    id: `phase_${start.getTime()}`,
    type: 'strength',
    weekNumber: 1,
    totalWeeks: 4,
    volumeMultiplier: 0.7,
    intensityRange: [0.80, 0.9],
    repRange: [4, 8],
    startDate: start,
    endDate: end,
    goals: ['Increase neural drive', 'Raise 5–8RM'],
    researchBacking: 'Moesgaard et al. (2022): strength blocks improve 1RM; alternate with hypertrophy.'
  };
}

export function createDeloadPhase(): PeriodizationPhase {
  const start = new Date();
  const end = new Date(start.getTime() + 1 * 7 * 86400000);
  return {
    id: `phase_${start.getTime()}`,
    type: 'deload',
    weekNumber: 1,
    totalWeeks: 1,
    volumeMultiplier: 0.6,
    intensityRange: [0.5, 0.65],
    repRange: [8, 15],
    startDate: start,
    endDate: end,
    goals: ['Dissipate fatigue', 'Restore sensitivity'],
    researchBacking: 'Deload after strength block to reduce fatigue; supports continued progress.'
  };
}

export function calculatePhaseTransition(
  currentPhase: PeriodizationPhase,
  progressData: ProgressionData,
  plateauRisk: number
): {
  shouldTransition: boolean;
  nextPhase?: PeriodizationPhase;
  reasoning: string;
  confidence: number;
} {
  const currentPhaseLength = getPhaseLength(currentPhase);
  const progressionRate = calculateProgressionSlope(progressData?.recentPerformance || []);

  if (currentPhase.type === 'hypertrophy') {
    if (currentPhaseLength >= 6 || plateauRisk > 0.7) {
      return {
        shouldTransition: true,
        nextPhase: createStrengthPhase(),
        reasoning: '6 weeks of hypertrophy completed or plateau risk high. Transition to strength.',
        confidence: 0.85
      };
    }
  }

  if (currentPhase.type === 'strength') {
    if (currentPhaseLength >= 4 || progressionRate < 0.01) {
      return {
        shouldTransition: true,
        nextPhase: createDeloadPhase(),
        reasoning: 'Strength phase complete or no further progress. Deload next.',
        confidence: 0.9
      };
    }
  }

  if (currentPhase.type === 'deload' && currentPhaseLength >= 1) {
    return {
      shouldTransition: true,
      nextPhase: createHypertrophyPhase(),
      reasoning: 'Deload complete. Start new hypertrophy block.',
      confidence: 0.95
    };
  }

  return { shouldTransition: false, reasoning: 'Continue current phase', confidence: 0.8 };
}


