import { ResearchGraph, ResearchNode } from './schema';

export function extractResearchFindings(researchReports: string[]): ResearchNode[] {
  // Placeholder: in production, parse PDFs/markdown and extract entities.
  // For now, return an empty set to be populated later.
  void researchReports;
  return [];
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

function inferTopics(n: ResearchNode): string[] {
  const topics: string[] = [];
  const text = `${n.title} ${n.content}`.toLowerCase();
  if (text.includes('volume')) topics.push('volume');
  if (text.includes('periodization')) topics.push('periodization');
  if (text.includes('hrv')) topics.push('hrv');
  if (text.includes('emg')) topics.push('emg');
  if (text.includes('progression')) topics.push('progression');
  return topics;
}


