export interface PlateauRiskFactors {
  progressionSlope: number;      // Performance trend (fraction per week)
  volumeProgression: number;     // Volume increase rate (fraction per week)
  frequencyVariability: number;  // Std dev of weekly sessions normalized (0-1)
  recoveryDebt: number;          // 0-1 fatigue proxy
  timeInPhase: number;           // weeks in current phase scaled 0-1 to 8 weeks
}

export interface ExercisePerformanceData { name: string; data: Array<{ ts: number; value: number }>; currentMax: number };
export interface VolumeData { weeks: Array<{ week: string; volume: number; sessions: number }> };
export interface RecoveryMetrics { readinessScore: number; volumeLoad: number; progressionRate: number };

function slopePercentPerWeek(points: Array<{ ts: number; value: number }>): number {
  if (!points || points.length < 2) return 0;
  const xs = points.map(p => p.ts);
  const ys = points.map(p => p.value);
  const n = xs.length;
  const meanX = xs.reduce((a,b)=>a+b,0)/n;
  const meanY = ys.reduce((a,b)=>a+b,0)/n;
  const num = xs.reduce((acc, x, i) => acc + (x-meanX)*(ys[i]-meanY), 0);
  const den = xs.reduce((acc, x) => acc + (x-meanX)*(x-meanX), 0);
  if (den === 0 || meanY === 0) return 0;
  const slopePerMs = num / den;
  const weekly = slopePerMs * 7 * 86400000;
  return weekly / meanY; // fraction per week
}

function std(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = values.reduce((a,b)=>a+b,0)/values.length;
  const v = values.reduce((a,b)=>a+(b-m)*(b-m),0)/(values.length-1);
  return Math.sqrt(v);
}

function analyzeRiskFactors(exerciseData: ExercisePerformanceData[], volumeData: VolumeData[], recoveryData: RecoveryMetrics): PlateauRiskFactors {
  const perf = exerciseData?.[0];
  const slope = slopePercentPerWeek(perf?.data || []);
  const vd = volumeData?.[0];
  const vols = (vd?.weeks || []).map(w => w.volume);
  const volSlope = slopePercentPerWeek((vd?.weeks || []).map((w, i) => ({ ts: i * 7 * 86400000, value: w.volume })));
  const sessions = (vd?.weeks || []).map(w => w.sessions);
  const freqVar = Math.min(1, std(sessions) / Math.max(1, (sessions.reduce((a,b)=>a+b,0)/(sessions.length||1))));
  const recoveryDebt = Math.min(1, Math.max(0, (10000 - (recoveryData?.readinessScore || 6) * 1000) / 10000));
  const timeInPhase = 0.5; // placeholder; wire from periodization if available
  return {
    progressionSlope: slope,
    volumeProgression: volSlope,
    frequencyVariability: freqVar,
    recoveryDebt,
    timeInPhase
  };
}

function calculateConfidence(f: PlateauRiskFactors): number {
  const signals = [Math.abs(f.progressionSlope), Math.abs(f.volumeProgression)];
  const dataStrength = Math.min(1, signals.reduce((a,b)=>a+b,0));
  return 0.5 + 0.5 * dataStrength; // 0.5-1.0
}

function identifyPrimaryFactors(f: PlateauRiskFactors, weights: Record<keyof PlateauRiskFactors, number>): string[] {
  const entries = (Object.keys(weights) as Array<keyof PlateauRiskFactors>).map(k => ({ k, score: Math.abs((f as any)[k]) * weights[k] }));
  return entries.sort((a,b)=>b.score-a.score).slice(0,3).map(e => String(e.k));
}

function selectOptimalIntervention(f: PlateauRiskFactors): 'deload' | 'variation' | 'volume' | 'technique' {
  if (f.recoveryDebt > 0.6) return 'deload';
  if (f.progressionSlope < 0.01 && f.volumeProgression <= 0) return 'volume';
  if (f.progressionSlope < 0.005) return 'variation';
  return 'technique';
}

function estimateInterventionTiming(riskScore: number): number {
  if (riskScore > 0.8) return 1;
  if (riskScore > 0.6) return 2;
  if (riskScore > 0.4) return 4;
  return 8;
}

export function calculatePlateauRisk(
  exerciseData: ExercisePerformanceData[],
  volumeData: VolumeData[],
  recoveryData: RecoveryMetrics
): {
  riskScore: number;
  confidence: number;
  primaryFactors: string[];
  timeToIntervention: number; // weeks
  interventionType: 'deload' | 'variation' | 'volume' | 'technique';
} {
  const factors = analyzeRiskFactors(exerciseData, volumeData, recoveryData);
  const weights: Record<keyof PlateauRiskFactors, number> = {
    progressionSlope: 0.35,
    volumeProgression: 0.25,
    recoveryDebt: 0.20,
    frequencyVariability: 0.15,
    timeInPhase: 0.05
  };
  const score = (Object.keys(weights) as Array<keyof PlateauRiskFactors>).reduce((acc, k) => {
    const val = (factors as any)[k] as number;
    // normalize: positive slope reduces risk, negatives increase; flip sign accordingly
    const normalized = k === 'progressionSlope' || k === 'volumeProgression' ? -val : val;
    return acc + normalized * weights[k];
  }, 0.5); // start from 0.5 baseline

  const riskScore = Math.min(1, Math.max(0, score));
  return {
    riskScore,
    confidence: calculateConfidence(factors),
    primaryFactors: identifyPrimaryFactors(factors, weights),
    timeToIntervention: estimateInterventionTiming(riskScore),
    interventionType: selectOptimalIntervention(factors)
  };
}


