import React, { useEffect, useRef, useState } from 'react';

interface WeightInputProps {
  value: number | null;
  onChange: (next: number | null) => void;
  increments?: number[]; // e.g., [2.5, 5, 10]
  autoLabel?: string; // e.g., "Last: 135lbs"
}

export const WeightInput: React.FC<WeightInputProps> = ({ value, onChange, increments = [2.5, 5, 10], autoLabel }) => {
  const [text, setText] = useState<string>(value != null ? String(value) : '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(value != null ? String(value) : '');
  }, [value]);

  const parse = (t: string): number | null => {
    const cleaned = t.replace(/[^0-9.]/g, '');
    if (cleaned === '' || cleaned === '.') return null;
    const num = Number(cleaned);
    if (!isFinite(num) || num < 0) return null;
    if (num > 2000) return 2000; // safety cap
    return num;
  };

  const applyDelta = (delta: number) => {
    const base = value ?? 0;
    const next = Math.max(0, Math.round((base + delta) / 2.5) * 2.5);
    onChange(next);
    setText(String(next));
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {autoLabel && (
        <div className="text-xs text-textSecondary">{autoLabel}</div>
      )}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          {increments.map((inc) => (
            <button key={`dec-${inc}`} className="h-10 w-10 rounded-full bg-slate-500 text-white text-xl active:scale-95 hover:bg-slate-400" onClick={() => applyDelta(-inc)}>-</button>
          ))}
        </div>
        <input
          ref={inputRef}
          inputMode="decimal"
          pattern="[0-9]*"
          placeholder=""
          value={text}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const t = e.target.value;
            setText(t);
            onChange(parse(t));
          }}
          className="flex-1 h-11 bg-slate-600 rounded-lg px-3 text-xl number-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="flex items-center space-x-2">
          {increments.map((inc) => (
            <button key={`inc-${inc}`} className="h-10 w-10 rounded-full bg-slate-500 text-white text-xl active:scale-95 hover:bg-slate-400" onClick={() => applyDelta(inc)}>+</button>
          ))}
        </div>
      </div>
    </div>
  );
};


