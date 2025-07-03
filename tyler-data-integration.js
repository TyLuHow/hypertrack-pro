// Tyler's Complete Workout Data Integration
// Historical workout data for HyperTrack Pro - Real data from CSV

// Tyler's actual workout history (converted from CSV)
const tylerCompleteWorkouts = [
    {
        id: 'workout-20240624-pull',
        date: '2024-06-24',
        workout_date: '2024-06-24',
        start_time: '2024-06-24T09:00:00Z',
        end_time: '2024-06-24T10:15:00Z',
        duration: 75 * 60 * 1000, // 75 minutes in milliseconds
        split: 'Pull',
        tod: 'AM',
        notes: 'Pull day - lat focus with bicep work',
        exercises: [
            {
                id: 1,
                name: 'Lat Pulldowns',
                muscle_group: 'Back',
                category: 'Compound',
                sets: [
                    { weight: 130, reps: 12, timestamp: '2024-06-24T09:05:00Z' },
                    { weight: 130, reps: 15, timestamp: '2024-06-24T09:08:00Z' },
                    { weight: 145, reps: 11, timestamp: '2024-06-24T09:11:00Z' }
                ]
            },
            {
                id: 2,
                name: 'Smith Machine Barbell Rows',
                muscle_group: 'Back',
                category: 'Compound',
                sets: [
                    { weight: 165, reps: 5, timestamp: '2024-06-24T09:15:00Z' },
                    { weight: 145, reps: 9, timestamp: '2024-06-24T09:18:00Z' },
                    { weight: 145, reps: 9, timestamp: '2024-06-24T09:21:00Z' }
                ]
            },
            {
                id: 3,
                name: 'Rope Face Pulls',
                muscle_group: 'Back',
                category: 'Isolation',
                sets: [
                    { weight: 55, reps: 16, timestamp: '2024-06-24T09:25:00Z' },
                    { weight: 65, reps: 13, timestamp: '2024-06-24T09:27:00Z' },
                    { weight: 65, reps: 14, timestamp: '2024-06-24T09:29:00Z' }
                ]
            },
            {
                id: 4,
                name: 'Dumbbell Bicep Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 80, reps: 11, timestamp: '2024-06-24T09:33:00Z' }, // 40lbs per arm
                    { weight: 80, reps: 13, timestamp: '2024-06-24T09:35:00Z' },
                    { weight: 90, reps: 9, timestamp: '2024-06-24T09:37:00Z' }   // 45lbs per arm
                ]
            },
            {
                id: 5,
                name: 'Reverse Grip EZ Bar Curl',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 12, timestamp: '2024-06-24T09:40:00Z' },
                    { weight: 60, reps: 15, timestamp: '2024-06-24T09:42:00Z' },
                    { weight: 60, reps: 10, timestamp: '2024-06-24T09:44:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20240625-push',
        date: '2024-06-25',
        workout_date: '2024-06-25',
        start_time: '2024-06-25T18:00:00Z',
        end_time: '2024-06-25T19:30:00Z',
        duration: 90 * 60 * 1000, // 90 minutes in milliseconds
        split: 'Push',
        tod: 'PM',
        notes: 'Push day - chest, triceps, and abs',
        exercises: [
            {
                id: 6,
                name: 'Bodyweight Dips',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 225, reps: 6, timestamp: '2024-06-25T18:05:00Z' }, // Bodyweight
                    { weight: 225, reps: 5, timestamp: '2024-06-25T18:25:00Z' },
                    { weight: 225, reps: 6, timestamp: '2024-06-25T18:27:00Z' },
                    { weight: 225, reps: 6, timestamp: '2024-06-25T18:29:00Z' }
                ]
            },
            {
                id: 7,
                name: 'Smith Machine Bench Press',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 165, reps: 8, timestamp: '2024-06-25T18:08:00Z' },
                    { weight: 165, reps: 9, timestamp: '2024-06-25T18:11:00Z' },
                    { weight: 175, reps: 6, timestamp: '2024-06-25T18:14:00Z' },
                    { weight: 165, reps: 8, timestamp: '2024-06-25T18:17:00Z' }
                ]
            },
            {
                id: 8,
                name: 'Incline Dumbbell Bench Press',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 120, reps: 12, timestamp: '2024-06-25T18:20:00Z' }, // 60lbs per arm
                    { weight: 120, reps: 12, timestamp: '2024-06-25T18:22:00Z' },
                    { weight: 120, reps: 12, timestamp: '2024-06-25T18:24:00Z' }
                ]
            },
            {
                id: 9,
                name: 'Cable Crunch Machine',
                muscle_group: 'Abs',
                category: 'Isolation',
                sets: [
                    { weight: 200, reps: 15, timestamp: '2024-06-25T18:32:00Z' },
                    { weight: 200, reps: 15, timestamp: '2024-06-25T18:34:00Z' },
                    { weight: 200, reps: 15, timestamp: '2024-06-25T18:36:00Z' }
                ]
            },
            {
                id: 10,
                name: 'Close Grip Smith Machine Press',
                muscle_group: 'Triceps',
                category: 'Compound',
                sets: [
                    { weight: 95, reps: 20, timestamp: '2024-06-25T18:40:00Z' },
                    { weight: 115, reps: 12, timestamp: '2024-06-25T18:42:00Z' },
                    { weight: 135, reps: 8, timestamp: '2024-06-25T18:44:00Z' }
                ]
            },
            {
                id: 11,
                name: 'Tricep Cable Rope Pulldowns',
                muscle_group: 'Triceps',
                category: 'Isolation',
                sets: [
                    { weight: 55, reps: 13, timestamp: '2024-06-25T18:47:00Z' },
                    { weight: 55, reps: 11, timestamp: '2024-06-25T18:49:00Z' },
                    { weight: 50, reps: 14, timestamp: '2024-06-25T18:51:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20240626-shoulder',
        date: '2024-06-26',
        workout_date: '2024-06-26',
        start_time: '2024-06-26T18:00:00Z',
        end_time: '2024-06-26T19:15:00Z',
        duration: 75 * 60 * 1000,
        split: 'Shoulder',
        tod: 'PM',
        notes: 'Shoulder day - lateral raises and shrugs focus',
        exercises: [
            {
                id: 12,
                name: 'Dumbbell Lateral Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 30, reps: 12, timestamp: '2024-06-26T18:05:00Z' }, // 15lbs per arm
                    { weight: 60, reps: 12, timestamp: '2024-06-26T18:07:00Z' }, // 30lbs per arm
                    { weight: 60, reps: 14, timestamp: '2024-06-26T18:09:00Z' },
                    { weight: 60, reps: 16, timestamp: '2024-06-26T18:11:00Z' }
                ]
            },
            {
                id: 13,
                name: 'Smith Machine Barbell Shrugs',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 135, reps: 18, timestamp: '2024-06-26T18:15:00Z' },
                    { weight: 165, reps: 12, timestamp: '2024-06-26T18:18:00Z' },
                    { weight: 175, reps: 14, timestamp: '2024-06-26T18:21:00Z' },
                    { weight: 185, reps: 11, timestamp: '2024-06-26T18:24:00Z' }
                ]
            },
            {
                id: 14,
                name: 'Cable Lateral Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 30, reps: 15, timestamp: '2024-06-26T18:28:00Z' },
                    { weight: 30, reps: 15, timestamp: '2024-06-26T18:30:00Z' },
                    { weight: 30, reps: 15, timestamp: '2024-06-26T18:32:00Z' }
                ]
            },
            {
                id: 15,
                name: 'EZ Bar Upright Rows',
                muscle_group: 'Shoulders',
                category: 'Compound',
                sets: [
                    { weight: 60, reps: 15, timestamp: '2024-06-26T18:36:00Z' },
                    { weight: 60, reps: 15, timestamp: '2024-06-26T18:38:00Z' },
                    { weight: 60, reps: 15, timestamp: '2024-06-26T18:40:00Z' }
                ]
            },
            {
                id: 16,
                name: 'Kettlebell Prone Y Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 40, reps: 15, timestamp: '2024-06-26T18:44:00Z' },
                    { weight: 40, reps: 15, timestamp: '2024-06-26T18:46:00Z' },
                    { weight: 40, reps: 17, timestamp: '2024-06-26T18:48:00Z' }
                ]
            },
            {
                id: 17,
                name: 'Cable External Rotations',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 20, reps: 11, timestamp: '2024-06-26T18:52:00Z' },
                    { weight: 20, reps: 15, timestamp: '2024-06-26T18:54:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20240629-pull',
        date: '2024-06-29',
        workout_date: '2024-06-29',
        start_time: '2024-06-29T18:00:00Z',
        end_time: '2024-06-29T19:15:00Z',
        duration: 75 * 60 * 1000,
        split: 'Pull',
        tod: 'PM',
        notes: 'Second pull day - progression in lat pulldowns',
        exercises: [
            {
                id: 1,
                name: 'Lat Pulldowns',
                muscle_group: 'Back',
                category: 'Compound',
                sets: [
                    { weight: 145, reps: 15, timestamp: '2024-06-29T18:05:00Z' },
                    { weight: 160, reps: 10, timestamp: '2024-06-29T18:08:00Z' },
                    { weight: 160, reps: 10, timestamp: '2024-06-29T18:11:00Z' }
                ]
            },
            {
                id: 2,
                name: 'Smith Machine Barbell Rows',
                muscle_group: 'Back',
                category: 'Compound',
                sets: [
                    { weight: 150, reps: 10, timestamp: '2024-06-29T18:15:00Z' },
                    { weight: 150, reps: 10, timestamp: '2024-06-29T18:18:00Z' },
                    { weight: 155, reps: 9, timestamp: '2024-06-29T18:21:00Z' }
                ]
            },
            {
                id: 3,
                name: 'Rope Face Pulls',
                muscle_group: 'Back',
                category: 'Isolation',
                sets: [
                    { weight: 65, reps: 16, timestamp: '2024-06-29T18:25:00Z' },
                    { weight: 70, reps: 12, timestamp: '2024-06-29T18:27:00Z' },
                    { weight: 65, reps: 12, timestamp: '2024-06-29T18:29:00Z' }
                ]
            },
            {
                id: 4,
                name: 'Dumbbell Bicep Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 90, reps: 11, timestamp: '2024-06-29T18:33:00Z' }, // 45lbs per arm
                    { weight: 90, reps: 13, timestamp: '2024-06-29T18:35:00Z' },
                    { weight: 80, reps: 12, timestamp: '2024-06-29T18:37:00Z' }  // 40lbs per arm
                ]
            },
            {
                id: 5,
                name: 'Reverse Grip EZ Bar Curl',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 15, timestamp: '2024-06-29T18:40:00Z' },
                    { weight: 60, reps: 13, timestamp: '2024-06-29T18:42:00Z' },
                    { weight: 60, reps: 11, timestamp: '2024-06-29T18:44:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20240630-push',
        date: '2024-06-30',
        workout_date: '2024-06-30',
        start_time: '2024-06-30T18:00:00Z',
        end_time: '2024-06-30T19:30:00Z',
        duration: 90 * 60 * 1000,
        split: 'Push',
        tod: 'PM',
        notes: 'Second push day - strength progression in bench',
        exercises: [
            {
                id: 7,
                name: 'Smith Machine Bench Press',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 175, reps: 9, timestamp: '2024-06-30T18:05:00Z' },
                    { weight: 175, reps: 8, timestamp: '2024-06-30T18:08:00Z' },
                    { weight: 175, reps: 8, timestamp: '2024-06-30T18:11:00Z' },
                    { weight: 165, reps: 8, timestamp: '2024-06-30T18:14:00Z' }
                ]
            },
            {
                id: 8,
                name: 'Incline Dumbbell Bench Press',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 130, reps: 15, timestamp: '2024-06-30T18:18:00Z' }, // 65lbs per arm
                    { weight: 130, reps: 15, timestamp: '2024-06-30T18:20:00Z' },
                    { weight: 130, reps: 13, timestamp: '2024-06-30T18:22:00Z' }
                ]
            },
            {
                id: 6,
                name: 'Bodyweight Dips',
                muscle_group: 'Chest',
                category: 'Compound',
                sets: [
                    { weight: 225, reps: 7, timestamp: '2024-06-30T18:25:00Z' },
                    { weight: 225, reps: 8, timestamp: '2024-06-30T18:27:00Z' },
                    { weight: 225, reps: 7, timestamp: '2024-06-30T18:29:00Z' }
                ]
            },
            {
                id: 18,
                name: 'Dumbbell Flyes',
                muscle_group: 'Chest',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 17, timestamp: '2024-06-30T18:33:00Z' }, // 30lbs per arm
                    { weight: 70, reps: 15, timestamp: '2024-06-30T18:35:00Z' }, // 35lbs per arm
                    { weight: 80, reps: 12, timestamp: '2024-06-30T18:37:00Z' }  // 40lbs per arm
                ]
            },
            {
                id: 10,
                name: 'Close Grip Smith Machine Press',
                muscle_group: 'Triceps',
                category: 'Compound',
                sets: [
                    { weight: 140, reps: 8, timestamp: '2024-06-30T18:41:00Z' },
                    { weight: 140, reps: 8, timestamp: '2024-06-30T18:43:00Z' },
                    { weight: 140, reps: 8, timestamp: '2024-06-30T18:45:00Z' }
                ]
            },
            {
                id: 11,
                name: 'Tricep Cable Rope Pulldowns',
                muscle_group: 'Triceps',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 11, timestamp: '2024-06-30T18:48:00Z' },
                    { weight: 60, reps: 12, timestamp: '2024-06-30T18:50:00Z' },
                    { weight: 60, reps: 12, timestamp: '2024-06-30T18:52:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20240702-shoulder',
        date: '2024-07-02',
        workout_date: '2024-07-02',
        start_time: '2024-07-02T18:00:00Z',
        end_time: '2024-07-02T19:20:00Z',
        duration: 80 * 60 * 1000,
        split: 'Shoulder',
        tod: 'PM',
        notes: 'Second shoulder day - progression in lateral raises',
        exercises: [
            {
                id: 12,
                name: 'Dumbbell Lateral Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 70, reps: 13, timestamp: '2024-07-02T18:05:00Z' }, // 35lbs per arm
                    { weight: 70, reps: 12, timestamp: '2024-07-02T18:07:00Z' },
                    { weight: 70, reps: 12, timestamp: '2024-07-02T18:09:00Z' },
                    { weight: 70, reps: 10, timestamp: '2024-07-02T18:11:00Z' }
                ]
            },
            {
                id: 13,
                name: 'Smith Machine Barbell Shrugs',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 155, reps: 18, timestamp: '2024-07-02T18:15:00Z' },
                    { weight: 175, reps: 14, timestamp: '2024-07-02T18:18:00Z' },
                    { weight: 185, reps: 12, timestamp: '2024-07-02T18:21:00Z' },
                    { weight: 195, reps: 10, timestamp: '2024-07-02T18:24:00Z' }
                ]
            },
            {
                id: 14,
                name: 'Cable Lateral Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 30, reps: 16, timestamp: '2024-07-02T18:28:00Z' },
                    { weight: 40, reps: 12, timestamp: '2024-07-02T18:30:00Z' },
                    { weight: 30, reps: 13, timestamp: '2024-07-02T18:32:00Z' }
                ]
            },
            {
                id: 19,
                name: 'Dumbbell Reverse Flyes',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 50, reps: 16, timestamp: '2024-07-02T18:36:00Z' }, // 25lbs per arm
                    { weight: 55, reps: 14, timestamp: '2024-07-02T18:38:00Z' }, // 27.5lbs per arm
                    { weight: 55, reps: 12, timestamp: '2024-07-02T18:40:00Z' }
                ]
            },
            {
                id: 16,
                name: 'Kettlebell Prone Y Raises',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 50, reps: 8, timestamp: '2024-07-02T18:44:00Z' },
                    { weight: 40, reps: 15, timestamp: '2024-07-02T18:46:00Z' },
                    { weight: 40, reps: 15, timestamp: '2024-07-02T18:48:00Z' }
                ]
            },
            {
                id: 17,
                name: 'Cable External Rotations',
                muscle_group: 'Shoulders',
                category: 'Isolation',
                sets: [
                    { weight: 20, reps: 12, timestamp: '2024-07-02T18:52:00Z' },
                    { weight: 25, reps: 14, timestamp: '2024-07-02T18:54:00Z' }
                ]
            }
        ]
    }
];

// Expose globally for app.js to use
if (typeof window !== 'undefined') {
    window.tylerCompleteWorkouts = tylerCompleteWorkouts;
}

console.log(`🏋️ Tyler's complete workout data loaded: ${tylerCompleteWorkouts.length} workouts from June 24 - July 2, 2024`);