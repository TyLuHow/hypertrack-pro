// Progress analytics utilities (client-side), preserving legacy math where specified
import { detectPlateau as legacyDetectPlateau, WorkoutExerciseSession } from '../algorithms/plateau';

export interface ProgressMetrics {
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number;
  avgDuration: number;
  weeklyTrend: number;
  monthlyTrend: number;
}

export interface ExerciseProgress {
  exerciseName: string;
  maxWeight: number;
  maxVolume: number;
  weightTrend: number;
  volumeTrend: number;
  plateauRisk: boolean;
  lastPR: Date | null;
  sessionsCount: number;
}

export interface PlateauAnalysis {
  isPlateau: boolean;
  confidence: number;
  slopeValue?: number;
  recommendDeload?: boolean;
}

export interface VolumeProgression {
  weeklyTrend: number;
  monthlyTrend: number;
  currentWeekVolume: number;
  averageWeeklyVolume: number;
}

export interface WorkoutSession {
  date: string; // ISO
  maxWeight: number;
  totalVolume: number;
}

export class ProgressAnalyzer {
  detectPlateau(sessions: WorkoutSession[]): PlateauAnalysis {
    if (sessions.length < 6) return { isPlateau: false, confidence: 0 };

    const recentSessions = sessions.slice(0, 6);
    const weights = recentSessions.map((s) => s.maxWeight);

    const n = weights.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = weights.reduce((a, b) => a + b, 0);
    const sumXY = weights.reduce((acc, y, i) => acc + (i + 1) * y, 0);
    const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;

    const denom = n * sumXX - sumX * sumX;
    const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    const isPlateau = Math.abs(slope) < 0.005;

    return {
      isPlateau,
      confidence: isPlateau ? 0.8 : 0.2,
      slopeValue: slope,
      recommendDeload: isPlateau && recentSessions.length >= 6,
    };
  }

  calculateVolumeProgression(workouts: WorkoutSession[]): VolumeProgression {
    const weeklyVolumes = this.groupByWeek(workouts);
    const monthlyVolumes = this.groupByMonth(workouts);

    return {
      weeklyTrend: this.calculateTrend(weeklyVolumes),
      monthlyTrend: this.calculateTrend(monthlyVolumes),
      currentWeekVolume: weeklyVolumes[0] || 0,
      averageWeeklyVolume:
        weeklyVolumes.length === 0
          ? 0
          : weeklyVolumes.reduce((a, b) => a + b, 0) / weeklyVolumes.length,
    };
  }

  private groupByWeek(workouts: WorkoutSession[]): number[] {
    const map = new Map<string, number>();
    for (const w of workouts) {
      const d = new Date(w.date);
      const year = d.getUTCFullYear();
      const week = this.getWeekNumber(d);
      const key = `${year}-W${week}`;
      map.set(key, (map.get(key) || 0) + (w.totalVolume || 0));
    }
    // Sort recent first
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([, v]) => v);
  }

  private groupByMonth(workouts: WorkoutSession[]): number[] {
    const map = new Map<string, number>();
    for (const w of workouts) {
      const d = new Date(w.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + (w.totalVolume || 0));
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([, v]) => v);
  }

  private calculateTrend(series: number[]): number {
    if (!series || series.length < 2) return 0;
    const n = series.length;
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = series.reduce((a, b) => a + b, 0);
    const sumXY = series.reduce((acc, y, i) => acc + x[i] * y, 0);
    const sumXX = x.reduce((acc, v) => acc + v * v, 0);
    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) return 0;
    const slope = (n * sumXY - sumX * sumY) / denom;
    // Return percent slope relative to average for readability
    const avg = sumY / n;
    return avg === 0 ? 0 : (slope / avg) * 100;
  }

  private getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    // Thursday in current week decides the year.
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
  }
}


