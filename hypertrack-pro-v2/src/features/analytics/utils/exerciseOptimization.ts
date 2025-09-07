import type { ResearchEvidence } from '../../../lib/research/schema';
import type { PeriodizationPhase } from '../../periodization/types/periodization';

export interface Exercise {
  name: string;
  muscleGroup: string;
  equipment: string[];
  emgActivation: number; // 0-100
  movementPattern: 'squat' | 'hinge' | 'press' | 'pull' | 'isolation' | 'carry';
  rangeOfMotion: 'long' | 'moderate' | 'short';
}

export interface PlateauStatus { status: 'none' | 'plateau'; exercise: Exercise }

export interface ExerciseRecommendation {
  primaryExercise: Exercise;
  alternatives: Exercise[];
  reasoning: string;
  emgActivation: number;
  researchBasis: ResearchEvidence[];
  substitutionTriggers: string[];
}

export function getOptimalExerciseSelection(
  muscleGroup: string,
  availableEquipment: string[],
  currentPhase: PeriodizationPhase,
  plateauStatus?: PlateauStatus
): ExerciseRecommendation {
  const emgResearch: ResearchEvidence[] = [];
  const rankings = getEMGBasedRankings(muscleGroup, emgResearch);
  const available = rankings.filter(ex => ex.equipment.some(eq => availableEquipment.includes(eq)));
  const phaseAdjusted = adjustForPeriodizationPhase(available, currentPhase);
  if (!phaseAdjusted.length) throw new Error('No exercises available for selection');
  if (plateauStatus?.status === 'plateau') {
    return selectPlateauBreakingExercise(phaseAdjusted, plateauStatus);
  }
  const primary = phaseAdjusted[0];
  const alternatives = phaseAdjusted.slice(1, 4);
  return {
    primaryExercise: primary,
    alternatives,
    reasoning: generateExerciseReasoning(primary, currentPhase, emgResearch),
    emgActivation: primary.emgActivation,
    researchBasis: emgResearch,
    substitutionTriggers: ['plateau_detected', 'equipment_unavailable', 'injury_concern']
  };
}

