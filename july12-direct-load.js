// Direct July 12 workout loader - adds workout immediately to localStorage
console.log('📅 Loading July 12 workout directly...');

// July 12, 2025 workout data (current year)
const july12Workout = {
    "id": "workout_july12_2025_shoulders_triceps",
    "user_id": "tyler_historical", 
    "date": "2025-07-12",
    "startTime": "2025-07-12T15:30:00.000Z",
    "endTime": "2025-07-12T16:45:00.000Z",
    "start_time": "2025-07-12T15:30:00.000Z",
    "end_time": "2025-07-12T16:45:00.000Z", 
    "duration": 75,
    "split": "Shoulders/Triceps",
    "time_of_day": "PM",
    "tod": "PM",
    "timeOfDay": "PM",
    "notes": "Focused shoulder session with tricep work",
    "exercises": [
        {
            "id": "exercise_1_cable_lateral_raises",
            "name": "Cable Lateral Raises", 
            "muscle_group": "Side Delts",
            "muscleGroup": "Side Delts",
            "category": "Isolation",
            "equipment": "Cable",
            "notes": "",
            "sets": [
                {"id": "set_1_1", "set_number": 1, "setNumber": 1, "reps": 13, "weight": 30, "rpe": 7.5, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_1_2", "set_number": 2, "setNumber": 2, "reps": 12, "weight": 30, "rpe": 8.0, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_1_3", "set_number": 3, "setNumber": 3, "reps": 12, "weight": 30, "rpe": 8.5, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_2_dumbbell_reverse_flyes",
            "name": "Dumbbell Reverse Flyes",
            "muscle_group": "Rear Delts", 
            "muscleGroup": "Rear Delts",
            "category": "Isolation",
            "equipment": "Dumbbells",
            "notes": "",
            "sets": [
                {"id": "set_2_1", "set_number": 1, "setNumber": 1, "reps": 19, "weight": 50, "rpe": 7.0, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_2_2", "set_number": 2, "setNumber": 2, "reps": 15, "weight": 55, "rpe": 8.0, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_2_3", "set_number": 3, "setNumber": 3, "reps": 15, "weight": 55, "rpe": 8.5, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_3_arnold_press",
            "name": "Arnold Press",
            "muscle_group": "Vertical Push",
            "muscleGroup": "Vertical Push", 
            "category": "Compound",
            "equipment": "Dumbbells",
            "notes": "",
            "sets": [
                {"id": "set_3_1", "set_number": 1, "setNumber": 1, "reps": 14, "weight": 80, "rpe": 7.5, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_3_2", "set_number": 2, "setNumber": 2, "reps": 15, "weight": 80, "rpe": 8.0, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_3_3", "set_number": 3, "setNumber": 3, "reps": 10, "weight": 90, "rpe": 8.5, "rest_time_seconds": 150, "restTime": 150, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_4_cable_external_rotations",
            "name": "Cable External Rotations",
            "muscle_group": "Rear Delts",
            "muscleGroup": "Rear Delts",
            "category": "Isolation", 
            "equipment": "Cable",
            "notes": "",
            "sets": [
                {"id": "set_4_1", "set_number": 1, "setNumber": 1, "reps": 15, "weight": 30, "rpe": 6.5, "rest_time_seconds": 60, "restTime": 60, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_4_2", "set_number": 2, "setNumber": 2, "reps": 20, "weight": 20, "rpe": 7.0, "rest_time_seconds": 60, "restTime": 60, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_4_3", "set_number": 3, "setNumber": 3, "reps": 15, "weight": 20, "rpe": 7.5, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_5_smith_machine_shoulder_press",
            "name": "Smith Machine Shoulder Press",
            "muscle_group": "Vertical Push",
            "muscleGroup": "Vertical Push",
            "category": "Compound",
            "equipment": "Smith Machine", 
            "notes": "",
            "sets": [
                {"id": "set_5_1", "set_number": 1, "setNumber": 1, "reps": 13, "weight": 115, "rpe": 7.5, "rest_time_seconds": 150, "restTime": 150, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_5_2", "set_number": 2, "setNumber": 2, "reps": 12, "weight": 135, "rpe": 8.5, "rest_time_seconds": 150, "restTime": 150, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_5_3", "set_number": 3, "setNumber": 3, "reps": 12, "weight": 155, "rpe": 9.0, "rest_time_seconds": 180, "restTime": 180, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_6_dumbbell_lateral_raises", 
            "name": "Dumbbell Lateral Raises",
            "muscle_group": "Side Delts",
            "muscleGroup": "Side Delts",
            "category": "Isolation",
            "equipment": "Dumbbells",
            "notes": "",
            "sets": [
                {"id": "set_6_1", "set_number": 1, "setNumber": 1, "reps": 12, "weight": 70, "rpe": 8.0, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_6_2", "set_number": 2, "setNumber": 2, "reps": 12, "weight": 70, "rpe": 8.5, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_6_3", "set_number": 3, "setNumber": 3, "reps": 12, "weight": 70, "rpe": 9.0, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_7_tricep_cable_rope_pulldowns",
            "name": "Tricep Cable Rope Pulldowns", 
            "muscle_group": "Triceps",
            "muscleGroup": "Triceps",
            "category": "Isolation",
            "equipment": "Cable",
            "notes": "",
            "sets": [
                {"id": "set_7_1", "set_number": 1, "setNumber": 1, "reps": 12, "weight": 60, "rpe": 7.5, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_7_2", "set_number": 2, "setNumber": 2, "reps": 12, "weight": 60, "rpe": 8.0, "rest_time_seconds": 90, "restTime": 90, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_7_3", "set_number": 3, "setNumber": 3, "reps": 12, "weight": 60, "rpe": 8.5, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_8_smith_machine_barbell_shrugs",
            "name": "Smith Machine Barbell Shrugs",
            "muscle_group": "Traps",
            "muscleGroup": "Traps",
            "category": "Isolation",
            "equipment": "Smith Machine",
            "notes": "",
            "sets": [
                {"id": "set_8_1", "set_number": 1, "setNumber": 1, "reps": 11, "weight": 205, "rpe": 8.0, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_8_2", "set_number": 2, "setNumber": 2, "reps": 10, "weight": 205, "rpe": 8.5, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""},
                {"id": "set_8_3", "set_number": 3, "setNumber": 3, "reps": 10, "weight": 205, "rpe": 9.0, "rest_time_seconds": 150, "restTime": 150, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": ""}
            ]
        },
        {
            "id": "exercise_9_bodyweight_dips",
            "name": "Bodyweight Dips",
            "muscle_group": "Horizontal Push",
            "muscleGroup": "Horizontal Push", 
            "category": "Compound",
            "equipment": "Bodyweight",
            "notes": "",
            "sets": [
                {"id": "set_9_1", "set_number": 1, "setNumber": 1, "reps": 6, "weight": 0, "rpe": 8.5, "rest_time_seconds": 120, "restTime": 120, "is_warmup": false, "isWarmup": false, "is_failure": false, "isFailure": false, "notes": "Bodyweight only"}
            ]
        }
    ]
};

// Add workout to localStorage immediately
function addJuly12WorkoutToLocalStorage() {
    try {
        const existingWorkouts = JSON.parse(localStorage.getItem('hypertrack_workouts') || '[]');
        
        // Remove any existing July 12 workouts (both 2024 and 2025 versions)
        const filteredWorkouts = existingWorkouts.filter(w => 
            !w.id.includes('july12') && !w.date.includes('2024-07-12') && !w.date.includes('2025-07-12')
        );
        
        // Add the new 2025 July 12 workout
        filteredWorkouts.push(july12Workout);
        filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('hypertrack_workouts', JSON.stringify(filteredWorkouts));
        
        console.log('✅ July 12, 2025 workout added to localStorage');
        console.log(`📊 Total workouts: ${filteredWorkouts.length}`);
        console.log(`📅 July 12 workout details:`);
        console.log(`   Date: ${july12Workout.date}`);
        console.log(`   Split: ${july12Workout.split}`);
        console.log(`   Exercises: ${july12Workout.exercises.length}`);
        console.log(`   Total sets: ${july12Workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)}`);
        console.log(`   Position in list: ${filteredWorkouts.findIndex(w => w.id === july12Workout.id) + 1}`);
        
        return true;
    } catch (error) {
        console.error('❌ Failed to add July 12 workout:', error);
        return false;
    }
}

// Add the workout immediately
const added = addJuly12WorkoutToLocalStorage();

// Force update HyperTrack if available and workout was added
if (added) {
    // Try to update HyperTrack when it becomes available
    function updateHyperTrackWithJuly12() {
        if (window.HyperTrack && window.HyperTrack.loadWorkoutData) {
            console.log('🔄 Refreshing HyperTrack data to include July 12 workout...');
            window.HyperTrack.loadWorkoutData();
            
            if (window.HyperTrack.updateAllDisplays) {
                window.HyperTrack.updateAllDisplays();
            }
            
            console.log('✅ HyperTrack updated with July 12 workout data');
            return true;
        }
        return false;
    }
    
    // Try immediately
    if (!updateHyperTrackWithJuly12()) {
        // Try again in 1 second
        setTimeout(() => {
            if (!updateHyperTrackWithJuly12()) {
                // Try again in 3 seconds
                setTimeout(updateHyperTrackWithJuly12, 3000);
            }
        }, 1000);
    }
}

// Function to force reload July 12 workout (for debugging)
function forceReloadJuly12Workout() {
    console.log('🔄 Force reloading July 12 workout...');
    addJuly12WorkoutToLocalStorage();
    
    // Update HyperTrack if available
    if (window.HyperTrack && window.HyperTrack.loadWorkoutData) {
        window.HyperTrack.loadWorkoutData();
        if (window.HyperTrack.updateAllDisplays) {
            window.HyperTrack.updateAllDisplays();
        }
        console.log('✅ HyperTrack refreshed with updated July 12 workout');
    }
}

// Make functions globally available
window.addJuly12WorkoutToLocalStorage = addJuly12WorkoutToLocalStorage;
window.forceReloadJuly12Workout = forceReloadJuly12Workout;