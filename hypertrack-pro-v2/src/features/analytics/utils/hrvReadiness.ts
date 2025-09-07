import { ResearchEvidence, ResearchQuery } from '../../../lib/research/schema';
import { ResearchQueryEngine } from '../../../lib/research/queryEngine';

export interface HRVReadinessResult {
  readinessScore: number; // 1-10
  recommendation: 'proceed' | 'reduce' | 'deload';
  reasoning: string;
  researchBasis: ResearchEvidence[];
  adjustments: {
    volumeModifier: number; // 0.5-1.2
    intensityModifier: number; // 0.6-1.1
    restDayRecommended: boolean;
  };
}

let engine: ResearchQueryEngine | null = null;
export function setHRVReadinessResearchEngine(e: ResearchQueryEngine) { engine = e; }

export function calculateHRVBasedReadiness(
  weeklyVolumeData: number[],
  frequencyData: number[],
  subjectiveMetrics?: {
    sleepQuality: number; // 1-10
    stressLevel: number; // 1-10
    motivation: number; // 1-10
    soreness: number; // 1-10
  }
): HRVReadinessResult {
  const query: ResearchQuery = {
    topic: 'HRV readiness',
    evidenceLevel: ['meta-analysis', 'systematic-review', 'rct'],
    yearRange: [2015, 2025]
  };
  const hrvResearch = engine ? engine.query(query) : [];

  const volumeLoad = calculateVolumeLoad(weeklyVolumeData);
  const frequencyStress = calculateFrequencyStress(frequencyData);
  const simulatedHRV = simulateHRVFromTrainingLoad(volumeLoad, frequencyStress, subjectiveMetrics);
  const readinessScore = interpretHRVReadiness(simulatedHRV, hrvResearch);

  return {
    readinessScore,
    recommendation: getTrainingRecommendation(readinessScore),
    reasoning: generateReadinessReasoning(readinessScore, volumeLoad, simulatedHRV),
    researchBasis: hrvResearch,
    adjustments: calculateTrainingAdjustments(readinessScore)
  };
}

function calculateVolumeLoad(weekly: number[]): number {
  const last4 = weekly.slice(-4);
  return last4.reduce((a, b, i) => a + b * (0.7 ** (last4.length - i)), 0);
}

function calculateFrequencyStress(freq: number[]): number {
  const avg = freq.length ? freq.reduce((a, b) => a + b, 0) / freq.length : 0;
  const varc = freq.length ? freq.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / freq.length : 0;
  return avg + Math.sqrt(varc);
}

function simulateHRVFromTrainingLoad(
  volumeLoad: number,
  frequencyStress: number,
  subjective?: { sleepQuality: number; stressLevel: number; motivation: number; soreness: number }
): number {
  const baseline = 50;
  const volSupp = Math.min(20, volumeLoad * 0.015);
  const freqSupp = Math.min(10, frequencyStress * 0.5);
  const subj = subjective
    ? (Math.max(0, 10 - subjective.sleepQuality) + subjective.stressLevel + Math.max(0, 10 - subjective.motivation) + subjective.soreness) * 0.4
    : 0;
  return Math.max(20, baseline - volSupp - freqSupp - subj);
}

function interpretHRVReadiness(simulated: number, _evidence: ResearchEvidence[]): number {
  // Map HRV proxy to 1-10 readiness using SWC-like windows
  if (simulated >= 48) return 9;
  if (simulated >= 45) return 8;
  if (simulated >= 42) return 7;
  if (simulated >= 38) return 6;
  if (simulated >= 34) return 5;
  if (simulated >= 30) return 4;
  if (simulated >= 28) return 3;
  if (simulated >= 25) return 2;
  return 1;
}

function getTrainingRecommendation(score: number): 'proceed' | 'reduce' | 'deload' {
  if (score <= 3) return 'deload';
  if (score <= 5) return 'reduce';
  return 'proceed';
}

function generateReadinessReasoning(score: number, volumeLoad: number, hrvProxy: number): string {
  if (score <= 3) return `Low readiness (proxy HRV ${hrvProxy.toFixed(1)}). High accumulated load ${Math.round(volumeLoad)}. Deload recommended.`;
  if (score <= 5) return `Moderate readiness (proxy HRV ${hrvProxy.toFixed(1)}). Consider reducing volume.`;
  return `High readiness (proxy HRV ${hrvProxy.toFixed(1)}). Proceed with planned training.`;
}

function calculateTrainingAdjustments(score: number): { volumeModifier: number; intensityModifier: number; restDayRecommended: boolean } {
  if (score <= 3) return { volumeModifier: 0.6, intensityModifier: 0.7, restDayRecommended: true };
  if (score <= 5) return { volumeModifier: 0.8, intensityModifier: 0.9, restDayRecommended: false };
  return { volumeModifier: 1.0, intensityModifier: 1.0, restDayRecommended: false };
}


