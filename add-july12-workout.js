// Add July 12, 2024 workout to Supabase database
const fs = require('fs');

async function addJuly12Workout() {
    try {
        // Read the workout data
        const workoutData = JSON.parse(fs.readFileSync('./july12-workout.json', 'utf8'));
        
        console.log('📅 Adding July 12, 2024 workout to database...');
        console.log('📋 Workout details:');
        console.log(`   Date: ${workoutData.date}`);
        console.log(`   Split: ${workoutData.split}`);
        console.log(`   Duration: ${workoutData.duration} minutes`);
        console.log(`   Exercises: ${workoutData.exercises.length}`);
        console.log(`   Total sets: ${workoutData.exercises.reduce((total, ex) => total + ex.sets.length, 0)}`);
        
        // Format for both local storage and Supabase
        const formattedWorkout = {
            ...workoutData,
            // Add local storage compatibility fields
            startTime: workoutData.start_time,
            endTime: workoutData.end_time,
            tod: workoutData.time_of_day,
            timeOfDay: workoutData.time_of_day
        };
        
        // Add to local storage fallback file
        const localWorkouts = [];
        try {
            const existingWorkouts = fs.readFileSync('./data/july12-workout-fallback.json', 'utf8');
            localWorkouts.push(...JSON.parse(existingWorkouts));
        } catch (error) {
            // File doesn't exist, that's ok
        }
        
        localWorkouts.push(formattedWorkout);
        
        // Ensure data directory exists
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data');
        }
        
        // Write to fallback file
        fs.writeFileSync('./data/july12-workout-fallback.json', JSON.stringify(localWorkouts, null, 2));
        
        console.log('✅ July 12 workout added to local fallback data');
        console.log('🔄 To add to Supabase, the app will sync this data automatically when loaded');
        
        // Generate SQL for manual insertion if needed
        const sqlInsert = generateSQLInsert(workoutData);
        fs.writeFileSync('./july12-workout-insert.sql', sqlInsert);
        console.log('📝 SQL insert statement saved to july12-workout-insert.sql');
        
        return formattedWorkout;
        
    } catch (error) {
        console.error('❌ Failed to add July 12 workout:', error);
        throw error;
    }
}

function generateSQLInsert(workout) {
    const exercisesJson = JSON.stringify(workout.exercises).replace(/'/g, "''");
    
    return `-- Insert July 12, 2024 workout
INSERT INTO workouts (
    id, user_id, date, start_time, end_time, duration, split, 
    time_of_day, notes, exercises
) VALUES (
    '${workout.id}',
    '${workout.user_id}',
    '${workout.date}',
    '${workout.start_time}',
    '${workout.end_time}',
    ${workout.duration},
    '${workout.split}',
    '${workout.time_of_day}',
    '${workout.notes}',
    '${exercisesJson}'::jsonb
);

-- Summary of workout:
-- Date: ${workout.date}
-- Split: ${workout.split}
-- Duration: ${workout.duration} minutes
-- Exercises: ${workout.exercises.length}
-- Total Sets: ${workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}
`;
}

// Run if called directly
if (require.main === module) {
    addJuly12Workout()
        .then(workout => {
            console.log('🎯 Successfully processed July 12 workout');
            console.log('📊 Workout summary:', {
                id: workout.id,
                date: workout.date,
                split: workout.split,
                exerciseCount: workout.exercises.length,
                totalSets: workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)
            });
        })
        .catch(error => {
            console.error('❌ Failed to process workout:', error);
            process.exit(1);
        });
}

module.exports = { addJuly12Workout, generateSQLInsert };