function getEMGBasedRankings(muscleGroup: string, _research: ResearchEvidence[]): Exercise[] {
  const group = muscleGroup.toLowerCase();
  // Default list informed by common EMG findings
  const db: Record<string, Exercise[]> = {
    chest: [
      { name: 'Barbell Bench Press', muscleGroup: 'chest', equipment: ['barbell', 'bench'], emgActivation: 90, movementPattern: 'press', rangeOfMotion: 'moderate' },
      { name: 'Incline Dumbbell Press', muscleGroup: 'chest', equipment: ['dumbbell', 'bench'], emgActivation: 85, movementPattern: 'press', rangeOfMotion: 'moderate' },
      { name: 'Weighted Dip', muscleGroup: 'chest', equipment: ['dip-bars'], emgActivation: 82, movementPattern: 'press', rangeOfMotion: 'long' },
      { name: 'Cable Fly', muscleGroup: 'chest', equipment: ['cable'], emgActivation: 70, movementPattern: 'isolation', rangeOfMotion: 'long' }
    ],
    back: [
      { name: 'Pull-Up', muscleGroup: 'back', equipment: ['pullup-bar'], emgActivation: 92, movementPattern: 'pull', rangeOfMotion: 'long' },
      { name: 'Bent-Over Barbell Row', muscleGroup: 'back', equipment: ['barbell'], emgActivation: 88, movementPattern: 'pull', rangeOfMotion: 'moderate' },
      { name: 'Lat Pulldown', muscleGroup: 'back', equipment: ['machine'], emgActivation: 80, movementPattern: 'pull', rangeOfMotion: 'moderate' }
    ],
    glutes: [
      { name: 'Barbell Hip Thrust', muscleGroup: 'glutes', equipment: ['barbell', 'bench'], emgActivation: 95, movementPattern: 'hinge', rangeOfMotion: 'moderate' },
      { name: 'Back Squat', muscleGroup: 'glutes', equipment: ['barbell', 'rack'], emgActivation: 85, movementPattern: 'squat', rangeOfMotion: 'long' },
      { name: 'Romanian Deadlift', muscleGroup: 'glutes', equipment: ['barbell'], emgActivation: 82, movementPattern: 'hinge', rangeOfMotion: 'long' }
    ],
    quads: [
      { name: 'High-Bar Back Squat', muscleGroup: 'quads', equipment: ['barbell', 'rack'], emgActivation: 90, movementPattern: 'squat', rangeOfMotion: 'long' },
      { name: 'Front Squat', muscleGroup: 'quads', equipment: ['barbell', 'rack'], emgActivation: 88, movementPattern: 'squat', rangeOfMotion: 'long' },
      { name: 'Leg Press', muscleGroup: 'quads', equipment: ['machine'], emgActivation: 80, movementPattern: 'squat', rangeOfMotion: 'moderate' },
      { name: 'Leg Extension', muscleGroup: 'quads', equipment: ['machine'], emgActivation: 78, movementPattern: 'isolation', rangeOfMotion: 'short' }
    ],
    shoulders: [
      { name: 'Overhead Barbell Press', muscleGroup: 'shoulders', equipment: ['barbell'], emgActivation: 85, movementPattern: 'press', rangeOfMotion: 'moderate' },
      { name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', equipment: ['dumbbell'], emgActivation: 75, movementPattern: 'isolation', rangeOfMotion: 'moderate' }
    ],
    hamstrings: [
      { name: 'Romanian Deadlift', muscleGroup: 'hamstrings', equipment: ['barbell'], emgActivation: 88, movementPattern: 'hinge', rangeOfMotion: 'long' },
      { name: 'Nordic Curl', muscleGroup: 'hamstrings', equipment: ['bodyweight'], emgActivation: 92, movementPattern: 'isolation', rangeOfMotion: 'moderate' }
    ],
    arms: [
      { name: 'Barbell Curl', muscleGroup: 'arms', equipment: ['barbell'], emgActivation: 82, movementPattern: 'isolation', rangeOfMotion: 'moderate' },
      { name: 'Cable Pushdown', muscleGroup: 'arms', equipment: ['cable'], emgActivation: 78, movementPattern: 'isolation', rangeOfMotion: 'moderate' }
    ]
  };
  return db[group] || [];
}

function adjustForPeriodizationPhase(exercises: Exercise[], phase: PeriodizationPhase): Exercise[] {
  if (phase.type === 'strength') {
    return exercises.sort((a, b) => (b.emgActivation + (b.movementPattern !== 'isolation' ? 10 : 0)) - (a.emgActivation + (a.movementPattern !== 'isolation' ? 10 : 0)));
  }
  return exercises.sort((a, b) => b.emgActivation - a.emgActivation);
}

function selectPlateauBreakingExercise(
  exercises: Exercise[],
  plateauStatus: PlateauStatus
): ExerciseRecommendation {
  const current = plateauStatus.exercise;
  const alts = exercises.filter(ex => ex.name !== current.name && (ex.movementPattern !== current.movementPattern || ex.rangeOfMotion !== current.rangeOfMotion));
  const next = alts[0] || exercises[0];
  return {
    primaryExercise: next,
    alternatives: alts.slice(1, 4),
    reasoning: `Plateau on ${current.name}. Switching to ${next.name} for novel stimulus (pattern/ROM variation).`,
    emgActivation: next.emgActivation,
    researchBasis: [],
    substitutionTriggers: ['plateau_resolved', 'performance_improvement']
  };
}

function generateExerciseReasoning(primary: Exercise, _phase: PeriodizationPhase, _evidence: ResearchEvidence[]): string {
  return `${primary.name} selected for high ${primary.muscleGroup} activation (${primary.emgActivation} EMG) and equipment availability.`;
}


