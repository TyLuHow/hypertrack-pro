/**
 * @research_implementation Plateau Detection Algorithm
 * @research_primary Mangine, G.T., et al. (2015)
 * @agent_guidance Research-validated; ensures safe deload recommendations
 */

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutExerciseSession {
  date: string; // ISO date
  sets: WorkoutSet[];
}

export interface PlateauAnalysisInput {
  sessions: WorkoutExerciseSession[]; // most recent first
  windowSize?: number; // defaults to 6
}

export interface PlateauAnalysisResult {
  plateauDetected: boolean;
  slope?: number;
  variance?: number;
  consideredCount: number;
}

const DEFAULT_WINDOW = 6;
const SLOPE_THRESHOLD = 0.005;
const VARIANCE_THRESHOLD = 2.5;

export function getBestSet(sets: WorkoutSet[]): WorkoutSet {
  return sets.reduce((best, s) => {
    const vol = s.weight * s.reps;
    const bestVol = best.weight * best.reps;
    return vol > bestVol ? s : best;
  }, sets[0]);
}

export function detectPlateau(input: PlateauAnalysisInput): PlateauAnalysisResult {
  const recent = (input.sessions || []).slice(0, input.windowSize ?? DEFAULT_WINDOW);
  const n = recent.length;
  if (n < 3) {
    return { plateauDetected: false, consideredCount: n };
  }

  const weights = recent.map(s => getBestSet(s.sets).weight);

  // Linear regression slope and variance
  const x = Array.from({ length: n }, (_, i) => i);
  const meanX = (n - 1) / 2;
  const meanY = weights.reduce((a, b) => a + b, 0) / n;

  const numerator = weights.reduce((sum, y, i) => sum + (i - meanX) * (y - meanY), 0);
  const denominator = x.reduce((sum, _, i) => sum + Math.pow(i - meanX, 2), 0);
  const slope = denominator === 0 ? 0 : numerator / denominator;
  const variance = weights.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0) / n;

  const plateauDetected = slope < SLOPE_THRESHOLD && variance < VARIANCE_THRESHOLD && n >= 3;
  return { plateauDetected, slope, variance, consideredCount: n };
}

export interface DeloadRecommendation {
  volumeReduction: number; // 0.5
  loadReductionRange: [number, number]; // [0.10, 0.15]
}

export function getDeloadRecommendation(): DeloadRecommendation {
  return {
    volumeReduction: 0.5,
    loadReductionRange: [0.10, 0.15]
  };
}


