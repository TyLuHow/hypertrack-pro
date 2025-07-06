// Supabase Configuration for HyperTrack Pro
console.log('🔗 Initializing Supabase configuration...');

// Supabase configuration - Load from environment or use fallback
const supabaseUrl = window.SUPABASE_URL || 'https://zrmkzgwrmohhbmjfdxdf.supabase.co'
const supabaseAnonKey = window.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWt6Z3dybW9oaGJtamZkeGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjYwODgsImV4cCI6MjA2Njc0MjA4OH0.DJC-PLTnxG8IG-iV7_irb2pnEZJFacDOd9O7RDWwTVU'

// Create Supabase client when the library is available
function initializeSupabase() {
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            // Library already loaded and client exists
            console.log('✅ Supabase library already loaded');
            return;
        }
        
        if (window.supabase && window.supabase.createClient) {
            // Create the client
            window.supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
            console.log('✅ Supabase client initialized successfully');
        } else {
            console.warn('⚠️ Supabase library not yet available, will retry...');
            setTimeout(initializeSupabase, 200);
        }
    } catch (error) {
        console.warn('⚠️ Supabase initialization failed, will retry...', error);
        setTimeout(initializeSupabase, 200);
    }
}

// Wait for page load then initialize
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeSupabase, 100);
});

// Tyler's historical workout data management
class TylerDataManager {
    constructor() {
        this.isDataMigrated = false;
    }

    // Migrate Tyler's historical data to Supabase
    async migrateTylerData() {
        try {
            console.log('🔄 Migrating Tyler historical data to Supabase...');
            
            // Check if data already exists
            const { data: existingWorkouts, error: checkError } = await supabase
                .from('workouts')
                .select('id')
                .eq('user_id', 'tyler_historical')
                .limit(1);

            if (checkError) {
                console.error('❌ Error checking existing data:', checkError);
                return false;
            }

            if (existingWorkouts && existingWorkouts.length > 0) {
                console.log('✅ Tyler data already exists in Supabase');
                this.isDataMigrated = true;
                return true;
            }

            // Import Tyler's data from local file
            const { tylerCompleteWorkouts } = await import('./tyler-data-integration.js');
            
            // Format data for Supabase
            const formattedWorkouts = tylerCompleteWorkouts.map(workout => ({
                id: workout.id,
                user_id: 'tyler_historical',
                date: workout.date,
                start_time: workout.startTime,
                end_time: workout.endTime,
                duration: workout.duration,
                split: workout.split,
                time_of_day: workout.tod,
                notes: workout.notes,
                exercises: workout.exercises
            }));

            // Insert into Supabase
            const { data, error } = await supabase
                .from('workouts')
                .insert(formattedWorkouts);

            if (error) {
                console.error('❌ Error migrating Tyler data:', error);
                return false;
            }

            console.log(`✅ Successfully migrated ${formattedWorkouts.length} Tyler workouts to Supabase`);
            this.isDataMigrated = true;
            return true;

        } catch (error) {
            console.error('❌ Tyler data migration failed:', error);
            return false;
        }
    }

    // Load Tyler's data from Supabase
    async loadTylerData() {
        try {
            const { data: workouts, error } = await supabase
                .from('workouts')
                .select('*')
                .eq('user_id', 'tyler_historical')
                .order('date', { ascending: false });

            if (error) {
                console.error('❌ Error loading Tyler data:', error);
                return [];
            }

            console.log(`✅ Loaded ${workouts.length} Tyler workouts from Supabase`);
            return workouts;

        } catch (error) {
            console.error('❌ Failed to load Tyler data:', error);
            return [];
        }
    }

    // Validate Tyler data integrity (should be 8 workouts from late June to July 5th)
    validateTylerData(workouts) {
        const expectedCount = { min: 8, max: 8 };
        const lateJuneStart = new Date('2024-06-20');
        const earlyJulyEnd = new Date('2025-07-10'); // Updated to handle 2025 workout

        const validWorkouts = workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate >= lateJuneStart && workoutDate <= earlyJulyEnd;
        });

        const isValid = validWorkouts.length >= expectedCount.min && 
                       validWorkouts.length <= expectedCount.max;

        if (!isValid) {
            console.warn(`⚠️ Tyler data validation failed: Expected ${expectedCount.min}-${expectedCount.max} workouts, found ${validWorkouts.length}`);
        } else {
            console.log(`✅ Tyler data validated: ${validWorkouts.length} workouts from late June period`);
        }

        return { isValid, count: validWorkouts.length, workouts: validWorkouts };
    }
}

// Global Tyler data manager instance
const tylerDataManager = new TylerDataManager();
window.tylerDataManager = tylerDataManager;

// Initialize Tyler data integration
async function initializeTylerData() {
    try {
        // First migrate data if needed
        await tylerDataManager.migrateTylerData();
        
        // Then load and validate
        const workouts = await tylerDataManager.loadTylerData();
        const validation = tylerDataManager.validateTylerData(workouts);
        
        if (!validation.isValid) {
            console.error('❌ Tyler data validation failed - check Supabase data integrity');
        }
        
        // Integrate Tyler's historical workouts into main app state
        if (window.HyperTrack && validation.workouts.length > 0) {
            // Add Tyler's workouts to the main workouts array
            const existingWorkouts = window.HyperTrack.state.workouts || [];
            const combinedWorkouts = [...existingWorkouts, ...validation.workouts];
            
            // Sort by date (newest first)
            combinedWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            window.HyperTrack.state.workouts = combinedWorkouts;
            console.log(`✅ Integrated ${validation.workouts.length} Tyler workouts into main view`);
        }
        
        return validation.workouts;
        
    } catch (error) {
        console.error('❌ Tyler data initialization failed:', error);
        return [];
    }
}

// Make initializeTylerData globally available
window.initializeTylerData = initializeTylerData;

// Sync workout to Supabase only on workout completion
async function syncWorkoutOnCompletion(workout) {
    try {
        if (!supabase) {
            console.warn('⚠️ Supabase not available - workout saved locally only');
            return false;
        }

        console.log('🔄 Syncing completed workout to Supabase...');
        
        const { data, error } = await supabase
            .from('workouts')
            .insert([{
                id: workout.id,
                user_id: 'tyler_user', // Your user ID
                date: workout.date,
                start_time: workout.startTime,
                end_time: workout.endTime,
                duration: workout.duration,
                split: workout.split,
                time_of_day: workout.tod,
                notes: workout.notes,
                exercises: workout.exercises
            }]);

        if (error) {
            console.error('❌ Failed to sync workout to Supabase:', error);
            return false;
        }

        console.log('✅ Workout synced to Supabase successfully');
        return true;

    } catch (error) {
        console.error('❌ Workout sync error:', error);
        return false;
    }
}

// Make sync function globally available
window.syncWorkoutOnCompletion = syncWorkoutOnCompletion;

console.log('📊 Supabase configuration loaded - Tyler data integration ready');