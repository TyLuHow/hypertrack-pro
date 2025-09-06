import React from 'react';

export interface SetRow {
  id: string;
  weight: number;
  reps: number;
}

export const SetTable: React.FC<{
  rows: SetRow[];
  onChange: (id: string, next: Partial<SetRow>) => void;
  onAdd: () => void;
}> = ({ rows, onChange, onAdd }) => {
  return (
    <div className="space-y-2">
      {rows.map((r, idx) => (
        <div key={r.id} className="grid grid-cols-3 gap-3 items-center bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-300 text-sm">Set {idx + 1}</div>
          <input
            type="number"
            className="h-10 bg-slate-600 rounded px-3 text-white"
            inputMode="decimal"
            value={Number.isFinite(r.weight) ? r.weight : ''}
            onChange={(e) => {
              const v = e.target.value;
              const num = v === '' ? 0 : Number(v);
              onChange(r.id, { weight: isFinite(num) ? num : 0 });
            }}
          />
          <input
            type="number"
            className="h-10 bg-slate-600 rounded px-3 text-white"
            inputMode="numeric"
            value={Number.isFinite(r.reps) ? r.reps : ''}
            onChange={(e) => {
              const v = e.target.value;
              const num = v === '' ? 0 : Number(v);
              onChange(r.id, { reps: isFinite(num) ? num : 0 });
            }}
          />
        </div>
      ))}
      <button onClick={onAdd} className="btn-primary w-full">Add Set</button>
    </div>
  );
};



