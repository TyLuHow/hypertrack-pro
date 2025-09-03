import React, { useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../../../lib/supabase/client';
import { useWorkoutStore } from '../../../shared/stores/workoutStore';

interface ExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string, name: string) => void;
}

interface ExerciseRow {
  id: number;
  name: string;
  muscle_group: string;
  category: string;
}

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const currentWorkout = useWorkoutStore((s) => s.currentWorkout);

  useEffect(() => {
    if (!isOpen) return;
    const supabase = getSupabase() as any;
    (supabase as any)
      .from('exercises')
      .select('id,name,muscle_group,category')
      .order('muscle_group', { ascending: true })
      .order('name', { ascending: true })
      .then((res: { data?: ExerciseRow[] | null }) => {
        setRows(res.data || []);
      });
  }, [isOpen]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const catOk = cat === 'All' || r.muscle_group === cat;
      if (!catOk) return false;
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        (r.muscle_group || '').toLowerCase().includes(needle)
      );
    });
  }, [rows, q, cat]);

  const recent = useMemo(() => {
    const seen = new Set<string>();
    const list: ExerciseRow[] = [];
    (currentWorkout?.exercises || []).forEach((ex) => {
      if (!seen.has(ex.id)) {
        const match = rows.find((r) => String(r.id) === String(ex.id));
        if (match) list.push(match);
        seen.add(ex.id);
      }
    });
    return list.slice(0, 6);
  }, [currentWorkout, rows]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background text-textPrimary rounded-t-2xl p-4 card">
        <div className="h-1 w-12 bg-gray-700 rounded mx-auto mb-4" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises"
          className="w-full h-12 bg-surface rounded-lg px-4 mb-3"
        />
        {recent.length > 0 && (
          <div className="mb-3">
            <div className="text-sm text-textMuted mb-2">Recent</div>
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {recent.map((r) => (
                <button
                  key={`recent-${r.id}`}
                  onClick={() => onSelect(String(r.id), r.name)}
                  className="px-3 h-9 rounded-full whitespace-nowrap bg-surface"
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex space-x-2 overflow-x-auto pb-2 mb-3">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 h-9 rounded-full whitespace-nowrap ${cat === c ? 'bg-focus' : 'bg-surface'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(String(r.id), r.name)}
              className="w-full text-left bg-surface rounded-lg p-3"
            >
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-textMuted">{r.muscle_group} • {r.category}</div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-textMuted py-6">No results</div>
          )}
        </div>
      </div>
    </div>
  );
};


