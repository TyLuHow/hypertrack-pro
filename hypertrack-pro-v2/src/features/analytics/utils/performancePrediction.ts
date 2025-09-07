import type { PeriodizationPhase } from '../../periodization/types/periodization';

export interface ExercisePerformanceData { name: string; currentMax: number; data: Array<{ ts: number; value: number }> };
export interface UserProfile { experience: 'novice' | 'intermediate' | 'advanced'; }

export interface PerformanceForecast {
  exercise: string;
  currentMax: number;
  predictedMax: number;
  timeframe: number; // weeks
  confidence: number;
  assumptions: string[];
  limitingFactors: string[];
}

function progressionRate(points: Array<{ ts: number; value: number }>): number {
  if (!points || points.length < 2) return 0.0;
  const xs = points.map(p => p.ts);
  const ys = points.map(p => p.value);
  const n = xs.length;
  const meanX = xs.reduce((a,b)=>a+b,0)/n;
  const meanY = ys.reduce((a,b)=>a+b,0)/n;
  const num = xs.reduce((acc, x, i) => acc + (x-meanX)*(ys[i]-meanY), 0);
  const den = xs.reduce((acc, x) => acc + (x-meanX)*(x-meanX), 0);
  if (den === 0) return 0;
  const slopePerMs = num / den;
  const weekly = slopePerMs * 7 * 86400000;
  return meanY === 0 ? 0 : weekly / meanY; // fraction per week
}

function getExperienceMultiplier(experience: string): number {
  const multipliers: Record<string, number> = { novice: 1.0, intermediate: 0.7, advanced: 0.4 };
  return multipliers[experience] ?? 0.7;
}

function getPhaseMultiplier(phase: PeriodizationPhase['type']): number {
  if (phase === 'strength') return 1.1;
  if (phase === 'deload') return 0.6;
  return 1.0;
}

function identifyLimitingFactors(exercise: ExercisePerformanceData, plateauRisk: number): string[] {
  const out: string[] = [];
  if (plateauRisk > 0.6) out.push('High plateau risk');
  if (progressionRate(exercise.data) < 0.01) out.push('Low progression rate');
  if ((exercise.data || []).length < 4) out.push('Insufficient data history');
  return out;
}

function calculateExercisePlateauRisk(exercise: ExercisePerformanceData): number {
  const r = progressionRate(exercise.data);
  return Math.max(0, Math.min(1, 0.5 - r));
}

export function generatePerformanceForecast(
  exerciseHistory: ExercisePerformanceData[],
  currentPhase: PeriodizationPhase,
  userProfile: UserProfile
): PerformanceForecast[] {
  return (exerciseHistory || []).map(exercise => {
    const r = Math.max(0, progressionRate(exercise.data)); // clamp negatives to zero growth to avoid absurd predictions
    const plateauRisk = calculateExercisePlateauRisk(exercise);
    const experienceMultiplier = getExperienceMultiplier(userProfile.experience);
    const phaseMultiplier = getPhaseMultiplier(currentPhase.type);
    const predictedGain = r * experienceMultiplier * phaseMultiplier; // fraction per week (non-negative)
    const weeks = 12;
    const predicted = Math.round(exercise.currentMax * (1 + predictedGain * weeks));
    return {
      exercise: exercise.name,
      currentMax: exercise.currentMax,
      predictedMax: Math.max(exercise.currentMax, predicted),
      timeframe: weeks,
      confidence: Math.max(0.3, 0.9 - plateauRisk),
      assumptions: [
        'Consistent training frequency',
        'Progressive overload maintained',
        'No major injuries or disruptions'
      ],
      limitingFactors: identifyLimitingFactors(exercise, plateauRisk)
    };
  });
}


