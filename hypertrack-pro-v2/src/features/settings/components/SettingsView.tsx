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
          {activeSection === 'research' && (
            <div className="card p-4 text-textPrimary">
              <h3 className="text-lg font-semibold mb-3">References</h3>
              <p className="text-sm text-gray-300 mb-4">A consolidated list of studies used across the app with quick links.</p>
              <div className="space-y-3">
                <ReferenceList />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Removed inline BodyweightSettings component; using dedicated component file instead.

function ReferenceList() {
  const refs = [
    { title: 'Dose-response relationship between weekly resistance training volume and increases in muscle mass', authors: 'Schoenfeld et al.', year: 2017, url: 'https://doi.org/10.1080/02640414.2016.1210197', keywords: ['volume', 'hypertrophy'] },
    { title: 'The effects of training volume on muscle hypertrophy', authors: 'Baz-Valle et al.', year: 2022, url: 'https://doi.org/10.1007/s40279-021-01615-8', keywords: ['volume', 'dose-response'] }
  ];
  return (
    <div className="space-y-3">
      {refs.map((r, i) => (
        <div key={i} className="bg-slate-700/40 rounded p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium text-sm">{r.title}</div>
              <div className="text-xs text-gray-300">{r.authors} • {r.year}</div>
              <div className="text-[11px] text-gray-400 mt-1">{r.keywords.join(' • ')}</div>
            </div>
            <a className="text-xs text-teal-300 hover:underline" href={r.url} target="_blank" rel="noreferrer">Open</a>
          </div>
        </div>
      ))}
    </div>
  );
}


