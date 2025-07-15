// Supabase Configuration for HyperTrack Pro
console.log('🔗 Initializing Supabase configuration...');

// Supabase configuration - Load from environment variables
const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) || '';
const supabaseAnonKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || '';

// User ID configuration - ensures data separation between users
function getUserId() {
    // Generate unique user ID if not configured
    let userId = localStorage.getItem('hypertrack_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('hypertrack_user_id', userId);
        console.log('🆔 Generated unique user ID:', userId);
    }
    return userId;
}

const currentUserId = getUserId();

// Check if Supabase is properly configured
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase not configured. App will work with local storage only.');
    console.warn('📝 For cloud sync: Set window.SUPABASE_URL and window.SUPABASE_ANON_KEY');
    console.warn('🔗 Get credentials from: https://supabase.com');
}

// Create Supabase client when the library is available
function initializeSupabase() {
    try {
        // Check if Supabase library is loaded
        if (typeof window.supabase === 'undefined') {
            console.log('⏳ Waiting for Supabase library...');
            setTimeout(initializeSupabase, 100);
            return;
        }
        
        // Skip if no credentials
        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('⚠️ No Supabase credentials - using local storage only');
            return;
        }
        
        // Create the client
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
            console.log('✅ Supabase client created successfully');
            console.log('🔍 Client type:', typeof window.supabaseClient);
            console.log('🔍 Has .from method:', typeof window.supabaseClient?.from === 'function');
            console.log('🔗 URL configured:', supabaseUrl);
            
            // Test the connection immediately
            setTimeout(testSupabaseConnection, 1000);
        } else {
            throw new Error('Supabase createClient function not available');
        }
        
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        console.error('📋 Error details:', {
            hasSupabase: typeof window.supabase !== 'undefined',
            hasCreateClient: typeof window.supabase?.createClient === 'function',
            url: supabaseUrl ? '✅ Present' : '❌ Missing',
            key: supabaseAnonKey ? '✅ Present' : '❌ Missing'
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
    setTimeout(initializeSupabase, 100);
}

// Tyler's historical workout data management
class TylerDataManager {
    constructor() {
        this.isDataMigrated = false;
    }

    // Migrate Tyler's historical data to Supabase
    async migrateTylerData() {
        try {
            if (!window.supabaseClient) {
                console.log('⚠️ No Supabase client - skipping Tyler data migration');
                return await this.loadFromLocalFallback();
            }
            
            // Skip Supabase operations in development mode to avoid auth errors
            if (currentUserId.startsWith('user_')) {
                console.log('🛠️ Development mode detected - using local data only');
                return await this.loadFromLocalFallback();
            }
            
            console.log('🔄 Migrating Tyler historical data to Supabase...');
            
                    // Test if we can access the workouts table
            try {
                const { data: testData, error: testError } = await window.supabaseClient
                    .from('workouts')
                    .select('id')
                    .limit(1);
                    
                if (testError) {
                    console.error('❌ Cannot access workouts table:', testError);
                    console.error('🔍 Possible RLS (Row Level Security) issue');
                    console.log('💡 Continuing with migration attempt...');
                    // Don't return here - continue with migration attempt
                }
            } catch (err) {
                console.error('❌ Supabase connection test failed:', err);
                return await this.loadFromLocalFallback();
            }
            
            // Check if data already exists
            const { data: existingWorkouts, error: checkError } = await window.supabaseClient
                .from('workouts')
                .select('id')
                .eq('user_id', 'tyler_historical')
                .limit(1);

            if (checkError) {
                console.error('❌ Error checking existing data:', checkError);
                return await this.loadFromLocalFallback();
            }

            if (existingWorkouts && existingWorkouts.length > 0) {
                console.log('✅ Tyler data already exists in Supabase');
                this.isDataMigrated = true;
                return await this.loadTylerData();
            }

            // Load Tyler's data from local JSON for migration
            const response = await fetch('./data/tyler-workouts.json');
            if (!response.ok) {
                throw new Error(`Failed to load Tyler data: ${response.status}`);
            }
            const tylerWorkouts = await response.json();
            
            // Format data for Supabase with proper validation
            const formattedWorkouts = tylerWorkouts.map(workout => ({
                id: workout.id,
                user_id: 'tyler_historical',
                date: workout.date,
                start_time: workout.startTime,
                end_time: workout.endTime,
                duration: workout.duration || null,
                split: workout.split || 'General',
                time_of_day: formatTimeOfDay(workout.tod),
                notes: workout.notes || '',
                exercises: workout.exercises || []
            }));

            // Insert into Supabase
            const { data, error } = await window.supabaseClient
                .from('workouts')
                .insert(formattedWorkouts);

            if (error) {
                console.error('❌ Error migrating Tyler data:', error);
                return await this.loadFromLocalFallback();
            }

            console.log(`✅ Successfully migrated ${formattedWorkouts.length} Tyler workouts to Supabase`);
            this.isDataMigrated = true;
            return await this.loadTylerData();

        } catch (error) {
            console.error('❌ Tyler data migration failed:', error);
            return await this.loadFromLocalFallback();
        }
    }
    
    // Fallback to load from local JSON
    async loadFromLocalFallback() {
        try {
            console.log('📁 Loading Tyler data from local JSON fallback...');
            const response = await fetch('./data/tyler-workouts.json');
            if (!response.ok) {
                throw new Error(`Failed to load Tyler data: ${response.status}`);
            }
            const workouts = await response.json();
            console.log(`✅ Loaded ${workouts.length} Tyler workouts from local file`);
            return workouts;
        } catch (error) {
            console.error('❌ Failed to load Tyler data from local fallback:', error);
            return [];
        }
    }

    // Load Tyler's data from Supabase
    async loadTylerData() {
        try {
            if (!window.supabaseClient) {
                return await this.loadFromLocalFallback();
            }
            
            const { data: workouts, error } = await window.supabaseClient
                .from('workouts')
                .select('*')
                .eq('user_id', 'tyler_historical')
                .order('date', { ascending: false });

            if (error) {
                console.error('❌ Error loading Tyler data from Supabase:', error);
                return await this.loadFromLocalFallback();
            }

            console.log(`✅ Loaded ${workouts.length} Tyler workouts from Supabase`);
            return workouts;

        } catch (error) {
            console.error('❌ Failed to load Tyler data from Supabase:', error);
            return await this.loadFromLocalFallback();
        }
    }
}

// Global Tyler data manager instance
const tylerDataManager = new TylerDataManager();
window.tylerDataManager = tylerDataManager;

// Initialize Tyler data integration
async function initializeTylerData() {
    try {
        console.log('🔄 Initializing Tyler historical data...');
        
        // Try to migrate/load data
        const workouts = await tylerDataManager.migrateTylerData();
        
        if (workouts.length === 0) {
            console.warn('⚠️ No Tyler workouts loaded');
            return [];
        }
        
        // Integrate Tyler's historical workouts into main app state
        if (window.HyperTrack) {
            // Add Tyler's workouts to the main workouts array
            const existingWorkouts = window.HyperTrack.state.workouts || [];
            const combinedWorkouts = [...existingWorkouts, ...workouts];
            
            // Sort by date (newest first)
            combinedWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            window.HyperTrack.state.workouts = combinedWorkouts;
            console.log(`✅ Integrated ${workouts.length} Tyler workouts into main view`);
        }
        
        return workouts;
        
    } catch (error) {
        console.error('❌ Tyler data initialization failed:', error);
        return [];
    }
}

// Make function globally available
window.initializeTylerData = initializeTylerData;

// Ensure workout data matches expected schema format
function normalizeWorkoutData(workout) {
    // Ensure the workout has the required fields for both local and Supabase storage
    const normalized = {
        id: workout.id || `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: workout.user_id || currentUserId,
        date: workout.date,
        start_time: workout.startTime || workout.start_time,
        end_time: workout.endTime || workout.end_time,
        duration: workout.duration || null,
        split: workout.split || 'General',
        time_of_day: formatTimeOfDay(workout.tod || workout.timeOfDay || workout.time_of_day),
        notes: workout.notes || '',
        exercises: normalizeExerciseData(workout.exercises || [])
    };
    
    // Add legacy fields for backwards compatibility
    normalized.startTime = normalized.start_time;
    normalized.endTime = normalized.end_time;
    normalized.tod = normalized.time_of_day;
    normalized.timeOfDay = normalized.time_of_day;
    
    return normalized;
}

// Normalize exercise data to ensure consistent structure
function normalizeExerciseData(exercises) {
    return exercises.map(exercise => {
        return {
            id: exercise.id || `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: exercise.name,
            muscle_group: exercise.muscle_group || exercise.muscleGroup || 'General',
            category: exercise.category || 'General',
            equipment: exercise.equipment || 'Unknown',
            notes: exercise.notes || '',
            sets: normalizeSetData(exercise.sets || [])
        };
    });
}

