import React, { useState } from 'react';
import { getResearchSaturatedVolumeAnalysis } from '../../analytics/utils/researchSaturatedAnalytics';

export function ComprehensiveResearchDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'volume' | 'rest' | 'frequency' | 'order'>('all');
  const user = { age: 30, gender: 'male', experience: 'intermediate' };
  const vol = getResearchSaturatedVolumeAnalysis('chest', 8, user.experience, user.age, user.gender);

  return (
    <div className="bg-slate-700/40 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Comprehensive Research Insights</h2>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value as any)} className="bg-slate-800 text-white rounded px-3 py-2">
          <option value="all">All</option>
          <option value="volume">Volume</option>
          <option value="rest">Rest</option>
          <option value="frequency">Frequency</option>
          <option value="order">Exercise Order</option>
        </select>
      </div>
      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded p-4">
          <div className="text-white font-medium mb-1">Volume Analysis</div>
          <div className="text-gray-300 text-sm">{vol.currentStatus}</div>
          <div className="text-gray-300 text-sm mt-2">Optimization: {vol.optimizationSuggestions.join(' • ')}</div>
          <div className="text-gray-400 text-xs mt-2">Evidence strength: {(vol.evidenceStrength * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
}


