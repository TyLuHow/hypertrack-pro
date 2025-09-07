import React from 'react';

export function ResearchModal({ isOpen, onClose, researchBasis }: { isOpen: boolean; onClose: () => void; researchBasis: Array<any> }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Research Evidence</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="space-y-4">
            {(researchBasis || []).map((evidence: any, idx: number) => (
              <ResearchEvidenceCard key={idx} evidence={evidence} />
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Evidence quality ranges from meta-analyses (highest) to individual studies. Recommendations include confidence and known limitations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchEvidenceCard({ evidence }: { evidence: any }) {
  const level = (evidence?.evidenceLevel || '').toString();
  const color = level === 'meta-analysis' ? 'bg-green-100 text-green-800' : level === 'systematic-review' ? 'bg-blue-100 text-blue-800' : level === 'rct' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900">{evidence?.title || 'Study'}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{(evidence?.evidenceLevel || '').toString().replace('-', ' ')}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{evidence?.summary || evidence?.content || ''}</p>
      <div className="flex items-center text-xs text-gray-500 space-x-4">
        {evidence?.year && <span>{evidence.year}</span>}
        {evidence?.doi && <span>{evidence.doi}</span>}
      </div>
    </div>
  );
}


