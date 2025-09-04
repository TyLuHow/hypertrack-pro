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
            value={r.weight}
            onChange={(e) => onChange(r.id, { weight: Number(e.target.value) })}
          />
          <input
            type="number"
            className="h-10 bg-slate-600 rounded px-3 text-white"
            value={r.reps}
            onChange={(e) => onChange(r.id, { reps: Number(e.target.value) })}
          />
        </div>
      ))}
      <button onClick={onAdd} className="btn-primary w-full">Add Set</button>
    </div>
  );
};


