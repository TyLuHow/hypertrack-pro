import { ResearchEvidence, ResearchGraph, ResearchQuery } from '../../../lib/research/schema';
import { ResearchQueryEngine } from '../../../lib/research/queryEngine';

let engine: ResearchQueryEngine | null = null;
export function initResearchEngine(graph: ResearchGraph) { engine = new ResearchQueryEngine(graph); }

export function getResearchBackedVolumeTarget(
  muscleGroup: string,
  experience: string,
  currentPhase: string
): {
  min: number;
  optimal: number;
  max: number;
  evidence: ResearchEvidence[];
  confidence: number;
} {
  const query: ResearchQuery = {
    topic: `volume ${muscleGroup} ${experience}`,
    evidenceLevel: ['meta-analysis', 'systematic-review', 'rct'],
    yearRange: [2015, 2025]
  };
  const ev = engine ? engine.query(query) : [];
  // Fallback to defaults if no graph initialized
  const defaults: Record<string, { min: number; optimal: number; max: number }> = {
    chest: { min: 10, optimal: 16, max: 22 },
    back: { min: 10, optimal: 16, max: 24 },
    legs: { min: 12, optimal: 18, max: 26 },
    shoulders: { min: 8, optimal: 14, max: 20 },
    arms: { min: 6, optimal: 12, max: 18 },
    core: { min: 6, optimal: 10, max: 16 }
  };
  const key = (muscleGroup || '').toLowerCase();
  const base = defaults[key] || { min: 10, optimal: 16, max: 22 };
  // Phase adjustments
  const phaseAdj = currentPhase === 'strength' ? -2 : currentPhase === 'hypertrophy' ? +0 : -4;
  return {
    min: Math.max(4, base.min + phaseAdj),
    optimal: Math.max(6, base.optimal + phaseAdj),
    max: Math.max(10, base.max + phaseAdj),
    evidence: ev,
    confidence: ev.length ? Math.min(1, ev[0].weight) : 0.5
  };
}

export function getResearchBackedProgressionRate(
  exerciseType: string,
  experience: string,
  currentPerformance: number[]
): {
  recommendedIncrease: number;
  timeframe: string;
  evidence: ResearchEvidence[];
  plateauRisk: number;
} {
  const query: ResearchQuery = { topic: `progression ${exerciseType} ${experience}`, evidenceLevel: ['meta-analysis', 'rct'], yearRange: [2015, 2025] };
  const ev = engine ? engine.query(query) : [];
  // Defaults based on experience
  const baseRate = experience === 'novice' ? 0.05 : experience === 'intermediate' ? 0.025 : 0.01; // per week
  const slope = estimateSeriesSlope(currentPerformance);
  const plateauRisk = Math.max(0, Math.min(1, 0.5 - slope));
  return { recommendedIncrease: baseRate, timeframe: 'weekly', evidence: ev, plateauRisk };
}

function estimateSeriesSlope(series: number[]): number {
  if (!series || series.length < 2) return 0;
  const n = series.length;
  const x = Array.from({ length: n }, (_, i) => i + 1);
  const sumX = x.reduce((a,b)=>a+b,0);
  const sumY = series.reduce((a,b)=>a+b,0);
  const sumXY = series.reduce((acc, y, i) => acc + x[i]*y, 0);
  const sumXX = x.reduce((acc, v) => acc + v*v, 0);
  const denom = n*sumXX - sumX*sumX;
  if (!denom) return 0;
  const slope = (n*sumXY - sumX*sumY) / denom;
  const avg = sumY / n;
  return avg === 0 ? 0 : (slope / avg);
}


