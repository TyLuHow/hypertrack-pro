import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPersonalRecords, getRecentPersonalRecords, type PersonalRecord } from '../../../lib/supabase/queries';

export const PersonalRecordsTracker: React.FC = () => {
  const { data: personalRecords } = useQuery<PersonalRecord[]>({ queryKey: ['personal-records'], queryFn: () => getPersonalRecords() });
  const { data: recentPRs } = useQuery<{ exerciseName: string; weight: number; reps: number; date: string }[]>({ queryKey: ['recent-prs'], queryFn: () => getRecentPersonalRecords(30) });

  return (
    <div className="bg-slate-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Personal Records</h3>
      {recentPRs && recentPRs.length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-medium text-white mb-4">Recent Achievements</h4>
          <div className="space-y-3">
            {recentPRs.slice(0,3).map((pr, index) => (
              <div key={index} className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold text-green-400">{pr.exerciseName}</h5>
                    <p className="text-sm text-gray-400">Last achieved: {new Date(pr.date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-green-500/20 px-3 py-1 rounded-full"><span className="text-green-400 text-sm font-medium">New PR!</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personalRecords?.map((record) => {
          // PR timeline tooltip uses avgLoad = totalVolume / sets (per-set volume).
          // To express the equivalent weight at 10 reps per set: divide per-set volume by 10.
          const avgLoadPerSet = record.maxAvgLoad || 0; // lbs-reps per set
          const normalizedTo10 = avgLoadPerSet > 0 ? Math.round(avgLoadPerSet / 10) : 0; // lbs at 10 reps
          const est1RM = record.maxWeight > 0 ? Math.round(record.maxWeight * (1 + 10/30)) : 0;
          return (
          <div key={record.exerciseName} className="bg-slate-600/30 rounded-lg p-4">
            <h5 className="font-semibold text-white mb-2">{record.exerciseName}</h5>
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Max Volume (single workout):</span><span className="text-teal-400 font-medium">{record.maxVolume}lbs</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Max Avg Load @10 reps (equiv weight):</span><span className="text-teal-400 font-medium">{normalizedTo10}lbs</span></div>
              <div className="flex justify-between"><span className="text-gray-400 text-sm">Estimated 1RM:</span><span className="text-teal-400 font-medium">{est1RM}lbs</span></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Last achieved: {new Date(record.lastAchieved).toLocaleDateString()}</p>
          </div>
        );})}
      </div>
    </div>
  );
};