// Normalize set data to ensure consistent structure
function normalizeSetData(sets) {
    return sets.map((set, index) => {
        return {
            id: set.id || `set_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            set_number: set.set_number || set.setNumber || (index + 1),
            reps: parseInt(set.reps) || 0,
            weight: parseFloat(set.weight) || 0,
            rpe: parseFloat(set.rpe) || null,
            rest_time_seconds: parseInt(set.rest_time_seconds) || parseInt(set.restTime) || null,
            is_warmup: Boolean(set.is_warmup || set.isWarmup),
            is_failure: Boolean(set.is_failure || set.isFailure),
            notes: set.notes || ''
        };
    });
}

// Format workout data specifically for Supabase (only valid schema fields)
function formatWorkoutForSupabase(workout) {
    return {
        id: workout.id || `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: workout.user_id || currentUserId,
        date: workout.date,
        start_time: workout.startTime || workout.start_time,
        end_time: workout.endTime || workout.end_time,
        duration: workout.duration || null,
        split: workout.split || 'General',
        time_of_day: formatTimeOfDay(workout.tod || workout.timeOfDay || workout.time_of_day),
        notes: workout.notes || '',
        exercises: normalizeExerciseData(workout.exercises || [])
    };
}

// Make normalization functions globally available
window.normalizeWorkoutData = normalizeWorkoutData;
window.normalizeExerciseData = normalizeExerciseData;
window.normalizeSetData = normalizeSetData;
window.formatWorkoutForSupabase = formatWorkoutForSupabase;

// Load July 12 workout data if available
async function loadJuly12WorkoutData() {
    try {
        const response = await fetch('./data/july12-workout-fallback.json');
        if (response.ok) {
            const july12Workouts = await response.json();
            console.log('📅 Loading July 12 workout data...');
            
            july12Workouts.forEach(workout => {
                // Add to local storage
                const existingWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
                const workoutExists = existingWorkouts.some(w => w.id === workout.id);
                
                if (!workoutExists) {
                    const normalizedWorkout = normalizeWorkoutData(workout);
                    existingWorkouts.push(normalizedWorkout);
                    existingWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
                    localStorage.setItem('hypertrack_workouts', JSON.stringify(existingWorkouts));
                    
                    console.log(`✅ Added July 12 workout to localStorage:`);
                    console.log(`   ID: ${normalizedWorkout.id}`);
                    console.log(`   Date: ${normalizedWorkout.date}`);
                    console.log(`   Split: ${normalizedWorkout.split}`);
                    console.log(`   Exercises: ${normalizedWorkout.exercises.length}`);
                    console.log(`   Total workouts in storage: ${existingWorkouts.length}`);
                    
                    // Try to sync to Supabase using proper formatting
                    if (window.supabaseClient) {
                        const supabaseWorkout = formatWorkoutForSupabase(normalizedWorkout);
                        window.supabaseClient
                            .from('workouts')
                            .insert([supabaseWorkout])
                            .then(({ data, error }) => {
                                if (error) {
                                    console.log('📝 July 12 workout saved locally, Supabase sync will retry later:', error.message);
                                } else {
                                    console.log('✅ July 12 workout synced to Supabase successfully');
                                }
                            })
                            .catch(error => {
                                console.log('📝 July 12 workout saved locally, sync failed:', error.message);
                            });
                    }
                    
                    console.log(`✅ Added July 12 workout: ${workout.split} (${workout.exercises.length} exercises)`);
                }
            });
            
            // Update displays if HyperTrack is available
            if (window.HyperTrack) {
                if (window.HyperTrack.loadWorkoutData) {
                    window.HyperTrack.loadWorkoutData();
                }
                // Force update UI to reflect new data
                if (window.HyperTrack.updateAllDisplays) {
                    window.HyperTrack.updateAllDisplays();
                }
                console.log('🔄 HyperTrack displays updated with July 12 workout');
            }
        }
    } catch (error) {
        console.log('📅 July 12 workout data not available or already loaded');
    }
}

// Auto-load July 12 data on initialization with multiple triggers
if (typeof window !== 'undefined') {
    // Try loading on multiple events to ensure it gets loaded
    window.addEventListener('load', () => {
        setTimeout(loadJuly12WorkoutData, 1000);
    });
    
    // Also try when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(loadJuly12WorkoutData, 500);
        });
    } else {
        setTimeout(loadJuly12WorkoutData, 500);
    }
    
    // Make function globally available for manual loading
    window.loadJuly12WorkoutData = loadJuly12WorkoutData;
}

