// Tyler's Pre-loaded Workout Data
// Demonstrates app functionality with real workout history

// Tyler's workout data for immediate testing and demonstration
const tylerWorkoutData = {
    user: {
        name: "Tyler",
        preferences: {
            progressionRate: 2.5,
            showResearchFacts: true
        }
    },
    workouts: [
        {
            id: "tyler-workout-1",
            date: "2024-12-15",
            startTime: "2024-12-15T10:00:00Z",
            endTime: "2024-12-15T11:30:00Z",
            exercises: [
                {
                    id: 1,
                    name: "Barbell Bench Press",
                    muscleGroup: "Chest",
                    sets: [
                        { weight: 185, reps: 8, rpe: 8 },
                        { weight: 185, reps: 7, rpe: 9 },
                        { weight: 175, reps: 8, rpe: 8 }
                    ]
                },
                {
                    id: 9,
                    name: "Squats", 
                    muscleGroup: "Legs",
                    sets: [
                        { weight: 225, reps: 6, rpe: 8 },
                        { weight: 225, reps: 6, rpe: 9 },
                        { weight: 215, reps: 8, rpe: 8 }
                    ]
                },
                {
                    id: 6,
                    name: "Barbell Rows",
                    muscleGroup: "Back", 
                    sets: [
                        { weight: 165, reps: 8, rpe: 7 },
                        { weight: 165, reps: 8, rpe: 8 },
                        { weight: 155, reps: 10, rpe: 8 }
                    ]
                }
            ]
        },
        {
            id: "tyler-workout-2", 
            date: "2024-12-17",
            startTime: "2024-12-17T14:00:00Z",
            endTime: "2024-12-17T15:45:00Z",
            exercises: [
                {
                    id: 13,
                    name: "Overhead Press",
                    muscleGroup: "Shoulders",
                    sets: [
                        { weight: 95, reps: 6, rpe: 8 },
                        { weight: 95, reps: 5, rpe: 9 },
                        { weight: 85, reps: 8, rpe: 8 }
                    ]
                },
                {
                    id: 10,
                    name: "Romanian Deadlifts",
                    muscleGroup: "Legs",
                    sets: [
                        { weight: 185, reps: 8, rpe: 7 },
                        { weight: 185, reps: 8, rpe: 8 },
                        { weight: 185, reps: 6, rpe: 9 }
                    ]
                },
                {
                    id: 16,
                    name: "Barbell Curls",
                    muscleGroup: "Biceps",
                    sets: [
                        { weight: 75, reps: 10, rpe: 7 },
                        { weight: 75, reps: 8, rpe: 8 },
                        { weight: 65, reps: 12, rpe: 8 }
                    ]
                }
            ]
        },
        {
            id: "tyler-workout-3",
            date: "2024-12-19", 
            startTime: "2024-12-19T16:00:00Z",
            endTime: "2024-12-19T17:30:00Z",
            exercises: [
                {
                    id: 2,
                    name: "Incline Dumbbell Press",
                    muscleGroup: "Chest",
                    sets: [
                        { weight: 70, reps: 8, rpe: 8 },
                        { weight: 70, reps: 7, rpe: 9 },
                        { weight: 65, reps: 10, rpe: 8 }
                    ]
                },
                {
                    id: 5,
                    name: "Pull-ups",
                    muscleGroup: "Back",
                    sets: [
                        { weight: 0, reps: 12, rpe: 7 },
                        { weight: 0, reps: 10, rpe: 8 },
                        { weight: 0, reps: 8, rpe: 9 }
                    ]
                },
                {
                    id: 18,
                    name: "Close-Grip Bench Press", 
                    muscleGroup: "Triceps",
                    sets: [
                        { weight: 135, reps: 10, rpe: 7 },
                        { weight: 135, reps: 8, rpe: 8 },
                        { weight: 125, reps: 12, rpe: 8 }
                    ]
                }
            ]
        }
    ]
};

// Calculate analytics from Tyler's data
function calculateTylerAnalytics() {
    const workouts = tylerWorkoutData.workouts;
    let totalSets = 0;
    let totalVolume = 0;
    
    workouts.forEach(workout => {
        workout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                totalSets++;
                totalVolume += (set.weight * set.reps);
            });
        });
    });
    
    const avgDuration = workouts.reduce((sum, workout) => {
        const start = new Date(workout.startTime);
        const end = new Date(workout.endTime);
        return sum + ((end - start) / (1000 * 60)); // minutes
    }, 0) / workouts.length;
    
    return {
        totalWorkouts: workouts.length,
        totalSets,
        totalVolume,
        avgDuration: Math.round(avgDuration)
    };
}

// Load Tyler's data into app state on initialization
function loadTylerData() {
    if (typeof HyperTrack !== 'undefined' && HyperTrack.state) {
        HyperTrack.state.workouts = tylerWorkoutData.workouts;
        HyperTrack.state.user = tylerWorkoutData.user;
        
        console.log('✅ Tyler\'s workout data loaded:', calculateTylerAnalytics());
        
        // Update analytics display
        setTimeout(() => {
            updateAnalyticsWithTylerData();
        }, 100);
    }
}

// Update analytics display with Tyler's data
function updateAnalyticsWithTylerData() {
    const analytics = calculateTylerAnalytics();
    
    const elements = {
        totalWorkouts: document.getElementById('totalWorkouts'),
        totalSets: document.getElementById('totalSets'), 
        totalVolume: document.getElementById('totalVolume'),
        avgDuration: document.getElementById('avgDuration')
    };
    
    if (elements.totalWorkouts) elements.totalWorkouts.textContent = analytics.totalWorkouts;
    if (elements.totalSets) elements.totalSets.textContent = analytics.totalSets;
    if (elements.totalVolume) elements.totalVolume.textContent = analytics.totalVolume.toLocaleString();
    if (elements.avgDuration) elements.avgDuration.textContent = analytics.avgDuration;
    
    console.log('📊 Analytics updated with Tyler\'s data');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTylerData);
} else {
    loadTylerData();
}

// Export for global access
window.tylerWorkoutData = tylerWorkoutData;
window.calculateTylerAnalytics = calculateTylerAnalytics;