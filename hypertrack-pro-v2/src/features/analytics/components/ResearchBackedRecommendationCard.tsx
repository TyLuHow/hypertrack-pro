import React from 'react';

export function EvidenceStrengthBadge({ level }: { level: number }) {
  const label = level > 0.75 ? 'High' : level > 0.5 ? 'Moderate' : 'Low';
  const color = level > 0.75 ? 'bg-emerald-600' : level > 0.5 ? 'bg-yellow-600' : 'bg-slate-600';
  return <span className={`px-2 py-0.5 text-xs rounded ${color} text-white`}>{label}</span>;
}

export function ConfidenceIndicator({ score }: { score: number }) {
  return <div className="text-xs text-slate-300">Confidence: {Math.round(score * 100)}%</div>;
}

export function ResearchBackedRecommendationCard({ recommendation }: { recommendation: { title: string; description: string; confidence: number; researchBasis: Array<{ title: string; year: number }> } }) {
  const evidence = recommendation.researchBasis || [];
  const strength = Math.min(1, evidence.length / 10);
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{recommendation.title}</h3>
          <p className="text-slate-300 mt-1">{recommendation.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-300">Evidence Strength:</span>
            <EvidenceStrengthBadge level={strength} />
            <button className="text-xs text-blue-300 hover:underline" onClick={() => alert(evidence.map(e => `${e.title} (${e.year})`).join('\n'))}>View {evidence.length} supporting studies</button>
          </div>
        </div>
        <ConfidenceIndicator score={recommendation.confidence} />
      </div>
    </div>
  );
}