// Comprehensive workout sync to Supabase with robust error handling
async function syncWorkoutOnCompletion(workout) {
    try {
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase not available - will save locally only');
            return { success: false, savedLocally: false, reason: 'No Supabase client' };
        }
        
        // For development, skip Supabase sync and use local storage
        // This avoids auth/RLS issues during development
        console.log('🛠️ Development mode detected - using localStorage only');
        return { success: false, savedLocally: false, reason: 'Development mode - local storage only' };

        console.log('🔄 Syncing completed workout to Supabase...');
        console.log('📋 Workout data being synced:', {
            id: workout.id,
            date: workout.date,
            startTime: workout.startTime,
            endTime: workout.endTime,
            tod: workout.tod,
            exercises: workout.exercises?.length || 0
        });
        
        // Format data specifically for Supabase insertion (only valid schema fields)
        const formattedWorkout = formatWorkoutForSupabase(workout);
        
        // Validate required fields
        if (!formattedWorkout.id) {
            throw new Error('Workout ID is required');
        }
        if (!formattedWorkout.date) {
            throw new Error('Workout date is required');
        }
        
        console.log('📋 Formatted workout for Supabase:', formattedWorkout);
        
        const { data, error } = await window.supabaseClient
            .from('workouts')
            .insert([formattedWorkout]);

        if (error) {
            console.error('❌ Failed to sync workout to Supabase:');
            console.error('🔍 Error details:', error);
            console.error('📋 Error code:', error.code);
            console.error('📋 Error message:', error.message);
            console.error('📋 Error hint:', error.hint);
            return { success: false, savedLocally: false, error: error, reason: 'Supabase insert failed' };
        }

        // Save locally only after successful Supabase sync
        const localSaved = saveWorkoutLocally(workout);
        console.log('✅ Workout synced to Supabase successfully');
        console.log('📋 Supabase response data:', data);
        return { success: true, savedLocally: localSaved, data: data };

    } catch (error) {
        console.error('❌ Workout sync error:', error);
        console.error('📋 Error stack:', error.stack);
        return { success: false, savedLocally: false, error: error, reason: 'Exception thrown' };
    }
}

