import React, { useState } from 'react';
import { BodyweightSettings } from './BodyweightSettings';
import { DataManagementSettings } from './DataManagementSettings';

export const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('general');
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-300">Customize your training experience</p>
      </div>
      <div className="p-6">
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'general', label: 'General' },
            { id: 'bodyweight', label: 'Body Weight' },
            { id: 'units', label: 'Units & Display' },
            { id: 'data', label: 'Data Management' },
            { id: 'research', label: 'Research Settings' },
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeSection === section.id ? 'bg-teal-600 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
            >
              {section.label}
            </button>
          ))}
        </div>
        <div className="space-y-6">
          {activeSection === 'general' && <div className="card p-4 text-textPrimary">General settings coming soon.</div>}
          {activeSection === 'bodyweight' && <BodyweightSettings />}
          {activeSection === 'units' && <div className="card p-4 text-textPrimary">Units settings coming soon.</div>}
          {activeSection === 'data' && <DataManagementSettings />}
          {activeSection === 'research' && <div className="card p-4 text-textPrimary">Research preferences coming soon.</div>}
        </div>
      </div>
    </div>
  );
};

// Removed inline BodyweightSettings component; using dedicated component file instead.


