// Evidence-based progression algorithm (preserved from legacy app.js)

export type ExerciseType = 'compound' | 'isolation';

export interface ProgressionInput {
  exerciseType: ExerciseType;
  currentWeight: number; // last best-set weight
  achievedReps: number; // last best-set reps
  targetReps?: number; // optional ui target; not used in gating
  daysSinceLastSession: number; // integer days
}

export interface ProgressionOutput {
  shouldProgress: boolean;
  recommendedWeight: number;
  recommendedReps: number;
  rationale: string;
  meta: {
    weeklyRate: number; // 0.0035 or 0.005
    sessionsFactor: number; // days/7 clamped min 0.5
    roundingIncrement: number; // 2.5
  };
}

const progressionGate = {
  compounds: { minReps: 10 },
  isolations: { minReps: 12 }
};

const progressionRates = {
  compounds: 0.0035, // 0.35% per week
  isolations: 0.005 // 0.5% per week
};

const ROUNDING_INCREMENT = 2.5;

export function calculateProgression(input: ProgressionInput): ProgressionOutput {
  const isCompound = input.exerciseType === 'compound';

  const repGate = isCompound ? progressionGate.compounds.minReps : progressionGate.isolations.minReps;
  const passGate = input.achievedReps >= repGate;

  const weeklyRate = isCompound ? progressionRates.compounds : progressionRates.isolations;

  // Days-since-session adjustment (sessionsFactor): max(days/7, 0.5)
  const sessionsFactor = Math.max(input.daysSinceLastSession / 7, 0.5);

  const base = input.currentWeight;
  let proposed = base;
  if (passGate) {
    proposed = base * (1 + weeklyRate * sessionsFactor);
  } else {
    proposed = base; // hold when gate not passed
  }

  // Microloading via 2.5 lb rounding (round up like legacy: Math.ceil(x / 2.5) * 2.5)
  const rounded = Math.ceil(proposed / ROUNDING_INCREMENT) * ROUNDING_INCREMENT;

  return {
    shouldProgress: passGate,
    recommendedWeight: rounded,
    recommendedReps: input.achievedReps,
    rationale: passGate ? 'Load increase permitted by APRE/RPE gate + % band' : 'Hold load; progress via reps',
    meta: {
      weeklyRate,
      sessionsFactor,
      roundingIncrement: ROUNDING_INCREMENT
    }
  };
}




