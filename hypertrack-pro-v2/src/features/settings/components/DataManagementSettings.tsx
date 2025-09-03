import React, { useState } from 'react';
import { convertWorkoutsToCSV, downloadCSVFile } from '../utils/csvExport';

function generateCompleteDataExport(): Promise<string> {
  // TODO: pull from IndexedDB/Supabase; placeholder empty CSV
  return Promise.resolve(convertWorkoutsToCSV([] as any));
}
async function parseCSVFile(file: File): Promise<any[]> {
  const text = await file.text();
  // Minimal CSV parsing; actual import logic would be more robust
  return text.split('\n').map((l) => l.split(','));
}
async function importWorkoutData(_rows: any[]): Promise<void> {
  return; // wire into persistence later
}

const FileDropzone: React.FC<React.PropsWithChildren<{ onFileSelect: (file: File) => void; acceptedTypes: string[]; className?: string }>> = ({ onFileSelect, acceptedTypes, className, children }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };
  return (
    <label className={className}>
      <input type="file" accept={acceptedTypes.join(',')} className="hidden" onChange={handleChange} />
      {children}
    </label>
  );
};

const SyncStatusIndicator: React.FC = () => <div className="text-sm text-gray-300">Online</div>;
const StorageUsageIndicator: React.FC = () => <div className="text-sm text-gray-300">Local: 2MB · Cloud: 0MB</div>;

export const DataManagementSettings: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastBackup, setLastBackup] = useState<Date | null>(null);

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      const exportData = await generateCompleteDataExport();
      downloadCSVFile(exportData, `hypertrack-backup-${new Date().toISOString().slice(0,10)}.csv`);
      setLastBackup(new Date());
    } finally {
      setIsExporting(false);
    }
  };

  const handleDataImport = async (file: File) => {
    const importData = await parseCSVFile(file);
    await importWorkoutData(importData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Data Export</h3>
        <p className="text-gray-300 text-sm mb-4">Export all your workout data, personal records, and settings as a CSV file.</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Last backup: {lastBackup ? lastBackup.toLocaleString() : 'Never'}</p>
          </div>
          <button onClick={handleDataExport} disabled={isExporting} className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium">
            {isExporting ? 'Exporting…' : '⬇ Export Data'}
          </button>
        </div>
      </div>

      <div className="bg-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Data Import</h3>
        <p className="text-gray-300 text-sm mb-4">Import workout data from a CSV file. This will merge with existing data.</p>
        <FileDropzone onFileSelect={handleDataImport} acceptedTypes={['.csv']} className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
          <p className="text-gray-400">Drop CSV file here or click to browse</p>
        </FileDropzone>
      </div>

      <div className="bg-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-600">
            <div>
              <h4 className="text-white font-medium">Sync Status</h4>
              <p className="text-sm text-gray-400">Current synchronization status</p>
            </div>
            <SyncStatusIndicator />
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-600">
            <div>
              <h4 className="text-white font-medium">Storage Usage</h4>
              <p className="text-sm text-gray-400">Local and cloud storage usage</p>
            </div>
            <StorageUsageIndicator />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-red-400 font-medium">Clear All Data</h4>
              <p className="text-sm text-gray-400">Permanently delete all workout data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Clear Data</button>
          </div>
        </div>
      </div>
    </div>
  );
};


