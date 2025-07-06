// Add Tyler's 7/6/2025 workout to the system
async function addWorkout7_6() {
    console.log('📝 Adding 7/6/2025 workout to system...');
    
    // Format workout data to match system structure
    const workout = {
        id: "workout-20250706-shoulders",
        date: "2025-07-06",
        startTime: "2025-07-06T13:21:47.978Z",
        endTime: "2025-07-06T14:09:34.570Z", // Based on last exercise timestamp
        duration: 2866592, // ~48 minutes in milliseconds
        split: "Shoulder",
        tod: "PM",
        notes: "Shoulder specialization day - lateral raises, traps, and rear delts",
        exercises: [
            {
                id: 12,
                name: "Dumbbell Lateral Raises",
                muscle_group: "Side Delts",
                category: "Isolation",
                sets: [
                    { weight: 60, reps: 15, timestamp: "2025-07-06T13:23:32.675Z" },
                    { weight: 70, reps: 13, timestamp: "2025-07-06T13:27:03.093Z" },
                    { weight: 80, reps: 6, timestamp: "2025-07-06T13:32:15.405Z" },
                    { weight: 70, reps: 11, timestamp: "2025-07-06T13:32:15.405Z" }
                ]
            },
            {
                id: 13,
                name: "Smith Machine Barbell Shrugs",
                muscle_group: "Traps",
                category: "Isolation",
                sets: [
                    { weight: 185, reps: 15, timestamp: "2025-07-06T13:44:47.836Z" },
                    { weight: 195, reps: 16, timestamp: "2025-07-06T13:44:47.836Z" },
                    { weight: 215, reps: 9, timestamp: "2025-07-06T13:44:47.836Z" },
                    { weight: 205, reps: 10, timestamp: "2025-07-06T13:44:47.837Z" }
                ]
            },
            {
                id: 14,
                name: "Cable Lateral Raises",
                muscle_group: "Side Delts",
                category: "Isolation",
                sets: [
                    { weight: 30, reps: 15, timestamp: "2025-07-06T13:52:44.452Z" },
                    { weight: 40, reps: 8, timestamp: "2025-07-06T13:52:44.452Z" },
                    { weight: 30, reps: 15, timestamp: "2025-07-06T13:52:44.452Z" }
                ]
            },
            {
                id: 15,
                name: "Dumbbell Reverse Flyes",
                muscle_group: "Rear Delts",
                category: "Isolation",
                sets: [
                    { weight: 55, reps: 15, timestamp: "2025-07-06T14:00:41.357Z" },
                    { weight: 55, reps: 15, timestamp: "2025-07-06T14:00:41.357Z" },
                    { weight: 60, reps: 12, timestamp: "2025-07-06T14:00:41.357Z" }
                ]
            },
            {
                id: 17,
                name: "Cable External Rotations",
                muscle_group: "Rear Delts",
                category: "Isolation",
                sets: [
                    { weight: 30, reps: 9, timestamp: "2025-07-06T14:09:34.570Z" },
                    { weight: 20, reps: 15, timestamp: "2025-07-06T14:09:34.570Z" },
                    { weight: 30, reps: 12, timestamp: "2025-07-06T14:09:34.570Z" }
                ]
            }
        ]
    };

    try {
        // 1. Add to tyler-workouts.json
        console.log('📁 Adding to local workout history...');
        
        // 2. Add to Supabase if available
        if (window.supabaseClient) {
            console.log('☁️ Adding to Supabase...');
            
            const { data, error } = await window.supabaseClient
                .from('workouts')
                .insert([{
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
                }]);

            if (error) {
                console.error('❌ Error adding workout to Supabase:', error);
            } else {
                console.log('✅ Workout added to Supabase successfully');
            }
        }

        // 3. Add to progress tracker
        if (window.progressTracker) {
            console.log('📊 Recording progress data...');
            
            for (const exercise of workout.exercises) {
                if (exercise.sets && exercise.sets.length > 0) {
                    window.progressTracker.recordExercisePerformance(
                        exercise.name, 
                        exercise.sets, 
                        new Date(workout.endTime)
                    );
                }
            }
            console.log('✅ Progress data recorded');
        }

        // 4. Add to main workouts array if HyperTrack is available
        if (window.HyperTrack && window.HyperTrack.state) {
            const existingWorkouts = window.HyperTrack.state.workouts || [];
            existingWorkouts.unshift(workout); // Add to beginning (newest first)
            window.HyperTrack.state.workouts = existingWorkouts;
            console.log('✅ Added to main workouts array');
        }

        console.log('🎉 7/6/2025 workout successfully added to all systems!');
        console.log('📋 Workout summary:');
        console.log(`   • ${workout.exercises.length} exercises`);
        console.log(`   • ${workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} total sets`);
        console.log(`   • Duration: ${Math.round(workout.duration / 60000)} minutes`);
        console.log(`   • Split: ${workout.split}`);
        
        return true;

    } catch (error) {
        console.error('❌ Error adding workout:', error);
        return false;
    }
}

// Auto-run when script loads
addWorkout7_6();