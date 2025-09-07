import { ResearchEvidence } from '../../../lib/research/schema';

export type ComprehensiveVolumeAnalysis = {
  currentStatus: string;
  optimizationSuggestions: string[];
  populationComparison: string;
  progressionProtocol: string;
  plateauPrevention: string[];
  recoveryConsiderations: string[];
  evidenceStrength: number;
  limitations: string[];
};

export type ComprehensiveRestAnalysis = {
  optimalRange: [number, number] | null;
  intensityAdjustments: string[];
  volumeImpact: string;
  hypertrophyOptimization: string[];
  strengthOptimization: string[];
  fatigueManagement: string[];
  individualVariation: string[];
  evidenceBase: ResearchEvidence[];
};

type Population = { age: number; gender: string; experience?: string };

export function getResearchSaturatedVolumeAnalysis(
  muscleGroup: string,
  currentVolume: number,
  experience: string,
  age: number,
  gender: string
): ComprehensiveVolumeAnalysis {
  // Placeholder querying until full query engine wiring
  const evidenceStrength = 0.7;
  const optimalMin = 10;
  const optimalMax = 20;
  let status = 'within recommended range';
  if (currentVolume < optimalMin) status = 'below minimum effective volume';
  if (currentVolume > optimalMax) status = 'above typical optimal range';

  return {
    currentStatus: `${muscleGroup}: ${status} (${currentVolume} sets/week; target ${optimalMin}-${optimalMax})`,
    optimizationSuggestions: [
      'Distribute volume across 2–3 days/week',
      'Use mix of compound and isolation movements',
      'Prioritize long-length exercises where applicable'
    ],
    populationComparison: `${experience} ${gender}, age ${age}: targets based on meta-analyses for trained individuals`,
    progressionProtocol: 'Add ~2 sets/week for 2–4 weeks if recovery allows; deload 1 week after 4–6 weeks',
    plateauPrevention: ['Rotate exercises every 6–8 weeks', 'Adjust rep range block-to-block'],
    recoveryConsiderations: ['Ensure 2–3 min rest between hard sets', 'Sleep 7–9 hours; protein 1.6–2.2 g/kg/day'],
    evidenceStrength,
    limitations: ['Generalized range; individual responders vary widely']
  };
}

export function getResearchSaturatedRestAnalysis(
  exerciseType: string,
  repRange: number,
  intensity: number,
  currentRest: number
): ComprehensiveRestAnalysis {
  const evidenceBase: ResearchEvidence[] = [];
  const optimalRange: [number, number] = repRange <= 8 ? [2, 3] : [1.5, 2.5];
  return {
    optimalRange,
    intensityAdjustments: ['Higher intensity -> rest toward upper bound'],
    volumeImpact: 'Very short rests (<60s) can reduce load and total volume',
    hypertrophyOptimization: ['Use 90–180s for isolation when chasing pump but preserve load'],
    strengthOptimization: ['Use 2–3+ minutes for heavy compound lifts'],
    fatigueManagement: ['Increase rest on weeks with high accumulated fatigue'],
    individualVariation: ['Auto-regulate based on performance drop-offs set to set'],
    evidenceBase
  };
}

// Stubs for order/frequency — to be expanded with query engine wiring
export function getResearchSaturatedExerciseOrder() {
  return {
    optimalOrder: [],
    goalSpecificAdjustments: [],
    fatigueConsiderations: [],
    performanceOptimization: [],
    alternativeSequences: [],
    researchRationale: [],
    strengthOfEvidence: 0.6
  };
}

export function getResearchSaturatedFrequencyAnalysis() {
  return {
    optimalFrequency: 2,
    volumeFrequencyInteraction: 'Match frequency to distribute weekly sets effectively',
    recoveryConsiderations: ['Lower frequency if session volumes are too fatiguing'],
    experienceAdjustments: ['Trained lifters may tolerate higher frequency when volume is high'],
    plateauPrevention: ['Increase frequency to spread volume when sessions cap out'],
    distributionStrategies: ['2–3 sessions per muscle/week'],
    evidenceQuality: 0.7
  };
}