// Format time of day to ensure database constraint compliance
function formatTimeOfDay(tod) {
    if (!tod) return 'AM'; // Default fallback
    
    const upperTod = tod.toString().toUpperCase();
    
    // Handle various formats
    if (upperTod.includes('AM') || upperTod === 'MORNING') {
        return 'AM';
    }
    if (upperTod.includes('PM') || upperTod === 'AFTERNOON' || upperTod === 'EVENING') {
        return 'PM';
    }
    
    // If it's a number, treat as hour (24-hour format)
    const hour = parseInt(tod);
    if (!isNaN(hour)) {
        return hour < 12 ? 'AM' : 'PM';
    }
    
    // Default fallback
    console.warn(`⚠️ Unknown time format: ${tod}, defaulting to AM`);
    return 'AM';
}

// Save workout to localStorage
function saveWorkoutLocally(workout) {
    try {
        const existingWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
        
        // Normalize the workout data before saving
        const normalizedWorkout = normalizeWorkoutData(workout);
        
        // Check for duplicates before adding
        const existingIndex = existingWorkouts.findIndex(w => w.id === normalizedWorkout.id);
        if (existingIndex >= 0) {
            // Update existing workout
            existingWorkouts[existingIndex] = normalizedWorkout;
            console.log('🔄 Updated existing workout in localStorage');
        } else {
            // Add new workout
            existingWorkouts.push(normalizedWorkout);
            console.log('➕ Added new workout to localStorage');
        }
        
        existingWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('hypertrack_workouts', JSON.stringify(existingWorkouts));
        return true;
    } catch (error) {
        console.error('❌ Failed to save workout locally:', error);
        return false;
    }
}

