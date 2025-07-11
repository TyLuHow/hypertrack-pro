#!/usr/bin/env node

// Migration script to move all workout data to Supabase
// This script transforms tyler-workouts.json data to Supabase format
// and adds the missing July 8-9 workouts

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting HyperTrack Pro data migration to Supabase...');

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

// Function to transform old tyler-workouts.json format to Supabase INSERT statements
function generateSupabaseInserts() {
    let workoutInserts = [];
    let workoutExerciseInserts = [];
    let setInserts = [];
    const userId = 'tyler_user_id'; // You'll need to replace with actual Tyler's user ID
    
    // Transform existing workouts
    existingWorkouts.forEach((workout, index) => {
        const workoutId = `historical_${index + 1}`;
        
        // Calculate duration
        const startTime = new Date(workout.startTime);
        const endTime = new Date(workout.endTime);
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        
        // Workout insert
        workoutInserts.push(`
INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('${workoutId}', '${userId}', '${workout.split} Day', '${workout.date}', '${startTime.toISOString().substr(11, 8)}', '${endTime.toISOString().substr(11, 8)}', ${durationMinutes}, '${workout.notes || ''}', '${workout.split}', ${calculateTotalVolume(workout.exercises)});`);
        
        // Exercise and set inserts
        workout.exercises.forEach((exercise, exerciseIndex) => {
            const workoutExerciseId = `${workoutId}_ex_${exerciseIndex + 1}`;
            
            workoutExerciseInserts.push(`
INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('${workoutExerciseId}', '${workoutId}', '${exercise.name}', ${exerciseIndex + 1}, '');`);
            
            exercise.sets.forEach((set, setIndex) => {
                setInserts.push(`
INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('${workoutExerciseId}', ${setIndex + 1}, ${set.reps}, ${set.weight}, NULL, '${set.timestamp}');`);
            });
        });
    });
    
    // Add July 8 workout
    const july8WorkoutId = 'july_8_2025';
    workoutInserts.push(`
INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('${july8WorkoutId}', '${userId}', 'Pull/Shoulder Day', '2025-07-08', '01:42:39', '02:40:02', 58, 'Pull day with shoulder work', 'Pull', ${calculateTotalVolumeFromApp(july8Exercises)});`);
    
    july8Exercises.forEach((exercise, exerciseIndex) => {
        const workoutExerciseId = `${july8WorkoutId}_ex_${exerciseIndex + 1}`;
        
        workoutExerciseInserts.push(`
INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('${workoutExerciseId}', '${july8WorkoutId}', '${exercise.name}', ${exerciseIndex + 1}, '${exercise.notes || ''}');`);
        
        exercise.sets.forEach((set, setIndex) => {
            setInserts.push(`
INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('${workoutExerciseId}', ${setIndex + 1}, ${set.reps}, ${set.weight}, ${set.restTimeAfter || 'NULL'}, '${set.timestamp}');`);
        });
    });
    
    // Add July 9 workout
    const july9WorkoutId = 'july_9_2025';
    workoutInserts.push(`
INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('${july9WorkoutId}', '${userId}', 'Push/Abs Day', '2025-07-09', '23:21:04', '00:58:37', 98, 'Push day with abs work', 'Push', ${calculateTotalVolumeFromApp(july9Exercises)});`);
    
    july9Exercises.forEach((exercise, exerciseIndex) => {
        const workoutExerciseId = `${july9WorkoutId}_ex_${exerciseIndex + 1}`;
        
        workoutExerciseInserts.push(`
INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('${workoutExerciseId}', '${july9WorkoutId}', '${exercise.name}', ${exerciseIndex + 1}, '${exercise.notes || ''}');`);
        
        exercise.sets.forEach((set, setIndex) => {
            setInserts.push(`
INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('${workoutExerciseId}', ${setIndex + 1}, ${set.reps}, ${set.weight}, ${set.restTimeAfter || 'NULL'}, '${set.timestamp}');`);
        });
    });
    
    return {
        workouts: workoutInserts,
        exercises: workoutExerciseInserts,
        sets: setInserts
    };
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

// Generate SQL
const sqlStatements = generateSupabaseInserts();

// Write SQL file
const sqlContent = `-- HyperTrack Pro - Complete Data Migration to Supabase
-- This file contains all historical workouts plus July 8-9 workouts
-- Run this in your Supabase SQL Editor

-- First, clear any existing workout data (optional)
-- DELETE FROM sets;
-- DELETE FROM workout_exercises;  
-- DELETE FROM workouts;

-- Insert workouts
${sqlStatements.workouts.join('\n')}

-- Insert workout exercises
${sqlStatements.exercises.join('\n')}

-- Insert sets
${sqlStatements.sets.join('\n')}

-- Verify the migration
SELECT 
  w.date,
  w.name,
  w.workout_type,
  COUNT(DISTINCT we.id) as exercise_count,
  COUNT(s.id) as total_sets,
  w.total_volume
FROM workouts w
LEFT JOIN workout_exercises we ON w.id = we.workout_id
LEFT JOIN sets s ON we.id = s.workout_exercise_id
GROUP BY w.id, w.date, w.name, w.workout_type, w.total_volume
ORDER BY w.date;
`;

fs.writeFileSync('supabase-migration.sql', sqlContent);

console.log('✅ Migration complete!');
console.log(`📊 Generated SQL for ${existingWorkouts.length + 2} workouts (including July 8-9)`);
console.log('📄 SQL file created: supabase-migration.sql');
console.log('🔧 Next steps:');
console.log('  1. Run supabase-migration.sql in your Supabase SQL Editor');
console.log('  2. Update app.js to read from Supabase instead of tyler-workouts.json');
console.log('  3. Test the migration with the analytics dashboard');