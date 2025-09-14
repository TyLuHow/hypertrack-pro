import { ResearchGraph, ResearchNode } from './schema';

type NumericalFinding = {
  value: number;
  value2?: number;
  unit?: string;
  context: string;
  fullText: string;
  category: string;
  population?: string;
  studySource?: string;
  confidence?: number;
};

export function extractResearchFindings(researchReports: string[]): ResearchNode[] {
  const extractedNodes: ResearchNode[] = [];
  researchReports.forEach((report, reportIndex) => {
    // Exhaustive generic extraction
    const numericalFindings = extractNumericalData(report);
    numericalFindings.forEach((finding, idx) => {
      extractedNodes.push(createResearchNode({
        id: `num_${reportIndex}_${idx}_${Math.random().toString(36).slice(2)}`,
        type: 'finding',
        title: finding.context,
        content: finding.fullText,
        value: finding.value,
        unit: finding.unit,
        category: finding.category,
        population: finding.population,
        studySource: finding.studySource,
        confidence: finding.confidence || 0.8
      }));
    });

    // Topic-specific comprehensive extraction
    const lower = report.toLowerCase();
    if (isHRVResearch(lower)) extractedNodes.push(...extractComprehensiveHRVData(report));
    if (isEMGResearch(lower)) extractedNodes.push(...extractComprehensiveEMGData(report));
    if (isPeriodizationResearch(lower)) extractedNodes.push(...extractComprehensivePeriodizationData(report));
    if (isVolumeResearch(lower)) extractedNodes.push(...extractComprehensiveVolumeData(report));
    if (isProgressionResearch(lower)) extractedNodes.push(...extractComprehensiveProgressionData(report));
    if (isRestIntervalResearch(lower)) extractedNodes.push(...extractComprehensiveRestData(report));
    if (isFrequencyResearch(lower)) extractedNodes.push(...extractComprehensiveFrequencyData(report));
    if (isExerciseOrderResearch(lower)) extractedNodes.push(...extractComprehensiveOrderData(report));
  });
  return extractedNodes;
}

export function buildResearchGraph(nodes: ResearchNode[]): ResearchGraph {
  const graph: ResearchGraph = { nodes: new Map(), index: new Map() };
  for (const n of nodes) {
    graph.nodes.set(n.id, n);
    const topics = inferTopics(n);
    for (const t of topics) {
      if (!graph.index.has(t)) graph.index.set(t, new Set());
      graph.index.get(t)!.add(n.id);
    }
  }
  return graph;
}

// --- Comprehensive extraction helpers ---

