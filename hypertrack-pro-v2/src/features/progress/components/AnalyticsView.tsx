import React from 'react';
import { PersonalRecordsTracker } from '../../analytics/components/PersonalRecordsTracker';
import { ProgressDashboard } from '../../analytics';

export const AnalyticsView: React.FC = () => {
  return (
    <div className="p-4 pb-20 text-textPrimary">
      <div className="text-xl font-semibold mb-3">Progress</div>
      <div className="card p-0 overflow-hidden">
        <ProgressDashboard />
      </div>
      <div className="mt-4">
        <PersonalRecordsTracker />
      </div>
    </div>
  );
};


