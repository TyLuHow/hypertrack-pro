// @ts-ignore - types not installed
import Papa from 'papaparse';
import type { WorkoutSession } from '../../../shared/stores/workoutStore';

export function convertWorkoutsToCSV(workouts: WorkoutSession[]): string {
  const rows = workouts.flatMap((w) =>
    w.exercises.flatMap((ex, exIdx) =>
      ex.sets.map((s, i) => ({
        date: w.date,
        exercise: ex.name,
        set_number: i + 1,
        weight: s.weight,
        reps: s.reps
      }))
    )
  );
  return Papa.unparse(rows, { quotes: true });
}

export function downloadCSVFile(csvData: string, filename: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


