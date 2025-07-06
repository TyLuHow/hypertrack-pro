-- HyperTrack Pro Database Setup
-- Run this in your Supabase SQL Editor

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
    id integer primary key,
    name text not null unique,
    muscle_group text not null,
    category text not null check (category in ('Compound', 'Isolation')),
    tier integer not null check (tier in (1, 2, 3)),
    mvc_percentage integer,
    equipment text not null,
    target_rep_range text,
    rest_period integer -- in seconds
);

-- Create workouts table  
CREATE TABLE IF NOT EXISTS public.workouts (
    id text primary key,
    user_id text not null,
    date date not null,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    duration integer, -- in milliseconds
    split text,
    time_of_day text check (time_of_day in ('AM', 'PM', 'Evening')),
    notes text,
    exercises jsonb not null default '[]'::jsonb,
    created_at timestamp with time zone default now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx ON public.workouts(date desc);
CREATE INDEX IF NOT EXISTS exercises_muscle_group_idx ON public.exercises(muscle_group);

-- DISABLE RLS for now (we'll enable it once everything works)
ALTER TABLE public.exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts DISABLE ROW LEVEL SECURITY;

-- Insert basic exercises
INSERT INTO public.exercises (id, name, muscle_group, category, tier, mvc_percentage, equipment, target_rep_range, rest_period) VALUES
(1, 'Lat Pulldowns', 'Vertical Pull', 'Compound', 1, 90, 'Cable Machine', '8-12', 180),
(2, 'Smith Machine Rows', 'Horizontal Pull', 'Compound', 1, 88, 'Smith Machine', '6-10', 180),
(3, 'Face Pulls', 'Rear Delts', 'Isolation', 2, 65, 'Cable Machine', '12-16', 120),
(4, 'Dumbbell Bicep Curls', 'Biceps', 'Isolation', 1, 82, 'Dumbbells', '8-12', 120),
(5, 'Cable Hammer Curls', 'Biceps', 'Isolation', 2, 78, 'Cable Machine', '10-14', 120),
(6, 'Tricep Cable Rope Pulldowns', 'Triceps', 'Isolation', 2, 75, 'Cable Machine', '10-15', 120),
(7, 'Close-Grip Smith Machine Press', 'Triceps', 'Compound', 1, 88, 'Smith Machine', '8-12', 180),
(8, 'Dumbbell Flyes', 'Horizontal Push', 'Isolation', 2, 60, 'Dumbbells', '12-15', 120),
(9, 'Bodyweight Dips', 'Horizontal Push', 'Compound', 1, 85, 'Bodyweight', '6-12', 180),
(10, 'Incline Dumbbell Press', 'Horizontal Push', 'Compound', 1, 90, 'Dumbbells', '8-12', 180),
(11, 'Smith Machine Bench Press', 'Horizontal Push', 'Compound', 1, 90, 'Smith Machine', '6-10', 180),
(12, 'Dumbbell Lateral Raises', 'Side Delts', 'Isolation', 1, 65, 'Dumbbells', '12-20', 120),
(13, 'Smith Machine Barbell Shrugs', 'Traps', 'Isolation', 2, 60, 'Smith Machine', '10-18', 120),
(14, 'Cable Lateral Raises', 'Side Delts', 'Isolation', 2, 62, 'Cable Machine', '15-20', 120),
(15, 'Dumbbell Reverse Flyes', 'Rear Delts', 'Isolation', 2, 58, 'Dumbbells', '12-16', 120),
(16, 'Kettlebell Prone Y Raises', 'Rear Delts', 'Isolation', 3, 45, 'Kettlebell', '15-20', 120),
(17, 'Cable External Rotations', 'Rear Delts', 'Isolation', 3, 40, 'Cable Machine', '15-20', 120),
(44, 'Cable Crunch Machine', 'Abs', 'Isolation', 2, 65, 'Cable Machine', '15-20', 120),
(45, 'Reverse Grip EZ Bar Curl', 'Biceps', 'Isolation', 2, 75, 'EZ Bar', '10-15', 120),
(46, 'EZ Bar Upright Rows', 'Side Delts', 'Compound', 2, 70, 'EZ Bar', '12-16', 120),
(47, 'Chest Press Machine', 'Horizontal Push', 'Compound', 2, 85, 'Machine', '10-15', 180)
ON CONFLICT (id) DO NOTHING;

-- Test query to verify setup
SELECT 'Database setup complete!' as message, count(*) as exercise_count FROM exercises;