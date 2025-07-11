-- HyperTrack Pro - Database Schema Setup
-- Run this script in your Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT,
    body_weight DECIMAL(5,2),
    height DECIMAL(5,2),
    age INTEGER,
    training_level TEXT CHECK (training_level IN ('novice', 'intermediate', 'advanced')),
    goals TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create exercises table (exercise database)
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (category IN ('Push', 'Pull', 'Legs', 'Core', 'Cardio')),
    muscles_worked TEXT[],
    equipment TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    instructions TEXT[],
    tips TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_minutes INTEGER,
    notes TEXT,
    workout_type TEXT,
    total_volume DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_exercises table (exercise instances in workouts)
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id),
    exercise_name TEXT NOT NULL, -- Denormalized for performance
    order_in_workout INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sets table
CREATE TABLE IF NOT EXISTS sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER,
    reps INTEGER,
    weight DECIMAL(6,2),
    rpe DECIMAL(3,1), -- Rate of Perceived Exertion (1-10)
    rest_time_seconds INTEGER,
    is_warmup BOOLEAN DEFAULT FALSE,
    is_failure BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_analytics table for cached calculations
CREATE TABLE IF NOT EXISTS workout_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    muscle_group TEXT,
    total_volume DECIMAL(10,2),
    total_sets INTEGER,
    avg_rpe DECIMAL(3,1),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workout_id, muscle_group)
);

-- Create research_facts table
CREATE TABLE IF NOT EXISTS research_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fact TEXT NOT NULL,
    source TEXT NOT NULL,
    category TEXT,
    practical_application TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_analytics_user ON workout_analytics(user_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user data isolation
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own workouts" ON workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Exercises and research facts are public (read-only for users)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises" ON exercises
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view research facts" ON research_facts
    FOR SELECT USING (true);

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