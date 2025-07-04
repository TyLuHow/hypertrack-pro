// Supabase Service Layer for HyperTrack Pro
// Handles all database operations and data synchronization

class SupabaseService {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncOfflineData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
    }

    async initialize() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase not loaded');
            }
            
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase service initialized');
            
            // Check if user is already logged in
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.user = user;
                console.log('✅ User already authenticated:', user.email);
            }
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.user = session.user;
                    console.log('✅ User signed in:', this.user.email);
                    this.syncOfflineData();
                } else if (event === 'SIGNED_OUT') {
                    this.user = null;
                    console.log('ℹ️ User signed out');
                }
            });
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            return false;
        }
    }

    // Authentication Methods
    async signUp(email, password, username) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });
            
            if (error) throw error;
            
            console.log('✅ User signed up successfully');
            return { success: true, data };
        } catch (error) {
            console.error('❌ Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.user = data.user;
            console.log('✅ User signed in successfully');
            return { success: true, data };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.user = null;
            console.log('✅ User signed out successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    // Exercise Database Methods
    async seedExerciseDatabase() {
        try {
            // Check if exercises already exist
            const { data: existingExercises } = await this.supabase
                .from('exercises')
                .select('id')
                .limit(1);
            
            if (existingExercises && existingExercises.length > 0) {
                console.log('ℹ️ Exercise database already seeded');
                return { success: true };
            }
            
            // Prepare exercise data from HyperTrack.exerciseDatabase
            const exerciseData = HyperTrack.exerciseDatabase.map(exercise => ({
                name: exercise.name,
                muscle_group: exercise.muscle_group,
                category: exercise.category,
                tier: exercise.tier,
                mvc_percentage: exercise.mvc_percentage,
                equipment: exercise.equipment,
                gym_types: exercise.gym_types,
                biomechanical_function: exercise.biomechanical_function,
                target_rep_range: exercise.target_rep_range,
                rest_period: exercise.rest_period
            }));
            
            const { data, error } = await this.supabase
                .from('exercises')
                .insert(exerciseData);
            
            if (error) throw error;
            
            console.log(`✅ Seeded ${exerciseData.length} exercises to database`);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error seeding exercise database:', error);
            return { success: false, error: error.message };
        }
    }

    async getExercises() {
        try {
            const { data, error } = await this.supabase
                .from('exercises')
                .select('*')
                .order('tier')
                .order('name');
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error fetching exercises:', error);
            return { success: false, error: error.message };
        }
    }

    // Workout Methods
    async saveWorkout(workoutData) {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            // Prepare workout data
            const workout = {
                user_id: this.user.id,
                workout_date: workoutData.date,
                start_time: workoutData.startTime,
                end_time: workoutData.endTime,
                duration: workoutData.duration,
                split_type: workoutData.split || 'Mixed',
                tod: workoutData.tod,
                notes: workoutData.notes || '',
                total_sets: workoutData.exercises?.reduce((total, ex) => total + (ex.sets?.length || 0), 0) || 0,
                total_volume: this.calculateTotalVolume(workoutData.exercises)
            };
            
            // Insert workout
            const { data: workoutResult, error: workoutError } = await this.supabase
                .from('workouts')
                .insert(workout)
                .select()
                .single();
            
            if (workoutError) throw workoutError;
            
            // Insert exercises and sets
            if (workoutData.exercises && workoutData.exercises.length > 0) {
                await this.saveWorkoutExercises(workoutResult.id, workoutData.exercises);
            }
            
            console.log('✅ Workout saved successfully');
            return { success: true, data: workoutResult };
        } catch (error) {
            console.error('❌ Error saving workout:', error);
            
            // If offline, queue for later sync
            if (!this.isOnline) {
                this.queueForSync('saveWorkout', workoutData);
                return { success: true, queued: true };
            }
            
            return { success: false, error: error.message };
        }
    }

    async saveWorkoutExercises(workoutId, exercises) {
        for (let i = 0; i < exercises.length; i++) {
            const exercise = exercises[i];
            
            // Get exercise ID from database
            const { data: exerciseData } = await this.supabase
                .from('exercises')
                .select('id')
                .eq('name', exercise.name)
                .single();
            
            if (!exerciseData) continue;
            
            // Insert workout exercise
            const { data: workoutExercise, error: exerciseError } = await this.supabase
                .from('workout_exercises')
                .insert({
                    workout_id: workoutId,
                    exercise_id: exerciseData.id,
                    exercise_order: i + 1,
                    notes: exercise.notes || ''
                })
                .select()
                .single();
            
            if (exerciseError) throw exerciseError;
            
            // Insert sets
            if (exercise.sets && exercise.sets.length > 0) {
                const setsData = exercise.sets.map((set, index) => ({
                    workout_exercise_id: workoutExercise.id,
                    set_number: index + 1,
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe || null,
                    rest_duration: set.restDuration || null,
                    completed_at: set.timestamp || new Date().toISOString()
                }));
                
                const { error: setsError } = await this.supabase
                    .from('sets')
                    .insert(setsData);
                
                if (setsError) throw setsError;
            }
        }
    }

    async getUserWorkouts(limit = 50) {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            const { data, error } = await this.supabase
                .from('workouts')
                .select(`
                    *,
                    workout_exercises (
                        *,
                        exercises (*),
                        sets (*)
                    )
                `)
                .eq('user_id', this.user.id)
                .order('workout_date', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            
            // Transform data to match existing format
            const transformedWorkouts = data.map(workout => ({
                id: workout.id,
                date: workout.workout_date,
                startTime: workout.start_time,
                endTime: workout.end_time,
                duration: workout.duration,
                split: workout.split_type,
                tod: workout.tod,
                notes: workout.notes,
                exercises: workout.workout_exercises.map(we => ({
                    id: we.exercises.id,
                    name: we.exercises.name,
                    muscle_group: we.exercises.muscle_group,
                    category: we.exercises.category,
                    sets: we.sets.map(set => ({
                        weight: set.weight,
                        reps: set.reps,
                        rpe: set.rpe,
                        timestamp: set.completed_at,
                        restDuration: set.rest_duration
                    }))
                }))
            }));
            
            return { success: true, data: transformedWorkouts };
        } catch (error) {
            console.error('❌ Error fetching workouts:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteWorkout(workoutId) {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            const { error } = await this.supabase
                .from('workouts')
                .delete()
                .eq('id', workoutId)
                .eq('user_id', this.user.id);
            
            if (error) throw error;
            
            console.log('✅ Workout deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting workout:', error);
            return { success: false, error: error.message };
        }
    }

    // User Settings Methods
    async getUserSettings() {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            const { data, error } = await this.supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', this.user.id)
                .single();
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error fetching user settings:', error);
            return { success: false, error: error.message };
        }
    }

    async updateUserSettings(settings) {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            const { data, error } = await this.supabase
                .from('user_settings')
                .update(settings)
                .eq('user_id', this.user.id)
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ User settings updated successfully');
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error updating user settings:', error);
            return { success: false, error: error.message };
        }
    }

    // Migration Methods
    async migrateLocalStorageData() {
        try {
            if (!this.user) {
                throw new Error('User not authenticated');
            }
            
            console.log('🔄 Starting localStorage migration...');
            
            // Migrate workouts from localStorage
            const localWorkouts = localStorage.getItem('hypertrack_workouts');
            if (localWorkouts) {
                const workouts = JSON.parse(localWorkouts);
                for (const workout of workouts) {
                    await this.saveWorkout(workout);
                }
                console.log(`✅ Migrated ${workouts.length} workouts`);
            }
            
            // Migrate settings
            const localSettings = localStorage.getItem('hypertrack_settings');
            if (localSettings) {
                const settings = JSON.parse(localSettings);
                await this.updateUserSettings(settings);
                console.log('✅ Migrated user settings');
            }
            
            // Create backup of local data before clearing
            const backup = {
                workouts: localWorkouts,
                settings: localSettings,
                migrated_at: new Date().toISOString()
            };
            localStorage.setItem('hypertrack_backup', JSON.stringify(backup));
            
            console.log('✅ Migration completed successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Migration error:', error);
            return { success: false, error: error.message };
        }
    }

    // Offline Support Methods
    queueForSync(operation, data) {
        this.syncQueue.push({
            operation,
            data,
            timestamp: Date.now()
        });
        localStorage.setItem('hypertrack_sync_queue', JSON.stringify(this.syncQueue));
    }

    async syncOfflineData() {
        if (!this.isOnline || !this.user) return;
        
        const queueData = localStorage.getItem('hypertrack_sync_queue');
        if (!queueData) return;
        
        try {
            this.syncQueue = JSON.parse(queueData);
            console.log(`🔄 Syncing ${this.syncQueue.length} queued operations...`);
            
            for (const item of this.syncQueue) {
                if (item.operation === 'saveWorkout') {
                    await this.saveWorkout(item.data);
                }
                // Add other operations as needed
            }
            
            // Clear sync queue
            this.syncQueue = [];
            localStorage.removeItem('hypertrack_sync_queue');
            console.log('✅ Offline data synced successfully');
        } catch (error) {
            console.error('❌ Sync error:', error);
        }
    }

    // Utility Methods
    calculateTotalVolume(exercises) {
        if (!exercises) return 0;
        
        return exercises.reduce((total, exercise) => {
            if (!exercise.sets) return total;
            
            const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
                return setTotal + (set.weight * set.reps);
            }, 0);
            
            return total + exerciseVolume;
        }, 0);
    }

    isAuthenticated() {
        return !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }
}

// Create global instance
window.supabaseService = new SupabaseService();