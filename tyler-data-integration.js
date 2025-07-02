// Tyler's Complete Workout Data Integration
// Historical workout data for HyperTrack Pro

// Tyler's workout history (sample data structure)
const tylerCompleteWorkouts = [
    {
        id: 'workout-001',
        date: '2024-12-15',
        duration: 75, // minutes
        exercises: [
            {
                name: 'Barbell Bench Press',
                sets: [
                    { weight: 185, reps: 8, rest: 150 },
                    { weight: 185, reps: 7, rest: 150 },
                    { weight: 175, reps: 9, rest: 150 }
                ]
            },
            {
                name: 'Pull-ups',
                sets: [
                    { weight: 0, reps: 12, rest: 120 },
                    { weight: 0, reps: 10, rest: 120 },
                    { weight: 0, reps: 8, rest: 120 }
                ]
            },
            {
                name: 'Barbell Squats',
                sets: [
                    { weight: 225, reps: 8, rest: 180 },
                    { weight: 225, reps: 8, rest: 180 },
                    { weight: 215, reps: 9, rest: 180 }
                ]
            }
        ],
        notes: 'Strong session, felt great on bench press'
    },
    {
        id: 'workout-002',
        date: '2024-12-17',
        duration: 68,
        exercises: [
            {
                name: 'Romanian Deadlifts',
                sets: [
                    { weight: 205, reps: 10, rest: 150 },
                    { weight: 205, reps: 9, rest: 150 },
                    { weight: 195, reps: 11, rest: 150 }
                ]
            },
            {
                name: 'Incline Dumbbell Press',
                sets: [
                    { weight: 75, reps: 8, rest: 120 },
                    { weight: 75, reps: 7, rest: 120 },
                    { weight: 70, reps: 9, rest: 120 }
                ]
            },
            {
                name: 'Barbell Rows',
                sets: [
                    { weight: 155, reps: 10, rest: 120 },
                    { weight: 155, reps: 9, rest: 120 },
                    { weight: 155, reps: 8, rest: 120 }
                ]
            }
        ],
        notes: 'Good focus on posterior chain'
    },
    {
        id: 'workout-003',
        date: '2024-12-19',
        duration: 82,
        exercises: [
            {
                name: 'Barbell Bench Press',
                sets: [
                    { weight: 190, reps: 6, rest: 180 },
                    { weight: 185, reps: 8, rest: 150 },
                    { weight: 180, reps: 9, rest: 150 }
                ]
            },
            {
                name: 'Pull-ups',
                sets: [
                    { weight: 10, reps: 8, rest: 120 }, // Added weight
                    { weight: 0, reps: 12, rest: 120 },
                    { weight: 0, reps: 10, rest: 120 }
                ]
            },
            {
                name: 'Dips',
                sets: [
                    { weight: 0, reps: 15, rest: 90 },
                    { weight: 0, reps: 12, rest: 90 },
                    { weight: 0, reps: 10, rest: 90 }
                ]
            }
        ],
        notes: 'Progressive overload on bench, added weight to pull-ups'
    }
];

// Tyler's personal records
const tylerPersonalRecords = {
    'Barbell Bench Press': { weight: 225, reps: 3, date: '2024-11-28' },
    'Barbell Squats': { weight: 275, reps: 5, date: '2024-12-01' },
    'Romanian Deadlifts': { weight: 245, reps: 8, date: '2024-11-15' },
    'Pull-ups': { weight: 25, reps: 5, date: '2024-12-10' },
    'Barbell Rows': { weight: 185, reps: 6, date: '2024-11-20' }
};

// Tyler's current strength baselines (for progression calculations)
const tylerStrengthBaselines = {
    'Barbell Bench Press': { current_max: 190, target_reps: 8 },
    'Barbell Squats': { current_max: 225, target_reps: 8 },
    'Romanian Deadlifts': { current_max: 205, target_reps: 10 },
    'Pull-ups': { current_max: 0, target_reps: 12 }, // bodyweight
    'Barbell Rows': { current_max: 155, target_reps: 10 },
    'Incline Dumbbell Press': { current_max: 75, target_reps: 8 },
    'Dips': { current_max: 0, target_reps: 15 } // bodyweight
};

// Make data available globally for the main app
if (typeof window !== 'undefined') {
    window.tylerCompleteWorkouts = tylerCompleteWorkouts;
    window.tylerPersonalRecords = tylerPersonalRecords;
    window.tylerStrengthBaselines = tylerStrengthBaselines;
}

console.log('📊 Tyler data integration loaded:', {
    workouts: tylerCompleteWorkouts.length,
    prs: Object.keys(tylerPersonalRecords).length,
    baselines: Object.keys(tylerStrengthBaselines).length
});
