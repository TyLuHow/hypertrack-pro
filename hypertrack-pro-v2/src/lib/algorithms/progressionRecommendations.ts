export interface SetData {
  weight: number;
  reps: number;
}

export interface ProgressionRecommendation {
  recommendedWeight: number;
  recommendedReps: number;
  recommendedSets: number;
  rationale: string;
  confidence: number; // 0-1
  researchBasis: string;
}

export interface ExerciseHistory {
  exerciseName: string;
  lastPerformed: Date;
  recentSets: SetData[];
  bestPerformance: {
    maxWeight: number;
    maxVolume: number;
    maxReps: number;
  };
  progressionTrend: number;
}

export class ExerciseProgressionCalculator {
  calculateProgression(exercise: ExerciseHistory, exerciseType: 'compound' | 'isolation'): ProgressionRecommendation {
    const daysSinceLastSession = this.getDaysSince(exercise.lastPerformed);
    const lastBestSet = this.getBestRecentSet(exercise.recentSets);

    const progressionRate = exerciseType === 'compound' ? 0.0035 : 0.005;
    const minRepsThreshold = exerciseType === 'compound' ? 10 : 12;
    const shouldProgress = lastBestSet.reps >= minRepsThreshold;

    let recommendedWeight = lastBestSet.weight;
    const recommendedReps = exerciseType === 'compound' ? 8 : 10;
    if (shouldProgress) {
      const weeklyProgression = 1 + progressionRate;
      const timeAdjustment = Math.min(daysSinceLastSession / 7, 2);
      recommendedWeight = Math.round((lastBestSet.weight * Math.pow(weeklyProgression, timeAdjustment)) / 2.5) * 2.5;
    }

    const recommendedSets = this.calculateOptimalSets(exerciseType, exercise.progressionTrend);

    return {
      recommendedWeight,
      recommendedReps,
      recommendedSets,
      rationale: this.generateRationale(shouldProgress, daysSinceLastSession, exerciseType),
      confidence: this.calculateConfidence(exercise.recentSets.length, daysSinceLastSession),
      researchBasis: this.getResearchBasis(exerciseType),
    };
  }

  private calculateOptimalSets(exerciseType: string, trend: number): number {
    const baseSets = exerciseType === 'compound' ? 3 : 3;
    if (trend < -0.05) return baseSets + 1;
    if (trend > 0.1) return baseSets;
    return baseSets;
  }

  private getResearchBasis(exerciseType: string): string {
    return exerciseType === 'compound'
      ? 'Based on Schoenfeld et al. (2017) - compound movements benefit from moderate volume with progressive overload'
      : 'Based on Schoenfeld et al. (2016) - isolation exercises respond well to higher volume and frequency';
  }

  private generateRationale(shouldProgress: boolean, daysSince: number, exerciseType: string): string {
    if (!shouldProgress) {
      return `Focus on rep quality - aim to exceed ${exerciseType === 'compound' ? 10 : 12} reps before increasing weight`;
    }
    if (daysSince <= 3) return 'Recent session - maintaining current progression rate';
    if (daysSince <= 7) return 'Standard weekly progression - small weight increase recommended';
    return `${Math.floor(daysSince / 7)} weeks since last session - moderate progression adjustment`;
  }

  private calculateConfidence(sessionCount: number, daysSince: number): number {
    let confidence = 0.8;
    if (sessionCount < 3) confidence -= 0.3;
    if (sessionCount < 5) confidence -= 0.2;
    if (daysSince > 14) confidence -= 0.2;
    if (daysSince > 21) confidence -= 0.3;
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private getBestRecentSet(sets: SetData[]): SetData {
    return sets.reduce((best, current) => {
      const currentVolume = current.weight * current.reps;
      const bestVolume = best.weight * best.reps;
      return currentVolume > bestVolume ? current : best;
    });
  }

  private getDaysSince(date: Date): number {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}