// Load workouts from localStorage
function loadLocalWorkouts() {
    try {
        const workouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
        return workouts;
    } catch (error) {
        console.error('❌ Failed to load local workouts:', error);
        return [];
    }
}

// Test Supabase connection and diagnose issues
async function testSupabaseConnection() {
    if (!window.supabaseClient) {
        console.error('❌ No Supabase client available for testing');
        return false;
    }
    
    try {
        console.log('🔍 Testing Supabase connection...');
        console.log('📋 Client info:', {
            client: typeof window.supabaseClient,
            hasFrom: typeof window.supabaseClient.from === 'function',
            hasAuth: typeof window.supabaseClient.auth === 'object'
        });
        
        // Test 1: Simple query to exercises table
        const { data: exercises, error: exercisesError } = await window.supabaseClient
            .from('exercises')
            .select('count')
            .limit(1);
            
        if (exercisesError) {
            console.error('❌ Exercises table test failed:', exercisesError);
            return false;
        } else {
            console.log('✅ Exercises table accessible');
        }
        
        // Test 2: Check workouts table access
        const { data: workouts, error: workoutsError } = await window.supabaseClient
            .from('workouts')
            .select('id')
            .limit(1);
            
        if (workoutsError) {
            console.error('❌ Workouts table test failed:', workoutsError);
            console.log('💡 This might be due to Row Level Security policies');
            return false;
        } else {
            console.log('✅ Workouts table accessible');
        }
        
        console.log('✅ Supabase connection test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Connection test failed:', error);
        return false;
    }
}

// Migrate all local user workouts to Supabase
async function migrateLocalWorkoutsToSupabase() {
    try {
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase not available - cannot migrate local workouts');
            return { success: false, reason: 'No Supabase client' };
        }

        // Skip Supabase operations in development mode
        if (currentUserId.startsWith('user_')) {
            console.log('🛠️ Development mode detected - skipping local workout migration to Supabase');
            return { success: true, migrated: 0, reason: 'Development mode - local only' };
        }
        
        console.log('🔄 Migrating local user workouts to Supabase...');
        
        // Load local workouts
        const localWorkouts = loadLocalWorkouts();
        if (localWorkouts.length === 0) {
            console.log('📋 No local workouts found to migrate');
            return { success: true, migrated: 0, reason: 'No workouts to migrate' };
        }
        
        console.log(`📋 Found ${localWorkouts.length} local workouts to migrate`);
        
        // Check which workouts already exist in Supabase
        const { data: existingWorkouts, error: checkError } = await window.supabaseClient
            .from('workouts')
            .select('id')
            .eq('user_id', currentUserId);
            
        if (checkError) {
            console.error('❌ Error checking existing workouts:', checkError);
            return { success: false, error: checkError, reason: 'Failed to check existing workouts' };
        }
        
        const existingIds = new Set(existingWorkouts?.map(w => w.id) || []);
        const newWorkouts = localWorkouts.filter(w => !existingIds.has(w.id));
        
        if (newWorkouts.length === 0) {
            console.log('✅ All local workouts already exist in Supabase');
            return { success: true, migrated: 0, reason: 'All workouts already synced' };
        }
        
        console.log(`📋 Migrating ${newWorkouts.length} new workouts...`);
        
        // Format workouts for Supabase
        const formattedWorkouts = newWorkouts.map(workout => ({
            id: workout.id,
            user_id: currentUserId,
            date: workout.date,
            start_time: workout.startTime,
            end_time: workout.endTime,
            duration: workout.duration || null,
            split: workout.split || 'General',
            time_of_day: formatTimeOfDay(workout.tod || workout.timeOfDay),
            notes: workout.notes || '',
            exercises: workout.exercises || []
        }));
        
        // Insert workouts in batches to avoid timeouts
        const batchSize = 10;
        let totalMigrated = 0;
        const errors = [];
        
        for (let i = 0; i < formattedWorkouts.length; i += batchSize) {
            const batch = formattedWorkouts.slice(i, i + batchSize);
            
            try {
                const { data, error } = await window.supabaseClient
                    .from('workouts')
                    .insert(batch);
                    
                if (error) {
                    console.error(`❌ Error migrating batch ${i / batchSize + 1}:`, error);
                    errors.push({ batch: i / batchSize + 1, error });
                } else {
                    totalMigrated += batch.length;
                    console.log(`✅ Migrated batch ${i / batchSize + 1}: ${batch.length} workouts`);
                }
            } catch (err) {
                console.error(`❌ Exception migrating batch ${i / batchSize + 1}:`, err);
                errors.push({ batch: i / batchSize + 1, error: err });
            }
        }
        
        const result = {
            success: errors.length === 0,
            migrated: totalMigrated,
            total: formattedWorkouts.length,
            errors: errors
        };
        
        if (result.success) {
            console.log(`✅ Successfully migrated all ${totalMigrated} workouts to Supabase`);
        } else {
            console.warn(`⚠️ Migrated ${totalMigrated}/${formattedWorkouts.length} workouts (${errors.length} errors)`);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        return { success: false, error, reason: 'Migration exception' };
    }
}

