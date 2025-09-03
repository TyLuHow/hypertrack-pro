import React, { useEffect, useState } from 'react';

interface ResearchFact {
  id: string;
  fact: string;
  source: string;
  category: 'progression' | 'recovery' | 'volume' | 'frequency';
}

export const ResearchFactsBanner: React.FC = () => {
  const [currentFact, setCurrentFact] = useState<ResearchFact | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const researchFacts: ResearchFact[] = [
    { id: '1', fact: 'Studies show 48-72 hours rest between training same muscle groups optimizes growth', source: 'Schoenfeld et al., 2016', category: 'recovery' },
    { id: '2', fact: 'Progressive overload of 0.5-2% weekly maximizes strength gains while minimizing injury risk', source: 'ACSM Guidelines, 2018', category: 'progression' },
    { id: '3', fact: '10-20 sets per muscle group per week appears optimal for hypertrophy in trained individuals', source: 'Schoenfeld et al., 2017', category: 'volume' },
    { id: '4', fact: 'Training frequency of 2-3x per week per muscle group shows superior outcomes vs once weekly', source: 'Ralston et al., 2017', category: 'frequency' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomFact = researchFacts[Math.floor(Math.random() * researchFacts.length)];
      setCurrentFact(randomFact);
    }, 30000);
    setCurrentFact(researchFacts[0]);
    return () => clearInterval(interval);
  }, []);

  if (!currentFact || !isVisible) return null;

  return (
    <div className="bg-slate-700/50 backdrop-blur-sm border-b border-slate-600 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-teal-400 text-xs">🔬</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-300 leading-relaxed">{currentFact.fact}</p>
          <p className="text-xs text-gray-500 mt-1">Source: {currentFact.source}</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-300 flex-shrink-0 p-1">✕</button>
      </div>
    </div>
  );
};


