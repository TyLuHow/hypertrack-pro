#!/usr/bin/env node

// Check workouts in Supabase database for specific dates
// This script connects to the HyperTrack Pro Supabase database and queries for July 8-9, 2025 workouts

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://zrmkzgwrmohhbmjfdxdf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybWt6Z3dybW9oaGJtamZkeGRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE2NjA4OCwiZXhwIjoyMDY2NzQyMDg4fQ.XTXmEVHydMu-SDmXSDgVBroJNVN6u9197O6p3uekvoU';

// Create Supabase client with service role for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to migrate Tyler's historical data
async function migrateTylerData() {
    try {
        console.log('📥 Loading Tyler workout data from local JSON...');
        
        // Read the Tyler workouts data directly from file system
        const fs = require('fs');
        const path = require('path');
        
        const tylerDataPath = path.join(__dirname, 'data', 'tyler-workouts.json');
        const tylerWorkouts = JSON.parse(fs.readFileSync(tylerDataPath, 'utf8'));
        
        console.log(`📊 Found ${tylerWorkouts.length} Tyler workouts to migrate`);
        
        // Check if data already exists
        const { data: existingWorkouts, error: checkError } = await supabase
            .from('workouts')
            .select('id')
            .eq('user_id', 'tyler_historical')
            .limit(1);

        if (checkError) {
            console.error('❌ Error checking existing Tyler data:', checkError);
            return;
        }

        if (existingWorkouts && existingWorkouts.length > 0) {
            console.log('✅ Tyler data already exists in Supabase');
            return;
        }

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

        console.log('📤 Inserting Tyler workouts into Supabase...');
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('workouts')
            .insert(formattedWorkouts);

        if (error) {
            console.error('❌ Error migrating Tyler data:', error);
            console.error('🔍 Error details:', error.message);
            return;
        }

        console.log(`✅ Successfully migrated ${formattedWorkouts.length} Tyler workouts to Supabase`);
        
    } catch (error) {
        console.error('❌ Tyler data migration failed:', error);
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

async function checkWorkouts() {
    console.log('🔗 Connecting to HyperTrack Pro Supabase database...');
    console.log('📅 Checking for workouts on July 8-9, 2025');
    console.log('=' .repeat(60));
    
    // First, let's try to migrate Tyler's data to ensure it's in the database
    console.log('🔄 Attempting to migrate Tyler historical data first...');
    await migrateTylerData();
    
    try {
        // Test connection first
        const { data: connectionTest, error: connectionError } = await supabase
            .from('workouts')
            .select('count')
            .limit(1);
            
        if (connectionError) {
            console.error('❌ Connection failed:', connectionError);
            return;
        }
        
        console.log('✅ Successfully connected to Supabase');
        console.log('');
        
        // 1. Query specifically for July 8, 2025
        console.log('📋 Checking July 8, 2025 workouts...');
        const { data: july8Workouts, error: july8Error } = await supabase
            .from('workouts')
            .select('*')
            .eq('date', '2025-07-08')
            .order('start_time', { ascending: true });
            
        if (july8Error) {
            console.error('❌ Error querying July 8 workouts:', july8Error);
        } else {
            console.log(`📊 Found ${july8Workouts.length} workouts on July 8, 2025:`);
            july8Workouts.forEach((workout, index) => {
                console.log(`  ${index + 1}. ID: ${workout.id}`);
                console.log(`     User: ${workout.user_id}`);
                console.log(`     Time: ${workout.start_time} - ${workout.end_time}`);
                console.log(`     Duration: ${workout.duration} minutes`);
                console.log(`     Split: ${workout.split}`);
                console.log(`     Time of Day: ${workout.time_of_day}`);
                console.log(`     Exercises: ${workout.exercises ? workout.exercises.length : 0}`);
                if (workout.notes) {
                    console.log(`     Notes: ${workout.notes}`);
                }
                console.log('');
            });
        }
        
        // 2. Query specifically for July 9, 2025
        console.log('📋 Checking July 9, 2025 workouts...');
        const { data: july9Workouts, error: july9Error } = await supabase
            .from('workouts')
            .select('*')
            .eq('date', '2025-07-09')
            .order('start_time', { ascending: true });
            
        if (july9Error) {
            console.error('❌ Error querying July 9 workouts:', july9Error);
        } else {
            console.log(`📊 Found ${july9Workouts.length} workouts on July 9, 2025:`);
            july9Workouts.forEach((workout, index) => {
                console.log(`  ${index + 1}. ID: ${workout.id}`);
                console.log(`     User: ${workout.user_id}`);
                console.log(`     Time: ${workout.start_time} - ${workout.end_time}`);
                console.log(`     Duration: ${workout.duration} minutes`);
                console.log(`     Split: ${workout.split}`);
                console.log(`     Time of Day: ${workout.time_of_day}`);
                console.log(`     Exercises: ${workout.exercises ? workout.exercises.length : 0}`);
                if (workout.notes) {
                    console.log(`     Notes: ${workout.notes}`);
                }
                console.log('');
            });
        }
        
        // 3. Get total count of all workouts
        console.log('📊 Getting total workout count...');
        const { data: allWorkouts, error: countError } = await supabase
            .from('workouts')
            .select('id, user_id, date', { count: 'exact' });
            
        if (countError) {
            console.error('❌ Error getting total count:', countError);
        } else {
            console.log(`📈 Total workouts in database: ${allWorkouts.length}`);
            
            // Group by user
            const userCounts = {};
            allWorkouts.forEach(workout => {
                userCounts[workout.user_id] = (userCounts[workout.user_id] || 0) + 1;
            });
            
            console.log('👥 Workouts by user:');
            Object.entries(userCounts).forEach(([userId, count]) => {
                console.log(`  ${userId}: ${count} workouts`);
            });
            console.log('');
        }
        
        // 4. Get workout breakdown by date (last 14 days)
        console.log('📅 Recent workout breakdown (last 14 days):');
        const { data: recentWorkouts, error: recentError } = await supabase
            .from('workouts')
            .select('date, user_id, split')
            .gte('date', '2025-06-27')  // Last 14 days from July 11
            .order('date', { ascending: false });
            
        if (recentError) {
            console.error('❌ Error getting recent workouts:', recentError);
        } else {
            const dateGroups = {};
            recentWorkouts.forEach(workout => {
                if (!dateGroups[workout.date]) {
                    dateGroups[workout.date] = [];
                }
                dateGroups[workout.date].push(workout);
            });
            
            Object.entries(dateGroups)
                .sort(([a], [b]) => b.localeCompare(a))  // Sort dates descending
                .forEach(([date, workouts]) => {
                    console.log(`  ${date}: ${workouts.length} workouts`);
                    workouts.forEach(w => {
                        console.log(`    - ${w.user_id} (${w.split})`);
                    });
                });
        }
        
        // 5. Show detailed exercises for July 8-9 workouts if they exist
        const july89Workouts = [...(july8Workouts || []), ...(july9Workouts || [])];
        if (july89Workouts.length > 0) {
            console.log('');
            console.log('🏋️ Detailed exercise data for July 8-9, 2025:');
            console.log('=' .repeat(60));
            
            july89Workouts.forEach((workout, index) => {
                console.log(`\nWorkout ${index + 1} - ${workout.date} (${workout.user_id})`);
                console.log(`Time: ${workout.start_time} - ${workout.end_time}`);
                console.log(`Split: ${workout.split}`);
                
                if (workout.exercises && workout.exercises.length > 0) {
                    console.log('Exercises:');
                    workout.exercises.forEach((exercise, exerciseIndex) => {
                        console.log(`  ${exerciseIndex + 1}. ${exercise.name || 'Unknown Exercise'}`);
                        if (exercise.sets && exercise.sets.length > 0) {
                            exercise.sets.forEach((set, setIndex) => {
                                console.log(`     Set ${setIndex + 1}: ${set.weight || 'N/A'}lbs × ${set.reps || 'N/A'} reps`);
                            });
                        }
                    });
                } else {
                    console.log('No exercises recorded');
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Script execution failed:', error);
    }
}

// Run the check
checkWorkouts().then(() => {
    console.log('');
    console.log('✅ Workout check completed');
}).catch(error => {
    console.error('❌ Failed to check workouts:', error);
});