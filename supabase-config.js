// Simplified Supabase Configuration for HyperTrack Pro
console.log('🔗 Initializing Supabase configuration...');

// Supabase configuration - use demo credentials if none provided
const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) || 'https://demo.supabase.co'
const supabaseAnonKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) || 'demo-key'

// Simple user ID - just use 'tyler' for now
const currentUserId = 'tyler';

// Global Supabase client variable
let supabaseClient = null;

// Simple Supabase initialization
function initializeSupabase() {
    try {
        // Wait for Supabase library to be available
        if (typeof window.supabase === 'undefined') {
            console.log('⏳ Waiting for Supabase library...');
            setTimeout(initializeSupabase, 100);
            return;
        }
        
        // Create client only if we have valid credentials
        if (supabaseUrl !== 'https://demo.supabase.co' && supabaseAnonKey !== 'demo-key') {
            supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
            window.supabaseClient = supabaseClient;
            console.log('✅ Supabase client initialized successfully');
        } else {
            console.warn('⚠️ Using demo credentials - Supabase features disabled');
            supabaseClient = null;
            window.supabaseClient = null;
        }
        
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        supabaseClient = null;
        window.supabaseClient = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
    initializeSupabase();
}

// Simple local data management - no Supabase required
class LocalDataManager {
    constructor() {
        this.tylerData = null;
    }

    // Load Tyler's data from local JSON file
    async loadTylerData() {
        try {
            console.log('📁 Loading Tyler data from local JSON...');
            
            // Load from local file
            const response = await fetch('./data/tyler-workouts.json');
            if (!response.ok) {
                throw new Error(`Failed to load Tyler data: ${response.status}`);
            }
            
            const workouts = await response.json();
            console.log(`✅ Loaded ${workouts.length} Tyler workouts from local file`);
            
            // Store in instance
            this.tylerData = workouts;
            
            return workouts;
            
        } catch (error) {
            console.error('❌ Failed to load Tyler data:', error);
            return [];
        }
    }
}

// Global local data manager instance
const localDataManager = new LocalDataManager();
window.localDataManager = localDataManager;

// Initialize Tyler data from local files
async function initializeTylerData() {
    try {
        console.log('🔄 Initializing Tyler historical data...');
        
        // Load Tyler's workouts from local JSON
        const workouts = await localDataManager.loadTylerData();
        
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

// Simple workout saving to localStorage
function saveWorkoutLocally(workout) {
    try {
        console.log('💾 Saving workout locally...');
        
        // Get existing workouts from localStorage
        const existingWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
        
        // Add new workout
        existingWorkouts.push(workout);
        
        // Sort by date (newest first)
        existingWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Save back to localStorage
        localStorage.setItem('hypertrack_workouts', JSON.stringify(existingWorkouts));
        
        console.log('✅ Workout saved locally');
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
        console.log(`📁 Loaded ${workouts.length} workouts from localStorage`);
        return workouts;
    } catch (error) {
        console.error('❌ Failed to load local workouts:', error);
        return [];
    }
}

// Make functions globally available
window.saveWorkoutLocally = saveWorkoutLocally;
window.loadLocalWorkouts = loadLocalWorkouts;

console.log('💾 Local storage configuration loaded - ready for offline use');