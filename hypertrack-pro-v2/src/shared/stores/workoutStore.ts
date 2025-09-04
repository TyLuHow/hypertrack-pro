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
  completed?: boolean;
}

export interface WorkoutSession {
  id: string;
  name?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime?: string;
  exercises: ExerciseInWorkout[];
  duration?: number;
}

export type SyncStatus = 'online' | 'offline' | 'syncing';

interface WorkoutState {
  currentWorkout: WorkoutSession | null;
  activeExercise: string | null;
  
  syncStatus: SyncStatus;

  startWorkout: (name?: string) => void;
  selectExercise: (exerciseId: string, force?: boolean) => void;
  addSet: (
    exerciseId: string,
    set: SetData,
    meta?: { name?: string; muscleGroup?: string; category?: 'Compound' | 'Isolation' }
  ) => void;
  updateSetOptimistic: (setId: string, data: Partial<SetData>) => void;
  completeExercise: (exerciseId: string) => void;
  completeWorkout: () => void;
  setWorkoutName: (name: string) => void;
  queueForPersist?: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  immer((set, get) => ({
    currentWorkout: null,
    activeExercise: null,
    
    syncStatus: 'online',

    startWorkout: (name?: string) => {
      const now = new Date();
      set((s) => {
        s.currentWorkout = {
          id: `${now.getTime()}`,
          name: name || `Workout - ${now.toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}`,
          date: now.toISOString().slice(0, 10),
          startTime: now.toISOString(),
          exercises: [],
          duration: 0
        };
      });
    },

    selectExercise: (exerciseId, force) => {
      set((s) => {
        // Prevent switching away if current active exercise has uncompleted sets
        if (!force && s.activeExercise) {
          const current = s.currentWorkout?.exercises.find(e => e.id === s.activeExercise);
          if (current && current.sets.length > 0 && !current.completed) {
            return; // block switch
          }
        }
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

    completeExercise: (exerciseId) => {
      set((s) => {
        const ex = s.currentWorkout?.exercises.find(e => e.id === exerciseId);
        if (ex) ex.completed = true;
        s.activeExercise = null;
      });
    },

    

    completeWorkout: () => {
      set((s) => {
        if (!s.currentWorkout) return;
        s.currentWorkout.endTime = new Date().toISOString();
      });
    },

    setWorkoutName: (name: string) => {
      set((s) => {
        if (s.currentWorkout) {
          s.currentWorkout.name = name;
        }
      });
    }
  }))
);



