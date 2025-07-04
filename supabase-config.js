// Supabase Configuration and Client Setup
// HyperTrack Pro - Database Integration

// Supabase configuration for HyperTrack Pro
const SUPABASE_URL = 'https://zrmkzgwrmohhbmjfdxdf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWt6Z3dybW9oaGJtamZkeGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjYwODgsImV4cCI6MjA2Njc0MjA4OH0.DJC-PLTnxG8IG-iV7_irb2pnEZJFacDOd9O7RDWwTVU';

// Project Details:
// Dashboard: https://supabase.com/dashboard/project/zrmkzgwrmohhbmjfdxdf
// Database Connection: postgresql://postgres:TylerLH090102@@db.zrmkzgwrmohhbmjfdxdf.supabase.co:5432/postgres

// Import Supabase client (we'll load this via CDN in HTML)
let supabase;

// Initialize Supabase client
function initializeSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase not loaded. Make sure to include the Supabase CDN in index.html');
        return false;
    }
    
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized successfully');
    return true;
}

// Database Configuration
const DATABASE_CONFIG = {
    // Enable Row Level Security for all tables
    rls_enabled: true,
    
    // Database schema version for migrations
    schema_version: '1.0.0',
    
    // Table configurations
    tables: {
        users: {
            name: 'users',
            primary_key: 'id',
            columns: [
                'id', 'email', 'username', 'created_at', 'updated_at',
                'training_level', 'bodyweight', 'timezone', 'preferences'
            ]
        },
        workouts: {
            name: 'workouts',
            primary_key: 'id',
            foreign_keys: ['user_id'],
            columns: [
                'id', 'user_id', 'workout_date', 'start_time', 'end_time',
                'duration', 'split_type', 'tod', 'notes', 'total_volume',
                'total_sets', 'created_at', 'updated_at'
            ]
        },
        exercises: {
            name: 'exercises',
            primary_key: 'id',
            columns: [
                'id', 'name', 'muscle_group', 'category', 'tier',
                'mvc_percentage', 'equipment', 'gym_types',
                'biomechanical_function', 'target_rep_range', 'rest_period',
                'created_at', 'updated_at'
            ]
        },
        workout_exercises: {
            name: 'workout_exercises',
            primary_key: 'id',
            foreign_keys: ['workout_id', 'exercise_id'],
            columns: [
                'id', 'workout_id', 'exercise_id', 'exercise_order',
                'notes', 'created_at'
            ]
        },
        sets: {
            name: 'sets',
            primary_key: 'id',
            foreign_keys: ['workout_exercise_id'],
            columns: [
                'id', 'workout_exercise_id', 'set_number', 'weight',
                'reps', 'rpe', 'rest_duration', 'completed_at',
                'created_at'
            ]
        },
        user_settings: {
            name: 'user_settings',
            primary_key: 'id',
            foreign_keys: ['user_id'],
            columns: [
                'id', 'user_id', 'show_research_facts', 'dark_mode',
                'auto_start_rest_timer', 'compound_rest', 'isolation_rest',
                'progression_rate', 'training_level', 'created_at', 'updated_at'
            ]
        }
    }
};

// Export configuration for use in other modules
window.DATABASE_CONFIG = DATABASE_CONFIG;
window.initializeSupabase = initializeSupabase;