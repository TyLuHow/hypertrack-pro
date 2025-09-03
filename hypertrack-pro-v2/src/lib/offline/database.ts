import { openDB, IDBPDatabase } from 'idb';
import type { WorkoutSession } from '../../shared/stores/workoutStore';

interface HyperTrackDB {
  workouts: WorkoutSession;
  queue: {
    id: string;
    type: 'createWorkout' | 'updateWorkout' | 'deleteWorkout';
    payload: unknown;
    createdAt: number;
  };
}

export class OfflineDatabase {
  private db: IDBPDatabase<HyperTrackDB> | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB<HyperTrackDB>('hypertrack-pro', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('workouts')) {
          db.createObjectStore('workouts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('queue')) {
          db.createObjectStore('queue', { keyPath: 'id' });
        }
      }
    });
  }

  private requireDB(): IDBPDatabase<HyperTrackDB> {
    if (!this.db) throw new Error('Offline DB not initialized');
    return this.db;
  }

  async addWorkout(workout: WorkoutSession): Promise<void> {
    const db = this.requireDB();
    const tx = db.transaction(['workouts', 'queue'], 'readwrite');
    await tx.objectStore('workouts').put(workout);
    await tx.objectStore('queue').put({
      id: `q_${workout.id}`,
      type: 'createWorkout',
      payload: workout,
      createdAt: Date.now()
    });
    await tx.done;
  }

  async getWorkoutHistory(limit = 50): Promise<WorkoutSession[]> {
    const db = this.requireDB();
    const tx = db.transaction('workouts', 'readonly');
    const all = await tx.objectStore('workouts').getAll();
    // newest first
    return all.sort((a, b) => (b.date.localeCompare(a.date))).slice(0, limit);
  }

  async drainQueue(handler: (item: HyperTrackDB['queue']) => Promise<void>): Promise<void> {
    const db = this.requireDB();
    const tx = db.transaction('queue', 'readwrite');
    const items = await tx.store.getAll();
    for (const item of items) {
      await handler(item as any);
      await tx.store.delete((item as any).id);
    }
    await tx.done;
  }
}



