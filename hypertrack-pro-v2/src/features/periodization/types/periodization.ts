export interface PeriodizationPhase {
  id: string;
  type: 'hypertrophy' | 'strength' | 'deload' | 'power';
  weekNumber: number;
  totalWeeks: number;
  volumeMultiplier: number;
  intensityRange: [number, number]; // % 1RM
  repRange: [number, number];
  startDate: Date;
  endDate: Date;
  goals: string[];
  researchBacking: string;
}

export interface PeriodizationState {
  currentPhase: PeriodizationPhase;
  phaseHistory: PeriodizationPhase[];
  nextTransition: Date;
  autoTransitions: boolean;
  customizations: Record<string, any>;
}