function extractNumericalData(text: string): NumericalFinding[] {
  const patterns: RegExp[] = [
    /(\d+)-(\d+)?\s*sets?\s*per\s*week\s*per\s*muscle/gi,
    /(\d+)-(\d+)?\s*weekly\s*sets/gi,
    /minimum\s*effective\s*volume\s*[:-]?\s*(\d+)/gi,
    /maximum\s*adaptive\s*volume\s*[:-]?\s*(\d+)/gi,
    /maximum\s*recoverable\s*volume\s*[:-]?\s*(\d+)/gi,
    /(\d+\.?\d*)%\s*(weekly|per\s*week|progression|increase)/gi,
    /(\d+\.?\d*)%\s*(load|weight)\s*increase/gi,
    /double\s*progression.*?(\d+)-(\d+)\s*reps/gi,
    /(\d+)-(\d+)?\s*minutes?\s*rest/gi,
    /rest\s*periods?\s*[:-]?\s*(\d+)-(\d+)?\s*minutes?/gi,
    /inter-?set\s*rest\s*[:-]?\s*(\d+)-(\d+)?\s*(seconds?|minutes?)/gi,
    /hrv\s*threshold\s*[:-]?\s*(\d+\.?\d*)/gi,
    /(\d+\.?\d*)%\s*hrv\s*(reduction|suppression|decline)/gi,
    /readiness\s*score\s*[:-]?\s*(\d+)-(\d+)?/gi,
    /(\d+\.?\d*)%\s*(mvc|muscle\s*activation|emg)/gi,
    /emg\s*activation\s*[:-]?\s*(\d+\.?\d*)%/gi,
    /(effect\s*size|es|smd|cohen's\s*d)\s*[=:~]\s*(\d+\.?\d*)/gi,
    /(\d+\.?\d*)\s*(effect\s*size|es|smd)/gi,
    /(\d+)x?\s*per\s*week/gi,
    /(\d+)\s*times?\s*per\s*week/gi,
    /training\s*frequency\s*[:-]?\s*(\d+)/gi,
    /(\d+)-(\d+)\s*reps?\s*(per\s*set|range)/gi,
    /rep\s*range\s*[:-]?\s*(\d+)-(\d+)/gi,
    /plateau\s*after\s*(\d+)\s*(weeks?|sessions?)/gi,
    /(\d+)-(\d+)\s*(sessions?|workouts?)\s*without\s*progress/gi,
    /(\d+\.?\d*)%\s*confidence\s*interval/gi,
    /ci\s*[:-]?\s*(\d+\.?\d*)-(\d+\.?\d*)/gi,
    /(\d+)-(\d+)?\s*weeks?\s*(phase|block|cycle)/gi,
    /deload\s*[:-]?\s*(\d+)\s*week/gi
  ];
  const findings: NumericalFinding[] = [];
  const sentences = text.split(/[.!?]+/);
  sentences.forEach((sentence) => {
    patterns.forEach((pattern) => {
      const matches = Array.from(sentence.matchAll(pattern));
      for (const match of matches) {
        findings.push({
          value: parseFloat(match[1]),
          value2: match[2] ? parseFloat(match[2]) : undefined,
          unit: extractUnit(match[0]),
          context: sentence.trim(),
          fullText: sentence.trim(),
          category: categorizeFromPattern(pattern),
          studySource: undefined,
          confidence: 0.8
        });
      }
    });
  });
  return findings;
}

// Topic gates
function isHRVResearch(t: string) { return t.includes('hrv') || t.includes('heart rate variability'); }
function isEMGResearch(t: string) { return t.includes('emg') || t.includes('activation'); }
function isPeriodizationResearch(t: string) { return t.includes('periodization') || t.includes('block') || t.includes('undulating'); }
function isVolumeResearch(t: string) { return t.includes('sets per week') || t.includes('weekly sets') || t.includes('volume'); }
function isProgressionResearch(t: string) { return t.includes('progress') || t.includes('overload') || t.includes('plateau'); }
function isRestIntervalResearch(t: string) { return t.includes('rest'); }
function isFrequencyResearch(t: string) { return t.includes('frequency'); }
function isExerciseOrderResearch(t: string) { return t.includes('order'); }

// Category-specific comprehensive extractors (stubs expanded incrementally)
function extractComprehensiveHRVData(_report: string): ResearchNode[] { return []; }
function extractComprehensiveEMGData(_report: string): ResearchNode[] { return []; }
function extractComprehensivePeriodizationData(_report: string): ResearchNode[] { return []; }
function extractComprehensiveVolumeData(_report: string): ResearchNode[] { return []; }
function extractComprehensiveProgressionData(_report: string): ResearchNode[] { return []; }
function extractComprehensiveRestData(_report: string): ResearchNode[] { return []; }
function extractComprehensiveFrequencyData(_report: string): ResearchNode[] { return []; }
function extractComprehensiveOrderData(_report: string): ResearchNode[] { return []; }

// Utilities for node creation and indexing
function createResearchNode(args: { id?: string; type: ResearchNode['type']; title: string; content: string; value?: number; unit?: string; category?: string; population?: string; studySource?: string; confidence?: number; }): ResearchNode {
  return {
    id: args.id || `node_${Math.random().toString(36).slice(2)}`,
    type: args.type,
    title: args.title,
    content: args.content,
    metadata: { authors: [], journal: 'Synthesis', year: new Date().getFullYear(), evidenceLevel: 'observational', quality: 6 },
    relationships: [],
    applications: args.category ? [args.category] : [],
    citations: 0,
    lastUpdated: new Date()
  };
}

function extractUnit(snippet: string): string | undefined {
  const s = snippet.toLowerCase();
  if (s.includes('%')) return '%';
  if (s.includes('set')) return 'sets/week';
  if (s.includes('minute')) return 'min';
  if (s.includes('second')) return 's';
  if (s.includes('week')) return 'weeks';
  if (s.includes('rep')) return 'reps';
  return undefined;
}

function categorizeFromPattern(pattern: RegExp): string {
  const p = pattern.source;
  if (p.includes('sets') || p.includes('volume')) return 'volume';
  if (p.includes('progress') || p.includes('increase')) return 'progression';
  if (p.includes('rest')) return 'rest';
  if (p.includes('hrv')) return 'hrv';
  if (p.includes('emg') || p.includes('activation')) return 'emg';
  if (p.includes('frequency')) return 'frequency';
  if (p.includes('rep')) return 'rep-range';
  if (p.includes('plateau')) return 'plateau';
  if (p.includes('confidence') || p.includes('ci')) return 'statistics';
  if (p.includes('weeks')) return 'periodization';
  return 'general';
}

function inferTopics(n: ResearchNode): string[] {
  const topics: string[] = [];
  const text = `${n.title} ${n.content}`.toLowerCase();
  if (text.includes('volume')) topics.push('volume');
  if (text.includes('periodization')) topics.push('periodization');
  if (text.includes('hrv')) topics.push('hrv');
  if (text.includes('emg')) topics.push('emg');
  if (text.includes('progress')) topics.push('progression');
  if (text.includes('rest')) topics.push('rest');
  if (text.includes('frequency')) topics.push('frequency');
  if (text.includes('order')) topics.push('order');
  return topics;
}


