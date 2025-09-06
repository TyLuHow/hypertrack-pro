import React, { useEffect, useMemo, useState } from 'react';
import { researchFacts } from '../../../data/researchFacts';

export const ResearchFactsBanner: React.FC = () => {
  const [idx, setIdx] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  const items = researchFacts;
  const current = items.length ? items[idx % items.length] : undefined;
  const text = useMemo(() => (current?.text || '').replace(/:contentReference\[[^\]]+\]\{[^}]+\}/g, ''), [current]);
  const source = current ? `${current.citation.authors}, ${current.citation.year} • ${current.citation.journal}` : '';

  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => i + 1), 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current || !isVisible) return null;

  return (
    <div className="bg-slate-700/50 backdrop-blur-sm border-b border-slate-600 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-teal-400 text-xs">🔬</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
          <p className="text-xs text-gray-500 mt-1">Source: {source}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-300 flex-shrink-0 p-1">✕</button>
      </div>
    </div>
  );
};


