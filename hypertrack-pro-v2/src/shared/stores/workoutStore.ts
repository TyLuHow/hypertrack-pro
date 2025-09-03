import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface SetData {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
}

export interface ExerciseInWorkout {
  id: string;
  name: string;
  muscleGroup: string;
  category: 'Compound' | 'Isolation';
  sets: SetData[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime?: string;
  exercises: ExerciseInWorkout[];
}

export type SyncStatus = 'online' | 'offline' | 'syncing';

interface WorkoutState {
  currentWorkout: WorkoutSession | null;
  activeExercise: string | null;
  restTimerActive: boolean;
  syncStatus: SyncStatus;

  startWorkout: () => void;
  selectExercise: (exerciseId: string) => void;
  addSet: (
    exerciseId: string,
    set: SetData,
    meta?: { name?: string; muscleGroup?: string; category?: 'Compound' | 'Isolation' }
  ) => void;
  updateSetOptimistic: (setId: string, data: Partial<SetData>) => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  completeWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  immer((set, get) => ({
    currentWorkout: null,
    activeExercise: null,
    restTimerActive: false,
    syncStatus: 'online',

    startWorkout: () => {
      const now = new Date();
      set((s) => {
        s.currentWorkout = {
          id: `${now.getTime()}`,
          date: now.toISOString().slice(0, 10),
          startTime: now.toISOString(),
          exercises: []
        };
      });
    },

    selectExercise: (exerciseId) => {
      set((s) => {
        s.activeExercise = exerciseId;
      });
    },

    addSet: (exerciseId, setData, meta) => {
      set((s) => {
        if (!s.currentWorkout) return;
        const ex = s.currentWorkout.exercises.find((e) => e.id === exerciseId);
        if (!ex) {
          // create stub exercise entry with optimistic UI pattern
          s.currentWorkout.exercises.push({
            id: exerciseId,
            name: meta?.name || 'Exercise',
            muscleGroup: meta?.muscleGroup || 'Unknown',
            category: meta?.category || 'Isolation',
            sets: [setData]
          });
        } else {
          if (meta) {
            if (meta.name) ex.name = meta.name;
            if (meta.muscleGroup) ex.muscleGroup = meta.muscleGroup;
            if (meta.category) ex.category = meta.category;
          }
          ex.sets.push(setData);
        }
      });
    },

    updateSetOptimistic: (setId, data) => {
      set((s) => {
        if (!s.currentWorkout) return;
        for (const ex of s.currentWorkout.exercises) {
          const idx = ex.sets.findIndex((st) => st.id === setId);
          if (idx !== -1) {
            ex.sets[idx] = { ...ex.sets[idx], ...data };
            break;
          }
        }
      });
    },

    startRestTimer: (_duration) => {
      set((s) => {
        s.restTimerActive = true;
      });
      // UI overlay and countdown handled at component level
    },

    stopRestTimer: () => {
      set((s) => {
        s.restTimerActive = false;
      });
    },

    completeWorkout: () => {
      set((s) => {
        if (!s.currentWorkout) return;
        s.currentWorkout.endTime = new Date().toISOString();
      });
    }
  }))
);



