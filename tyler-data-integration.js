// Tyler's Historical Workout Data Integration
// This file contains pre-loaded workout data for testing and demonstration

// Sample workout data (simplified for demo)
const tylerCompleteWorkouts = [
    {
        id: 'workout-2024-06-15',
        date: '2024-06-15',
        workout_date: '2024-06-15',
        startTime: '2024-06-15T10:30:00Z',
        endTime: '2024-06-15T11:45:00Z',
        duration: 4500000, // 75 minutes in milliseconds
        exercises: [
            {
                name: 'Barbell Bench Press',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 185, reps: 8 },
                    { weight: 185, reps: 7 },
                    { weight: 180, reps: 8 },
                    { weight: 180, reps: 8 }
                ]
            },
            {
                name: 'Incline Dumbbell Press',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 70, reps: 10 },
                    { weight: 70, reps: 9 },
                    { weight: 65, reps: 10 }
                ]
            },
            {
                name: 'Pull-ups',
                muscle_group: 'Back',
                category: 'Compound',
                sets: [
                    { weight: 0, reps: 12 },
                    { weight: 0, reps: 10 },
                    { weight: 0, reps: 8 }
                ]
            }
        ]
    },
    {
        id: 'workout-2024-06-17',
        date: '2024-06-17',
        workout_date: '2024-06-17',
        startTime: '2024-06-17T14:00:00Z',
        endTime: '2024-06-17T15:30:00Z',
        duration: 5400000, // 90 minutes
        exercises: [
            {
                name: 'Squats',
                muscle_group: 'Legs',
                category: 'Compound',
                sets: [
                    { weight: 225, reps: 8 },
                    { weight: 225, reps: 8 },
                    { weight: 225, reps: 7 },
                    { weight: 215, reps: 8 }
                ]
            },
            {
                name: 'Romanian Deadlifts',
                muscle_group: 'Legs',
                category: 'Compound',
                sets: [
                    { weight: 185, reps: 10 },
                    { weight: 185, reps: 10 },
                    { weight: 185, reps: 9 }
                ]
            },
            {
                name: 'Leg Curls',
                muscle_group: 'Legs',
                category: 'Isolation',
                sets: [
                    { weight: 110, reps: 12 },
                    { weight: 110, reps: 11 },
                    { weight: 105, reps: 12 }
                ]
            }
        ]
    },
    {
        id: 'workout-2024-06-19',
        date: '2024-06-19',
        workout_date: '2024-06-19',
        startTime: '2024-06-19T16:15:00Z',
        endTime: '2024-06-19T17:30:00Z',
        duration: 4500000, // 75 minutes
        exercises: [
            {
                name: 'Overhead Press',
                muscle_group: 'Shoulders',
                category: 'Compound',
                sets: [
                    { weight: 115, reps: 8 },
                    { weight: 115, reps: 7 },
                    { weight: 110, reps: 8 },
                    { weight: 110, reps: 8 }
                ]
            },
            {
                name: 'Lateral Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 25, reps: 15 },
                    { weight: 25, reps: 14 },
                    { weight: 22.5, reps: 15 }
                ]
            },
            {
                name: 'Barbell Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 75, reps: 10 },
                    { weight: 75, reps: 9 },
                    { weight: 70, reps: 10 }
                ]
            }
        ]
    }
];

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { tylerCompleteWorkouts };
}

console.log('📊 Tyler\'s workout data loaded:', tylerCompleteWorkouts.length, 'workouts');