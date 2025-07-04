// Tyler's Complete Workout Data Integration
// Historical workout data for HyperTrack Pro - Updated with 2025 CSV data

// Tyler's actual workout history (converted from CSV)
const tylerCompleteWorkouts = [
    {
        id: 'workout-20250624-pull',
        date: '2025-06-24',
        workout_date: '2025-06-24',
        startTime: '2025-06-24T09:00:00Z',
        endTime: '2025-06-24T10:15:00Z',
        duration: 75 * 60 * 1000, // 75 minutes in milliseconds
        split: 'Pull',
        tod: 'AM',
        notes: 'Pull day - lat focus with bicep work',
        exercises: [
            {
                id: 1,
                name: 'Lat Pulldowns',
                muscle_group: 'Vertical Pull',
                category: 'Compound',
                sets: [
                    { weight: 130, reps: 12, timestamp: '2025-06-24T09:05:00Z' },
                    { weight: 130, reps: 15, timestamp: '2025-06-24T09:08:00Z' },
                    { weight: 145, reps: 11, timestamp: '2025-06-24T09:11:00Z' }
                ]
            },
            {
                id: 2,
                name: 'Smith Machine Rows',
                muscle_group: 'Horizontal Pull',
                category: 'Compound',
                sets: [
                    { weight: 165, reps: 5, timestamp: '2025-06-24T09:15:00Z' },
                    { weight: 145, reps: 9, timestamp: '2025-06-24T09:18:00Z' },
                    { weight: 145, reps: 9, timestamp: '2025-06-24T09:21:00Z' }
                ]
            },
            {
                id: 3,
                name: 'Face Pulls',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 55, reps: 16, timestamp: '2025-06-24T09:25:00Z' },
                    { weight: 65, reps: 13, timestamp: '2025-06-24T09:27:00Z' },
                    { weight: 65, reps: 14, timestamp: '2025-06-24T09:29:00Z' }
                ]
            },
            {
                id: 4,
                name: 'Dumbbell Bicep Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 80, reps: 11, timestamp: '2025-06-24T09:33:00Z' },
                    { weight: 80, reps: 13, timestamp: '2025-06-24T09:35:00Z' },
                    { weight: 90, reps: 9, timestamp: '2025-06-24T09:37:00Z' }
                ]
            },
            {
                id: 45,
                name: 'Reverse Grip EZ Bar Curl',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 12, timestamp: '2025-06-24T09:41:00Z' },
                    { weight: 60, reps: 15, timestamp: '2025-06-24T09:43:00Z' },
                    { weight: 60, reps: 10, timestamp: '2025-06-24T09:45:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20250625-push',
        date: '2025-06-25',
        workout_date: '2025-06-25',
        startTime: '2025-06-25T18:00:00Z',
        endTime: '2025-06-25T19:30:00Z',
        duration: 90 * 60 * 1000, // 90 minutes in milliseconds
        split: 'Push',
        tod: 'PM',
        notes: 'Push day - chest, shoulders, triceps with abs',
        exercises: [
            {
                id: 9,
                name: 'Bodyweight Dips',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 225, reps: 6, timestamp: '2025-06-25T18:05:00Z' }
                ]
            },
            {
                id: 11,
                name: 'Smith Machine Bench Press',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 165, reps: 8, timestamp: '2025-06-25T18:10:00Z' },
                    { weight: 165, reps: 9, timestamp: '2025-06-25T18:13:00Z' },
                    { weight: 175, reps: 6, timestamp: '2025-06-25T18:16:00Z' },
                    { weight: 165, reps: 8, timestamp: '2025-06-25T18:19:00Z' }
                ]
            },
            {
                id: 10,
                name: 'Incline Dumbbell Press',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 120, reps: 12, timestamp: '2025-06-25T18:25:00Z' },
                    { weight: 120, reps: 12, timestamp: '2025-06-25T18:28:00Z' },
                    { weight: 120, reps: 12, timestamp: '2025-06-25T18:31:00Z' }
                ]
            },
            {
                id: 9,
                name: 'Bodyweight Dips',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 225, reps: 5, timestamp: '2025-06-25T18:35:00Z' },
                    { weight: 225, reps: 6, timestamp: '2025-06-25T18:37:00Z' },
                    { weight: 225, reps: 6, timestamp: '2025-06-25T18:39:00Z' }
                ]
            },
            {
                id: 44,
                name: 'Cable Crunch Machine',
                muscle_group: 'Abs',
                category: 'Isolation',
                sets: [
                    { weight: 200, reps: 15, timestamp: '2025-06-25T18:43:00Z' },
                    { weight: 200, reps: 15, timestamp: '2025-06-25T18:45:00Z' },
                    { weight: 200, reps: 15, timestamp: '2025-06-25T18:47:00Z' }
                ]
            },
            {
                id: 7,
                name: 'Close-Grip Smith Machine Press',
                muscle_group: 'Triceps',
                category: 'Compound',
                sets: [
                    { weight: 95, reps: 20, timestamp: '2025-06-25T18:51:00Z' },
                    { weight: 115, reps: 12, timestamp: '2025-06-25T18:54:00Z' },
                    { weight: 135, reps: 8, timestamp: '2025-06-25T18:57:00Z' }
                ]
            },
            {
                id: 6,
                name: 'Tricep Cable Rope Pulldowns',
                muscle_group: 'Triceps',
                category: 'Isolation',
                sets: [
                    { weight: 55, reps: 13, timestamp: '2025-06-25T19:01:00Z' },
                    { weight: 55, reps: 11, timestamp: '2025-06-25T19:03:00Z' },
                    { weight: 50, reps: 14, timestamp: '2025-06-25T19:05:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20250626-shoulders',
        date: '2025-06-26',
        workout_date: '2025-06-26',
        startTime: '2025-06-26T18:00:00Z',
        endTime: '2025-06-26T19:20:00Z',
        duration: 80 * 60 * 1000, // 80 minutes in milliseconds
        split: 'Shoulder',
        tod: 'PM',
        notes: 'Shoulder specialization day - all deltoids and traps',
        exercises: [
            {
                id: 12,
                name: 'Dumbbell Lateral Raises',
                muscle_group: 'Side Delts',
                category: 'Isolation',
                sets: [
                    { weight: 30, reps: 12, timestamp: '2025-06-26T18:05:00Z' },
                    { weight: 60, reps: 12, timestamp: '2025-06-26T18:08:00Z' },
                    { weight: 60, reps: 14, timestamp: '2025-06-26T18:11:00Z' },
                    { weight: 60, reps: 16, timestamp: '2025-06-26T18:14:00Z' }
                ]
            },
            {
                id: 13,
                name: 'Smith Machine Barbell Shrugs',
                muscle_group: 'Traps',
                category: 'Isolation',
                sets: [
                    { weight: 135, reps: 18, timestamp: '2025-06-26T18:19:00Z' },
                    { weight: 165, reps: 12, timestamp: '2025-06-26T18:22:00Z' },
                    { weight: 175, reps: 14, timestamp: '2025-06-26T18:25:00Z' },
                    { weight: 185, reps: 11, timestamp: '2025-06-26T18:28:00Z' }
                ]
            },
            {
                id: 14,
                name: 'Cable Lateral Raises',
                muscle_group: 'Side Delts',
                category: 'Isolation',
                sets: [
                    { weight: 30, reps: 15, timestamp: '2025-06-26T18:33:00Z' },
                    { weight: 30, reps: 15, timestamp: '2025-06-26T18:35:00Z' },
                    { weight: 30, reps: 15, timestamp: '2025-06-26T18:37:00Z' }
                ]
            },
            {
                id: 46,
                name: 'EZ Bar Upright Rows',
                muscle_group: 'Side Delts',
                category: 'Compound',
                sets: [
                    { weight: 60, reps: 15, timestamp: '2025-06-26T18:41:00Z' },
                    { weight: 60, reps: 15, timestamp: '2025-06-26T18:43:00Z' },
                    { weight: 60, reps: 15, timestamp: '2025-06-26T18:45:00Z' }
                ]
            },
            {
                id: 16,
                name: 'Kettlebell Prone Y Raises',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 40, reps: 15, timestamp: '2025-06-26T18:49:00Z' },
                    { weight: 40, reps: 15, timestamp: '2025-06-26T18:51:00Z' },
                    { weight: 40, reps: 17, timestamp: '2025-06-26T18:53:00Z' }
                ]
            },
            {
                id: 17,
                name: 'Cable External Rotations',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 20, reps: 11, timestamp: '2025-06-26T18:57:00Z' },
                    { weight: 20, reps: 15, timestamp: '2025-06-26T18:59:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20250629-pull',
        date: '2025-06-29',
        workout_date: '2025-06-29',
        startTime: '2025-06-29T18:00:00Z',
        endTime: '2025-06-29T19:15:00Z',
        duration: 75 * 60 * 1000, // 75 minutes in milliseconds
        split: 'Pull',
        tod: 'PM',
        notes: 'Pull day - progression focus',
        exercises: [
            {
                id: 1,
                name: 'Lat Pulldowns',
                muscle_group: 'Vertical Pull',
                category: 'Compound',
                sets: [
                    { weight: 145, reps: 15, timestamp: '2025-06-29T18:05:00Z' },
                    { weight: 160, reps: 10, timestamp: '2025-06-29T18:08:00Z' },
                    { weight: 160, reps: 10, timestamp: '2025-06-29T18:11:00Z' }
                ]
            },
            {
                id: 2,
                name: 'Smith Machine Rows',
                muscle_group: 'Horizontal Pull',
                category: 'Compound',
                sets: [
                    { weight: 150, reps: 10, timestamp: '2025-06-29T18:15:00Z' },
                    { weight: 150, reps: 10, timestamp: '2025-06-29T18:18:00Z' },
                    { weight: 155, reps: 9, timestamp: '2025-06-29T18:21:00Z' }
                ]
            },
            {
                id: 3,
                name: 'Face Pulls',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 65, reps: 16, timestamp: '2025-06-29T18:25:00Z' },
                    { weight: 70, reps: 12, timestamp: '2025-06-29T18:27:00Z' },
                    { weight: 65, reps: 12, timestamp: '2025-06-29T18:29:00Z' }
                ]
            },
            {
                id: 4,
                name: 'Dumbbell Bicep Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 90, reps: 11, timestamp: '2025-06-29T18:33:00Z' },
                    { weight: 90, reps: 13, timestamp: '2025-06-29T18:35:00Z' },
                    { weight: 80, reps: 12, timestamp: '2025-06-29T18:37:00Z' }
                ]
            },
            {
                id: 45,
                name: 'Reverse Grip EZ Bar Curl',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 15, timestamp: '2025-06-29T18:41:00Z' },
                    { weight: 60, reps: 13, timestamp: '2025-06-29T18:43:00Z' },
                    { weight: 60, reps: 11, timestamp: '2025-06-29T18:45:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20250630-push',
        date: '2025-06-30',
        workout_date: '2025-06-30',
        startTime: '2025-06-30T18:00:00Z',
        endTime: '2025-06-30T19:20:00Z',
        duration: 80 * 60 * 1000, // 80 minutes in milliseconds
        split: 'Push',
        tod: 'PM',
        notes: 'Push day - strength progression',
        exercises: [
            {
                id: 11,
                name: 'Smith Machine Bench Press',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 175, reps: 9, timestamp: '2025-06-30T18:05:00Z' },
                    { weight: 175, reps: 8, timestamp: '2025-06-30T18:08:00Z' },
                    { weight: 175, reps: 8, timestamp: '2025-06-30T18:11:00Z' },
                    { weight: 165, reps: 8, timestamp: '2025-06-30T18:14:00Z' }
                ]
            },
            {
                id: 10,
                name: 'Incline Dumbbell Press',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 130, reps: 15, timestamp: '2025-06-30T18:19:00Z' },
                    { weight: 130, reps: 15, timestamp: '2025-06-30T18:22:00Z' },
                    { weight: 130, reps: 13, timestamp: '2025-06-30T18:25:00Z' }
                ]
            },
            {
                id: 9,
                name: 'Bodyweight Dips',
                muscle_group: 'Horizontal Push',
                category: 'Compound',
                sets: [
                    { weight: 225, reps: 7, timestamp: '2025-06-30T18:29:00Z' },
                    { weight: 225, reps: 8, timestamp: '2025-06-30T18:31:00Z' },
                    { weight: 225, reps: 7, timestamp: '2025-06-30T18:33:00Z' }
                ]
            },
            {
                id: 8,
                name: 'Dumbbell Flyes',
                muscle_group: 'Horizontal Push',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 17, timestamp: '2025-06-30T18:37:00Z' },
                    { weight: 70, reps: 15, timestamp: '2025-06-30T18:39:00Z' },
                    { weight: 80, reps: 12, timestamp: '2025-06-30T18:41:00Z' }
                ]
            },
            {
                id: 7,
                name: 'Close-Grip Smith Machine Press',
                muscle_group: 'Triceps',
                category: 'Compound',
                sets: [
                    { weight: 140, reps: 8, timestamp: '2025-06-30T18:45:00Z' },
                    { weight: 140, reps: 8, timestamp: '2025-06-30T18:48:00Z' },
                    { weight: 140, reps: 8, timestamp: '2025-06-30T18:51:00Z' }
                ]
            },
            {
                id: 6,
                name: 'Tricep Cable Rope Pulldowns',
                muscle_group: 'Triceps',
                category: 'Isolation',
                sets: [
                    { weight: 60, reps: 11, timestamp: '2025-06-30T18:55:00Z' },
                    { weight: 60, reps: 12, timestamp: '2025-06-30T18:57:00Z' },
                    { weight: 60, reps: 12, timestamp: '2025-06-30T18:59:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20250702-shoulders',
        date: '2025-07-02',
        workout_date: '2025-07-02',
        startTime: '2025-07-02T18:00:00Z',
        endTime: '2025-07-02T19:15:00Z',
        duration: 75 * 60 * 1000, // 75 minutes in milliseconds
        split: 'Shoulder',
        tod: 'PM',
        notes: 'Shoulder day - volume progression',
        exercises: [
            {
                id: 12,
                name: 'Dumbbell Lateral Raises',
                muscle_group: 'Side Delts',
                category: 'Isolation',
                sets: [
                    { weight: 70, reps: 13, timestamp: '2025-07-02T18:05:00Z' },
                    { weight: 70, reps: 12, timestamp: '2025-07-02T18:08:00Z' },
                    { weight: 70, reps: 12, timestamp: '2025-07-02T18:11:00Z' },
                    { weight: 70, reps: 10, timestamp: '2025-07-02T18:14:00Z' }
                ]
            },
            {
                id: 13,
                name: 'Smith Machine Barbell Shrugs',
                muscle_group: 'Traps',
                category: 'Isolation',
                sets: [
                    { weight: 155, reps: 18, timestamp: '2025-07-02T18:19:00Z' },
                    { weight: 175, reps: 14, timestamp: '2025-07-02T18:22:00Z' },
                    { weight: 185, reps: 12, timestamp: '2025-07-02T18:25:00Z' },
                    { weight: 195, reps: 10, timestamp: '2025-07-02T18:28:00Z' }
                ]
            },
            {
                id: 14,
                name: 'Cable Lateral Raises',
                muscle_group: 'Side Delts',
                category: 'Isolation',
                sets: [
                    { weight: 30, reps: 16, timestamp: '2025-07-02T18:33:00Z' },
                    { weight: 40, reps: 12, timestamp: '2025-07-02T18:35:00Z' },
                    { weight: 30, reps: 13, timestamp: '2025-07-02T18:37:00Z' }
                ]
            },
            {
                id: 15,
                name: 'Dumbbell Reverse Flyes',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 50, reps: 16, timestamp: '2025-07-02T18:41:00Z' },
                    { weight: 55, reps: 14, timestamp: '2025-07-02T18:43:00Z' },
                    { weight: 55, reps: 12, timestamp: '2025-07-02T18:45:00Z' }
                ]
            },
            {
                id: 16,
                name: 'Kettlebell Prone Y Raises',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 50, reps: 8, timestamp: '2025-07-02T18:49:00Z' },
                    { weight: 40, reps: 15, timestamp: '2025-07-02T18:51:00Z' },
                    { weight: 40, reps: 15, timestamp: '2025-07-02T18:53:00Z' }
                ]
            },
            {
                id: 17,
                name: 'Cable External Rotations',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 20, reps: 12, timestamp: '2025-07-02T18:57:00Z' },
                    { weight: 25, reps: 14, timestamp: '2025-07-02T18:59:00Z' }
                ]
            }
        ]
    },
    {
        id: 'workout-20250703-pull',
        date: '2025-07-03',
        workout_date: '2025-07-03',
        startTime: '2025-07-03T18:00:00Z',
        endTime: '2025-07-03T19:20:00Z',
        duration: 80 * 60 * 1000, // 80 minutes in milliseconds
        split: 'Pull',
        tod: 'PM',
        notes: 'Pull day - heavy back work with hammer curls',
        exercises: [
            {
                id: 1,
                name: 'Lat Pulldowns',
                muscle_group: 'Vertical Pull',
                category: 'Compound',
                sets: [
                    { weight: 160, reps: 10, timestamp: '2025-07-03T18:05:00Z' },
                    { weight: 160, reps: 9, timestamp: '2025-07-03T18:08:00Z' },
                    { weight: 145, reps: 12, timestamp: '2025-07-03T18:11:00Z' }
                ]
            },
            {
                id: 2,
                name: 'Smith Machine Rows',
                muscle_group: 'Horizontal Pull',
                category: 'Compound',
                sets: [
                    { weight: 180, reps: 6, timestamp: '2025-07-03T18:15:00Z' },
                    { weight: 165, reps: 8, timestamp: '2025-07-03T18:18:00Z' },
                    { weight: 145, reps: 10, timestamp: '2025-07-03T18:21:00Z' }
                ]
            },
            {
                id: 3,
                name: 'Face Pulls',
                muscle_group: 'Rear Delts',
                category: 'Isolation',
                sets: [
                    { weight: 70, reps: 14, timestamp: '2025-07-03T18:25:00Z' },
                    { weight: 70, reps: 12, timestamp: '2025-07-03T18:27:00Z' },
                    { weight: 65, reps: 13, timestamp: '2025-07-03T18:29:00Z' }
                ]
            },
            {
                id: 4,
                name: 'Dumbbell Bicep Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 90, reps: 10, timestamp: '2025-07-03T18:33:00Z' },
                    { weight: 90, reps: 10, timestamp: '2025-07-03T18:35:00Z' },
                    { weight: 80, reps: 12, timestamp: '2025-07-03T18:37:00Z' }
                ]
            },
            {
                id: 5,
                name: 'Cable Hammer Curls',
                muscle_group: 'Biceps',
                category: 'Isolation',
                sets: [
                    { weight: 47.5, reps: 14, timestamp: '2025-07-03T18:41:00Z' },
                    { weight: 52.5, reps: 11, timestamp: '2025-07-03T18:43:00Z' },
                    { weight: 52.5, reps: 12, timestamp: '2025-07-03T18:45:00Z' }
                ]
            },
            {
                id: 6,
                name: 'Tricep Cable Rope Pulldowns',
                muscle_group: 'Triceps',
                category: 'Isolation',
                sets: [
                    { weight: 65, reps: 12, timestamp: '2025-07-03T18:49:00Z' }
                ]
            }
        ]
    }
];

// NOTES FOR ANALYTICS & RECOMMENDATION CALCULATIONS:
// - Smith Machine bar weight (25lbs) is included in all logged weights
// - For bodyweight exercises, weight column represents Tyler's bodyweight (225lbs)
// - For single arm lifts (dumbbell exercises), weight is combined total of both dumbbells/arms
// - All exercises mapped to current database naming conventions
// - Muscle groups updated to match new biomechanical categorization system
// - Exercise progression visible across workouts for recommendation algorithm training