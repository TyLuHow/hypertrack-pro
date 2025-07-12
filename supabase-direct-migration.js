#!/usr/bin/env node

// Direct Supabase Migration Script
// This script writes workout data directly to Supabase using the JavaScript client

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🚀 Starting direct Supabase workout migration...');

// Mock Supabase client for Node.js environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

// Load existing tyler-workouts.json
const tylerWorkoutsPath = path.join(__dirname, 'data', 'tyler-workouts.json');
const existingWorkouts = JSON.parse(fs.readFileSync(tylerWorkoutsPath, 'utf8'));

console.log(`📊 Found ${existingWorkouts.length} existing workouts in tyler-workouts.json`);

// July 8-9 workouts data (provided by user)
const july8Exercises = [
    {"id": 1752025731506, "name": "Lat Pulldowns", "sets": [{"reps": 8, "weight": 175, "timestamp": "2025-07-09T01:42:39.965Z", "restTimeAfter": 141}, {"reps": 10, "weight": 160, "timestamp": "2025-07-09T01:45:01.265Z", "restTimeAfter": 227}, {"reps": 10, "weight": 160, "timestamp": "2025-07-09T01:48:48.457Z", "restTimeAfter": null}], "notes": "Sometimes I don't feel it in my last and it's more in my rhomboids. It's also very easy to feel lopsided and I never know if I'm leaning back too much", "category": "Compound", "muscle_group": "Vertical Pull"}, 
    {"id": 1752026427362, "name": "Smith Machine Rows", "sets": [{"reps": 10, "weight": 150, "timestamp": "2025-07-09T01:52:38.719Z", "restTimeAfter": 469}, {"reps": 10, "weight": 150, "timestamp": "2025-07-09T02:00:27.362Z", "restTimeAfter": 0}, {"reps": 8, "weight": 150, "timestamp": "2025-07-09T02:00:27.362Z", "restTimeAfter": null}], "notes": "", "category": "Compound", "muscle_group": "Horizontal Pull"}, 
    {"id": 1752026998514, "name": "Face Pulls", "sets": [{"reps": 15, "weight": 70, "timestamp": "2025-07-09T02:04:39.247Z", "restTimeAfter": 319}, {"reps": 16, "weight": 65, "timestamp": "2025-07-09T02:09:58.513Z", "restTimeAfter": 0}, {"reps": 17, "weight": 65, "timestamp": "2025-07-09T02:09:58.514Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Rear Delts"}, 
    {"id": 1752027704382, "name": "Dumbbell Bicep Curls", "sets": [{"reps": 9, "weight": 90, "timestamp": "2025-07-09T02:21:28.348Z", "restTimeAfter": 4}, {"reps": 12, "weight": 80, "timestamp": "2025-07-09T02:21:32.361Z", "restTimeAfter": 12}, {"reps": 10, "weight": 80, "timestamp": "2025-07-09T02:21:44.382Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Biceps"}, 
    {"id": 1752028180178, "name": "Cable Hammer Curls", "sets": [{"reps": 10, "weight": 60, "timestamp": "2025-07-09T02:25:32.250Z", "restTimeAfter": 132}, {"reps": 9, "weight": 60, "timestamp": "2025-07-09T02:27:44.739Z", "restTimeAfter": 115}, {"reps": 10, "weight": 60, "timestamp": "2025-07-09T02:29:40.178Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Biceps"}, 
    {"id": 1752028802606, "name": "Smith Machine Shoulder Press", "sets": [{"reps": 18, "weight": 75, "timestamp": "2025-07-09T02:40:02.606Z", "restTimeAfter": 0}, {"reps": 13, "weight": 115, "timestamp": "2025-07-09T02:40:02.606Z", "restTimeAfter": 0}, {"reps": 8, "weight": 135, "timestamp": "2025-07-09T02:40:02.606Z", "restTimeAfter": null}], "notes": "", "category": "Compound", "muscle_group": "Vertical Push"}
];

const july9Exercises = [
    {"id": 1752103264082, "name": "Cable Crunch Machine", "sets": [{"reps": 8, "weight": 200, "timestamp": "2025-07-09T23:21:04.082Z", "restTimeAfter": 0}, {"reps": 15, "weight": 180, "timestamp": "2025-07-09T23:21:04.082Z", "restTimeAfter": 0}, {"reps": 17, "weight": 170, "timestamp": "2025-07-09T23:21:04.082Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Abs"}, 
    {"id": 1752103801305, "name": "Russian Twists", "sets": [{"reps": 20, "weight": 25, "timestamp": "2025-07-09T23:30:01.305Z", "restTimeAfter": 0}, {"reps": 20, "weight": 25, "timestamp": "2025-07-09T23:30:01.305Z", "restTimeAfter": 0}, {"reps": 20, "weight": 25, "timestamp": "2025-07-09T23:30:01.305Z", "restTimeAfter": null}], "notes": "This was decline & reps were each side", "category": "Isolation", "muscle_group": "Abs"}, 
    {"id": 1752104610668, "name": "Planks", "sets": [{"reps": 120, "weight": 225, "timestamp": "2025-07-09T23:43:30.668Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Abs"}, 
    {"id": 1752105125954, "name": "Incline Dumbbell Press", "sets": [{"reps": 12, "weight": 120, "timestamp": "2025-07-09T23:52:05.954Z", "restTimeAfter": 0}, {"reps": 18, "weight": 120, "timestamp": "2025-07-09T23:52:05.954Z", "restTimeAfter": null}], "notes": "", "category": "Compound", "muscle_group": "Horizontal Push"}, 
    {"id": 1752105725827, "name": "Smith Machine Bench Press", "sets": [{"reps": 6, "weight": 190, "timestamp": "2025-07-10T00:02:05.827Z", "restTimeAfter": 0}, {"reps": 7, "weight": 185, "timestamp": "2025-07-10T00:02:05.827Z", "restTimeAfter": 0}, {"reps": 8, "weight": 185, "timestamp": "2025-07-10T00:02:05.827Z", "restTimeAfter": null}], "notes": "", "category": "Compound", "muscle_group": "Horizontal Push"}, 
    {"id": 1752106757476, "name": "Bodyweight Dips", "sets": [{"reps": 8, "weight": 225, "timestamp": "2025-07-10T00:19:17.476Z", "restTimeAfter": 0}, {"reps": 9, "weight": 225, "timestamp": "2025-07-10T00:19:17.476Z", "restTimeAfter": 0}, {"reps": 10, "weight": 225, "timestamp": "2025-07-10T00:19:17.476Z", "restTimeAfter": null}], "notes": "", "category": "Compound", "muscle_group": "Horizontal Push"}, 
    {"id": 1752107743440, "name": "Dumbbell Flyes", "sets": [{"reps": 15, "weight": 80, "timestamp": "2025-07-10T00:35:43.440Z", "restTimeAfter": 0}, {"reps": 15, "weight": 90, "timestamp": "2025-07-10T00:35:43.440Z", "restTimeAfter": 0}, {"reps": 13, "weight": 100, "timestamp": "2025-07-10T00:35:43.440Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Horizontal Push"}, 
    {"id": 1752108537141, "name": "Close-Grip Smith Machine Press", "sets": [{"reps": 10, "weight": 150, "timestamp": "2025-07-10T00:48:57.141Z", "restTimeAfter": 0}, {"reps": 8, "weight": 155, "timestamp": "2025-07-10T00:48:57.141Z", "restTimeAfter": 0}, {"reps": 11, "weight": 155, "timestamp": "2025-07-10T00:48:57.141Z", "restTimeAfter": null}], "notes": "", "category": "Compound", "muscle_group": "Triceps"}, 
    {"id": 1752109117782, "name": "Tricep Cable Rope Pulldowns", "sets": [{"reps": 14, "weight": 55, "timestamp": "2025-07-10T00:58:37.782Z", "restTimeAfter": 0}, {"reps": 15, "weight": 55, "timestamp": "2025-07-10T00:58:37.782Z", "restTimeAfter": 0}, {"reps": 14, "weight": 55, "timestamp": "2025-07-10T00:58:37.782Z", "restTimeAfter": null}], "notes": "", "category": "Isolation", "muscle_group": "Triceps"}
];

// HTTP client for Supabase REST API
async function supabaseRequest(method, endpoint, data = null) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
    };

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    console.log(`🔄 ${method} ${endpoint}`);
    
    try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        
        return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
        console.error(`❌ Error with ${method} ${endpoint}:`, error.message);
        throw error;
    }
}

function calculateTotalVolume(exercises) {
    return exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((exerciseTotal, set) => {
            return exerciseTotal + (set.reps * set.weight);
        }, 0);
    }, 0);
}

function calculateTotalVolumeFromApp(exercises) {
    return exercises.reduce((total, exercise) => {
        return total + exercise.sets.reduce((exerciseTotal, set) => {
            return exerciseTotal + (set.reps * set.weight);
        }, 0);
    }, 0);
}

async function insertWorkout(workoutData) {
    console.log(`📝 Inserting workout: ${workoutData.split} Day (${workoutData.date})`);
    
    // Insert workout
    await supabaseRequest('POST', 'workouts', workoutData);
    
    console.log(`✅ Workout inserted: ${workoutData.id}`);
}

// Note: Using simplified JSONB schema - exercises and sets stored in workout.exercises column

async function migrateWorkout(workout, isHistorical = false) {
    try {
        // Prepare workout data
        const startTime = new Date(workout.startTime);
        const endTime = new Date(workout.endTime);
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        
        const workoutData = {
            id: workout.id,
            user_id: 'tyler_user_id',
            date: workout.date,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: durationMinutes * 60000, // Convert to milliseconds to match app format
            split: workout.split,
            time_of_day: workout.tod || 'PM',
            notes: workout.notes || '',
            exercises: workout.exercises
        };
        
        // Insert workout (everything in JSONB)
        await insertWorkout(workoutData);
        
        console.log(`✅ Successfully migrated workout: ${workout.split} Day (${workout.date})`);
        return true;
        
    } catch (error) {
        console.error(`❌ Failed to migrate workout ${workout.id}:`, error.message);
        return false;
    }
}

async function migrateAppFormatWorkout(exercises, date, workoutType, workoutId) {
    try {
        // Calculate start and end times from exercise timestamps
        const allTimestamps = exercises.flatMap(ex => ex.sets.map(s => new Date(s.timestamp)));
        const startTime = new Date(Math.min(...allTimestamps));
        const endTime = new Date(Math.max(...allTimestamps));
        const duration = endTime - startTime; // Duration in milliseconds
        
        const workoutData = {
            id: workoutId,
            user_id: 'tyler_user_id',
            date: date,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration: duration,
            split: workoutType,
            time_of_day: startTime.getHours() < 12 ? 'AM' : 'PM',
            notes: '',
            exercises: exercises
        };
        
        // Insert workout (everything in JSONB)
        await insertWorkout(workoutData);
        
        console.log(`✅ Successfully migrated app format workout: ${workoutType} Day (${date})`);
        return true;
        
    } catch (error) {
        console.error(`❌ Failed to migrate app format workout:`, error.message);
        return false;
    }
}

async function main() {
    let successCount = 0;
    let failCount = 0;
    
    console.log('📊 Starting migration of all workout data...');
    
    // Check if fetch is available (Node.js 18+)
    if (typeof fetch === 'undefined') {
        console.error('❌ This script requires Node.js 18+ with fetch support');
        console.log('💡 Install with: npm install node-fetch');
        process.exit(1);
    }
    
    // Migrate historical workouts
    console.log(`\n🏛️ Migrating ${existingWorkouts.length} historical workouts...`);
    for (const workout of existingWorkouts) {
        const success = await migrateWorkout(workout, true);
        if (success) successCount++;
        else failCount++;
    }
    
    // Migrate July 8 workout
    console.log('\n📅 Migrating July 8 workout...');
    const july8Success = await migrateAppFormatWorkout(july8Exercises, '2025-07-08', 'Pull', 'july_8_2025');
    if (july8Success) successCount++;
    else failCount++;
    
    // Migrate July 9 workout
    console.log('\n📅 Migrating July 9 workout...');
    const july9Success = await migrateAppFormatWorkout(july9Exercises, '2025-07-09', 'Push', 'july_9_2025');
    if (july9Success) successCount++;
    else failCount++;
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successfully migrated: ${successCount} workouts`);
    console.log(`❌ Failed: ${failCount} workouts`);
    console.log(`📊 Total: ${successCount + failCount} workouts processed`);
    
    if (successCount > 0) {
        console.log('\n🔍 Verify your data at: https://supabase.com/dashboard/project/zrmkzgwrmohhbmjfdxdf/editor');
        console.log('🚀 Your app should now load all workouts from Supabase!');
    }
}

// Global fetch polyfill check and run
if (typeof globalThis.fetch === 'undefined') {
    console.log('⚠️ No native fetch found, attempting to load node-fetch...');
    try {
        const { default: fetch } = require('node-fetch');
        globalThis.fetch = fetch;
    } catch (error) {
        console.error('❌ Please install node-fetch: npm install node-fetch');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
});