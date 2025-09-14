import { extractResearchFindings, buildResearchGraph } from './extractor';
import type { ResearchGraph } from './schema';

let globalGraph: ResearchGraph | null = null;

export async function initializeResearchGraph(): Promise<void> {
  try {
    const reports = await loadResearchReports();
    const nodes = extractResearchFindings(reports);
    const graph = buildResearchGraph(nodes);
    await storeResearchGraph(graph);
    // eslint-disable-next-line no-console
    console.log(`Research graph initialized with ${nodes.length} findings`);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize research graph:', e);
    await initializeFallbackResearch();
  }
}

async function loadResearchReports(): Promise<string[]> {
  // Placeholder: load embedded text snippets or local files
  try {
    const localFacts = await import('../../data/researchFacts');
    const texts: string[] = (localFacts as any).researchFacts?.map((f: any) => {
      const cite = f?.citation || {};
      return `${f.text} [${cite.authors || ''}, ${cite.year || ''}, ${cite.journal || ''}]`;
    }) || [];
    if (texts.length > 0) return texts;
  } catch {
    // ignore, fall back below
  }
  return [
    'Heart Rate Variability (HRV) readiness threshold ~0.5 SD lnRMSSD; recovery 24–72 hours; 7-day rolling average',
    'EMG activation: Bench press high pec EMG; Hip thrust very high glute activation; Pull-ups, Rows top for lats',
    'Periodization: Undulating strong for trained; block useful for advanced peaking; hypertrophy ~6 weeks, strength ~4 weeks',
    'Volume: 10–20 sets per week yields optimal hypertrophy; diminishing returns beyond 20',
    'Progressive overload: Novice 5–10% weekly, intermediate 2–5% per cycle; advanced 1%/month; watch for plateaus'
  ];
}

async function storeResearchGraph(graph: ResearchGraph): Promise<void> {
  globalGraph = graph;
}

async function initializeFallbackResearch(): Promise<void> {
  globalGraph = buildResearchGraph([]);
}

export function getResearchGraph(): ResearchGraph | null { return globalGraph; }


