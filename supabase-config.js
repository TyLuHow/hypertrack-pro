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
            console.log('✅ Supabase client created');
            console.log('🔍 Client type:', typeof window.supabaseClient);
            console.log('🔍 Has .from method:', typeof window.supabaseClient?.from === 'function');
            
            // Test the connection immediately
            setTimeout(testSupabaseConnection, 500);
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
            
            console.log('🔄 Migrating Tyler historical data to Supabase...');
            
            // Test if we can access the workouts table
            try {
                const { data: testData, error: testError } = await window.supabaseClient
                    .from('workouts')
                    .select('id')
                    .limit(1);
                    
                if (testError) {
                    console.error('❌ Cannot access workouts table:', testError);
                    return await this.loadFromLocalFallback();
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
            
            // Format data for Supabase
            const formattedWorkouts = tylerWorkouts.map(workout => ({
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

// Sync workout to Supabase with localStorage fallback
async function syncWorkoutOnCompletion(workout) {
    try {
        // Always save locally first
        const localSaved = saveWorkoutLocally(workout);
        
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase not available - workout saved locally only');
            return localSaved;
        }

        console.log('🔄 Syncing completed workout to Supabase...');
        
        const { data, error } = await window.supabaseClient
            .from('workouts')
            .insert([{
                id: workout.id,
                user_id: currentUserId,
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
            console.log('💾 Workout still saved locally');
            return localSaved;
        }

        console.log('✅ Workout synced to Supabase successfully');
        return true;

    } catch (error) {
        console.error('❌ Workout sync error:', error);
        return saveWorkoutLocally(workout);
    }
}

// Save workout to localStorage
function saveWorkoutLocally(workout) {
    try {
        const existingWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
        existingWorkouts.push(workout);
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

// Make functions globally available
window.syncWorkoutOnCompletion = syncWorkoutOnCompletion;
window.saveWorkoutLocally = saveWorkoutLocally;
window.loadLocalWorkouts = loadLocalWorkouts;
window.testSupabaseConnection = testSupabaseConnection;

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

console.log('📊 Supabase configuration with localStorage fallback ready');