-- Add Tyler's 7/6/2025 workout to Supabase
-- Run this in your Supabase SQL Editor

INSERT INTO public.workouts (
    id,
    user_id,
    date,
    start_time,
    end_time,
    duration,
    split,
    time_of_day,
    notes,
    exercises
) VALUES (
    'workout-20250706-shoulders',
    'tyler_historical',
    '2025-07-06',
    '2025-07-06T13:21:47.978Z',
    '2025-07-06T14:09:34.570Z',
    2866592,
    'Shoulder',
    'PM',
    'Shoulder specialization day - lateral raises, traps, and rear delts',
    '[
        {
            "id": 12,
            "name": "Dumbbell Lateral Raises",
            "muscle_group": "Side Delts",
            "category": "Isolation",
            "sets": [
                {"weight": 60, "reps": 15, "timestamp": "2025-07-06T13:23:32.675Z"},
                {"weight": 70, "reps": 13, "timestamp": "2025-07-06T13:27:03.093Z"},
                {"weight": 80, "reps": 6, "timestamp": "2025-07-06T13:32:15.405Z"},
                {"weight": 70, "reps": 11, "timestamp": "2025-07-06T13:32:15.405Z"}
            ]
        },
        {
            "id": 13,
            "name": "Smith Machine Barbell Shrugs",
            "muscle_group": "Traps",
            "category": "Isolation",
            "sets": [
                {"weight": 185, "reps": 15, "timestamp": "2025-07-06T13:44:47.836Z"},
                {"weight": 195, "reps": 16, "timestamp": "2025-07-06T13:44:47.836Z"},
                {"weight": 215, "reps": 9, "timestamp": "2025-07-06T13:44:47.836Z"},
                {"weight": 205, "reps": 10, "timestamp": "2025-07-06T13:44:47.837Z"}
            ]
        },
        {
            "id": 14,
            "name": "Cable Lateral Raises",
            "muscle_group": "Side Delts",
            "category": "Isolation",
            "sets": [
                {"weight": 30, "reps": 15, "timestamp": "2025-07-06T13:52:44.452Z"},
                {"weight": 40, "reps": 8, "timestamp": "2025-07-06T13:52:44.452Z"},
                {"weight": 30, "reps": 15, "timestamp": "2025-07-06T13:52:44.452Z"}
            ]
        },
        {
            "id": 15,
            "name": "Dumbbell Reverse Flyes",
            "muscle_group": "Rear Delts",
            "category": "Isolation",
            "sets": [
                {"weight": 55, "reps": 15, "timestamp": "2025-07-06T14:00:41.357Z"},
                {"weight": 55, "reps": 15, "timestamp": "2025-07-06T14:00:41.357Z"},
                {"weight": 60, "reps": 12, "timestamp": "2025-07-06T14:00:41.357Z"}
            ]
        },
        {
            "id": 17,
            "name": "Cable External Rotations",
            "muscle_group": "Rear Delts",
            "category": "Isolation",
            "sets": [
                {"weight": 30, "reps": 9, "timestamp": "2025-07-06T14:09:34.570Z"},
                {"weight": 20, "reps": 15, "timestamp": "2025-07-06T14:09:34.570Z"},
                {"weight": 30, "reps": 12, "timestamp": "2025-07-06T14:09:34.570Z"}
            ]
        }
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Verify the workout was added
SELECT 
    id,
    date,
    split,
    jsonb_array_length(exercises) as exercise_count,
    (
        SELECT SUM((jsonb_array_length(exercise->'sets'))::int)
        FROM jsonb_array_elements(exercises) AS exercise
    ) as total_sets
FROM public.workouts 
WHERE id = 'workout-20250706-shoulders';