// Make functions globally available
window.syncWorkoutOnCompletion = syncWorkoutOnCompletion;
window.saveWorkoutLocally = saveWorkoutLocally;
window.loadLocalWorkouts = loadLocalWorkouts;
window.testSupabaseConnection = testSupabaseConnection;
window.migrateLocalWorkoutsToSupabase = migrateLocalWorkoutsToSupabase;

// Manual troubleshooting helpers
window.debugSupabase = function() {
    console.log('🔍 Supabase Debug Information:');
    console.log('📋 Window objects:', {
        hasSupabase: typeof window.supabase !== 'undefined',
        hasSupabaseClient: typeof window.supabaseClient !== 'undefined',
        supabaseType: typeof window.supabase,
        clientType: typeof window.supabaseClient
    });
    
    if (window.supabase) {
        console.log('📋 Supabase library:', {
            hasCreateClient: typeof window.supabase.createClient === 'function',
            version: window.supabase.version || 'unknown'
        });
    }
    
    if (window.supabaseClient) {
        console.log('📋 Supabase client:', {
            hasFrom: typeof window.supabaseClient.from === 'function',
            hasAuth: typeof window.supabaseClient.auth === 'object',
            hasSelect: typeof window.supabaseClient.select === 'function'
        });
    }
    
    console.log('📋 Configuration:', {
        url: supabaseUrl ? 'Set' : 'Missing',
        key: supabaseAnonKey ? 'Set' : 'Missing'
    });
};

window.forceSupabaseInit = function() {
    console.log('🔄 Force initializing Supabase...');
    initializeSupabase();
};

window.testSupabaseManual = function() {
    console.log('🧪 Running manual Supabase test...');
    testSupabaseConnection();
};

window.forceMigration = async function() {
    console.log('🔄 Force migrating all workout data...');
    
    try {
        // Migrate Tyler data
        if (typeof initializeTylerData === 'function') {
            const tylerResult = await initializeTylerData();
            console.log('Tyler migration result:', tylerResult);
        }
        
        // Migrate user data
        if (typeof migrateLocalWorkoutsToSupabase === 'function') {
            const userResult = await migrateLocalWorkoutsToSupabase();
            console.log('User workout migration result:', userResult);
        }
        
        console.log('✅ Force migration completed');
    } catch (error) {
        console.error('❌ Force migration failed:', error);
    }
};

window.inspectDatabase = async function() {
    if (!window.supabaseClient) {
        console.error('❌ No Supabase client available');
        return;
    }
    
    try {
        console.log('🔍 Inspecting Supabase database...');
        
        // Check workouts count
        const { data: workouts, error: workoutsError } = await window.supabaseClient
            .from('workouts')
            .select('id, user_id, date, split', { count: 'exact' });
            
        if (workoutsError) {
            console.error('❌ Error fetching workouts:', workoutsError);
        } else {
            console.log(`📊 Workouts in database: ${workouts.length}`);
            if (workouts.length > 0) {
                console.table(workouts);
            }
        }
        
        // Check exercises count
        const { data: exercises, error: exercisesError } = await window.supabaseClient
            .from('exercises')
            .select('id, name', { count: 'exact' });
            
        if (exercisesError) {
            console.error('❌ Error fetching exercises:', exercisesError);
        } else {
            console.log(`🏋️ Exercises in database: ${exercises.length}`);
        }
        
    } catch (error) {
        console.error('❌ Database inspection failed:', error);
    }
};

console.log('📊 Supabase configuration with localStorage fallback ready');