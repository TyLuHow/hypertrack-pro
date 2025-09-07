import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeeklyVolumeSeries, getWeeklyWorkoutFrequency } from '../../lib/supabase/queries';

export interface RecoveryMetrics {
  volumeLoad: number;
  frequencyTrend: number;
  progressionRate: number;
  readinessScore: number; // 1-10
  recommendation: 'proceed' | 'reduce' | 'deload';
}

function calcTrend(values: number[]): number {
  if (!values || values.length < 2) return 0;
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((acc, y, i) => acc + x[i] * y, 0);
  const sumXX = x.reduce((acc, v) => acc + v * v, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const avg = sumY / n;
  return avg === 0 ? 0 : (slope / avg) * 100; // % per step
}

export function useRecoveryReadiness() {
  const { data: weeklyVolume } = useQuery({ queryKey: ['weekly-volume-readiness'], queryFn: () => getWeeklyVolumeSeries(8) });
  const { data: weeklyFreq } = useQuery({ queryKey: ['weekly-frequency-readiness'], queryFn: () => getWeeklyWorkoutFrequency(8) });

  const metrics: RecoveryMetrics | undefined = useMemo(() => {
    if (!weeklyVolume || !weeklyFreq) return undefined;
    const vols = weeklyVolume.map(w => w.volume);
    const freq = weeklyFreq.map(f => f.count);
    const last4 = vols.slice(-4);
    const progressionRate = calcTrend(last4);
    // Exponentially decayed load as fatigue proxy
    const fatigueAccumulation = vols.reduce((acc, v, i) => acc + v * Math.pow(0.7, vols.length - i), 0);
    const frequencyTrend = calcTrend(freq);
    // Simple readiness: 10 minus scaled fatigue and negative plateaus (bounded)
    const raw = 10 - (fatigueAccumulation / 10000) - Math.max(0, -progressionRate) / 5;
    const readinessScore = Math.max(1, Math.min(10, Math.round(raw)));
    const recommendation: RecoveryMetrics['recommendation'] = readinessScore < 4 ? 'deload' : readinessScore < 6 ? 'reduce' : 'proceed';
    return {
      volumeLoad: Math.round(fatigueAccumulation),
      frequencyTrend,
      progressionRate,
      readinessScore,
      recommendation
    };
  }, [weeklyVolume, weeklyFreq]);

  return { readiness: metrics };
}


