import { ResearchEvidence, ResearchGraph, ResearchQuery } from './schema';

export class ResearchQueryEngine {
  constructor(private graph: ResearchGraph) {}

  query(params: ResearchQuery): ResearchEvidence[] {
    const ids = new Set<string>();
    const topicKey = params.topic.toLowerCase().split(' ')[0];
    const bucket = this.graph.index.get(topicKey);
    if (!bucket) return [];
    bucket.forEach((id) => ids.add(id));
    const out: ResearchEvidence[] = [];
    ids.forEach((id) => {
      const n = this.graph.nodes.get(id);
      if (!n) return;
      if (params.evidenceLevel && !params.evidenceLevel.includes(n.metadata.evidenceLevel)) return;
      if (params.yearRange && (n.metadata.year < params.yearRange[0] || n.metadata.year > params.yearRange[1])) return;
      out.push({
        id: n.id,
        title: n.title,
        summary: n.content.slice(0, 280),
        evidenceLevel: n.metadata.evidenceLevel,
        quality: n.metadata.quality,
        year: n.metadata.year,
        doi: n.metadata.doi,
        weight: Math.min(1, (n.metadata.quality / 10) * (1 + n.citations / 100))
      });
    });
    return out.sort((a, b) => b.weight - a.weight).slice(0, 20);
  }

  synthesizeRecommendation(evidence: ResearchEvidence[]): { recommendation: string; strength: number; citations: ResearchEvidence[] } {
    const top = evidence.slice(0, 5);
    const strength = Math.min(1, top.reduce((a, e) => a + e.weight, 0) / Math.max(1, top.length));
    return { recommendation: 'Synthesized recommendation', strength, citations: top };
  }

  validateRecommendation(_recommendation: any): { isSupported: boolean; confidence: number } {
    // Placeholder: score based on overlap of claimed topics vs available evidence
    return { isSupported: true, confidence: 0.7 };
  }
}


