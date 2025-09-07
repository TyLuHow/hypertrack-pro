import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePeriodization } from '../../periodization/hooks/usePeriodization';
import { generatePerformanceForecast, type ExercisePerformanceData } from '../utils/performancePrediction';
import { calculatePlateauRisk } from '../utils/plateauRiskModel';
import { exportToCSV, generateComprehensiveReport, type DateRange, type AnalyticsReport } from '../utils/analyticsExport';

async function getComprehensiveAnalytics(_timeframe: string): Promise<{ exercises: ExercisePerformanceData[]; volumeAnalysis: any; strengthTrends: any; plateauRisks: any[]; recommendations: any[]; researchBacking: any[] }> {
  // Placeholder: synthesize minimal mock data so UI shows content until wired to live queries
  return {
    exercises: [
      { name: 'Bench Press', currentMax: 225, data: Array.from({ length: 8 }, (_, i) => ({ ts: Date.now() - (8 - i) * 7 * 86400000, value: 200 + i * 3 })) },
      { name: 'Squat', currentMax: 315, data: Array.from({ length: 8 }, (_, i) => ({ ts: Date.now() - (8 - i) * 7 * 86400000, value: 280 + i * 4 })) }
    ],
    volumeAnalysis: {},
    strengthTrends: {},
    plateauRisks: [],
    recommendations: [],
    researchBacking: []
  };
}

export function AdvancedAnalyticsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('12weeks');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const { currentPhase } = usePeriodization();
  const userProfile = { experience: 'intermediate' as const };

  const { data: comprehensiveData } = useQuery({ queryKey: ['comprehensive-analytics', selectedTimeframe], queryFn: () => getComprehensiveAnalytics(selectedTimeframe) });

  const forecastData = useMemo(() => generatePerformanceForecast(comprehensiveData?.exercises || [], currentPhase, userProfile), [comprehensiveData, currentPhase]);

  const handleExport = async (fmt: 'csv' | 'pdf') => {
    const range: DateRange = { start: new Date(Date.now() - 12 * 7 * 86400000).toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) };
    const report: AnalyticsReport = generateComprehensiveReport('me', range);
    if (fmt === 'csv') {
      const csv = exportToCSV(report);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'hypertrack-report.csv'; a.click(); URL.revokeObjectURL(url);
    } else {
      // placeholder: PDF export stub
      alert('PDF export will be available soon.');
    }
  };

  return (
    <div className="advanced-analytics bg-slate-900 text-slate-100 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Advanced Analytics</h2>
        <div className="flex items-center gap-3">
          <select value={selectedTimeframe} onChange={e => setSelectedTimeframe(e.target.value)} className="bg-slate-700 px-3 py-2 rounded">
            <option value="12weeks">Last 12 weeks</option>
            <option value="24weeks">Last 24 weeks</option>
          </select>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value as any)} className="bg-slate-700 px-3 py-2 rounded">
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button onClick={() => handleExport(exportFormat)} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 rounded">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-800/60 rounded p-4">
          <h3 className="font-medium mb-3">Plateau Risk</h3>
          {comprehensiveData?.exercises?.length ? (
            <ul className="text-sm text-slate-300 space-y-1">
              {comprehensiveData.exercises.map(ex => (
                <li key={ex.name}>{ex.name}: trend {(ex.data?.length||0)} pts, current {ex.currentMax} lbs</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-300">No high risks detected.</div>
          )}
        </div>
        <div className="bg-slate-800/60 rounded p-4">
          <h3 className="font-medium mb-3">Performance Forecast</h3>
          {forecastData.length === 0 ? <div className="text-sm text-slate-300">No forecast available</div> : (
            <ul className="text-sm text-slate-300 space-y-1">
              {forecastData.map(f => (
                <li key={f.exercise}>{f.exercise}: {f.currentMax} → {f.predictedMax} in {f.timeframe}w (conf {Math.round(f.confidence*100)}%)</li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-slate-800/60 rounded p-4">
          <h3 className="font-medium mb-3">Periodization</h3>
          <div className="text-sm text-slate-300">Current phase: {currentPhase.type}</div>
        </div>
      </div>
    </div>
  );
}


