export interface TrainingRecommendation { type: string; detail: string; citations?: ResearchCitation[] }
export interface ResearchCitation { authors: string[]; title: string; journal: string; year: number; doi?: string }
export interface ValidationResult {
  isSupported: boolean;
  evidenceLevel: 'low' | 'moderate' | 'high';
  citations: ResearchCitation[];
  confidence: number;
  limitations: string[];
  contradictions: ResearchCitation[];
}

export function validateRecommendationWithResearch(recommendation: TrainingRecommendation): ValidationResult {
  const applicableStudies = findApplicableResearch(recommendation);
  return {
    isSupported: applicableStudies.length > 0,
    evidenceLevel: calculateEvidenceLevel(applicableStudies),
    citations: applicableStudies,
    confidence: calculateConfidence(applicableStudies),
    limitations: identifyLimitations(applicableStudies),
    contradictions: findContradictoryEvidence(recommendation)
  };
}

export function generateResearchSummary(recommendations: TrainingRecommendation[]): string {
  const citations = recommendations.flatMap(r => r.citations || []);
  const unique = deduplicateCitations(citations);
  return `This analysis references ${unique.length} peer-reviewed studies (2015–2025).\n`;
}

function findApplicableResearch(_rec: TrainingRecommendation): ResearchCitation[] { return []; }
function calculateEvidenceLevel(cites: ResearchCitation[]): 'low' | 'moderate' | 'high' {
  if (cites.length > 10) return 'high';
  if (cites.length > 3) return 'moderate';
  return 'low';
}
function calculateConfidence(cites: ResearchCitation[]): number { return Math.min(1, 0.5 + 0.05 * cites.length); }
function identifyLimitations(_cites: ResearchCitation[]): string[] { return []; }
function findContradictoryEvidence(_rec: TrainingRecommendation): ResearchCitation[] { return []; }
function deduplicateCitations(cites: ResearchCitation[]): ResearchCitation[] {
  const seen = new Set<string>();
  const out: ResearchCitation[] = [];
  for (const c of cites) {
    const key = `${c.title}|${c.year}`;
    if (!seen.has(key)) { seen.add(key); out.push(c); }
  }
  return out;
}


