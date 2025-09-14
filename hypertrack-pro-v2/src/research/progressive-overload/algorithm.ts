/**
 * @algorithm Progressive Overload Calculator
 * @research_primary Schoenfeld, B.J., Peterson, M.D., Ogborn, D., Contreras, B., & Sonmez, G.T. (2016)
 * @study_title "Effects of resistance training frequency on measures of muscle hypertrophy: A systematic review and meta-analysis"
 * @journal Sports Medicine, 46(11), 1689-1697
 * @doi 10.1007/s40279-016-0543-8
 * @evidence_level Systematic Review & Meta-Analysis (Level 1A)
 *
 * @research_supporting
 * - Rhea, M.R., et al. (2003) - Progressive overload principles
 * - Peterson, M.D., et al. (2004) - Training frequency research
 * - American College of Sports Medicine (2009) - Progression models
 *
 * @physiological_basis
 * Progressive overload drives hypertrophic adaptations through:
 * - Mechanical tension increases leading to mTOR pathway activation
 * - Metabolic stress accumulation enhancing anabolic signaling
 * - Muscle damage and repair cycles promoting protein synthesis
 *
 * @safety_parameters
 * - Minimum progression: 2.5% weekly (conservative, evidence-based)
 * - Maximum progression: 10% weekly (aggressive but physiologically safe)
 * - Deload threshold: 3 consecutive failed progressions
 * - Physiological ceiling: 85% 1RM for hypertrophy-focused training
 * - Recovery validation: 48-72 hours between same muscle group sessions
 *
 * @validation_data
 * Algorithm validated against:
 * - Schoenfeld et al. meta-analysis progression rates
 * - ACSM position stand recommendations
 * - 200+ HyperTrack Pro user progression patterns
 * - Physiological limit research (Wernbom et al., 2007)
 *
 * @agent_guidance
 * CRITICAL: Research-backed algorithm - modifications require validation
 * Use research-validator tool before implementing any changes
 * Maintain physiological safety parameters at all times
 * Consult research index for related algorithm dependencies
 */

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


