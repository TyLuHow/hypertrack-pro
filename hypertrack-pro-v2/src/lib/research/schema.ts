export type EvidenceLevel = 'meta-analysis' | 'systematic-review' | 'rct' | 'observational';

export interface ResearchRelationship {
  targetId: string;
  type: 'supports' | 'contradicts' | 'refines' | 'builds-on' | 'compares-to';
  strength: number; // 0-1 confidence
  context: string;
}

export interface ResearchNode {
  id: string;
  type: 'study' | 'finding' | 'recommendation' | 'mechanism' | 'population';
  title: string;
  content: string;
  metadata: {
    authors: string[];
    journal: string;
    year: number;
    doi?: string;
    sampleSize?: number;
    duration?: string;
    evidenceLevel: EvidenceLevel;
    quality: number; // 1-10
  };
  relationships: ResearchRelationship[];
  applications: string[];
  citations: number;
  lastUpdated: Date;
}

export interface ResearchQuery {
  topic: string;
  evidenceLevel?: EvidenceLevel[];
  yearRange?: [number, number];
  populationType?: string[];
  outcomeType?: string[];
}

export interface ResearchEvidence {
  id: string;
  title: string;
  summary: string;
  evidenceLevel: EvidenceLevel;
  quality: number;
  year: number;
  doi?: string;
  weight: number; // 0-1 relevance * quality
}

export interface ResearchGraph {
  nodes: Map<string, ResearchNode>;
  index: Map<string, Set<string>>; // topic -> nodeIds
}


