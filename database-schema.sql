-- HyperTrack Pro - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    training_level VARCHAR(20) DEFAULT 'intermediate' CHECK (training_level IN ('novice', 'intermediate', 'advanced')),
    bodyweight DECIMAL(5,2),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Exercises table (master exercise database)
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('Compound', 'Isolation')),
    tier INTEGER NOT NULL CHECK (tier IN (1, 2, 3)),
    mvc_percentage INTEGER NOT NULL CHECK (mvc_percentage >= 0 AND mvc_percentage <= 100),
    equipment VARCHAR(30) NOT NULL,
    gym_types TEXT[] NOT NULL,
    biomechanical_function VARCHAR(100) NOT NULL,
    target_rep_range VARCHAR(20) NOT NULL,
    rest_period INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    workout_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in milliseconds
    split_type VARCHAR(20) NOT NULL,
    tod VARCHAR(10) CHECK (tod IN ('AM', 'PM')),
    notes TEXT,
    total_volume DECIMAL(10,2) DEFAULT 0,
    total_sets INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id INTEGER REFERENCES exercises(id) NOT NULL,
    exercise_order INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sets table
CREATE TABLE IF NOT EXISTS sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    weight DECIMAL(6,2) NOT NULL,
    reps INTEGER NOT NULL,
    rpe DECIMAL(3,1) CHECK (rpe >= 1 AND rpe <= 10),
    rest_duration INTEGER, -- in seconds
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    show_research_facts BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT true,
    auto_start_rest_timer BOOLEAN DEFAULT true,
    compound_rest INTEGER DEFAULT 180,
    isolation_rest INTEGER DEFAULT 120,
    progression_rate DECIMAL(4,2) DEFAULT 3.5,
    training_level VARCHAR(20) DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise_id ON sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX IF NOT EXISTS idx_exercises_tier ON exercises(tier);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts" ON workouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" ON workouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" ON workouts
    FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies
CREATE POLICY "Users can view own workout exercises" ON workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own workout exercises" ON workout_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own workout exercises" ON workout_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own workout exercises" ON workout_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workouts 
            WHERE workouts.id = workout_exercises.workout_id 
            AND workouts.user_id = auth.uid()
        )
    );

-- Sets policies
CREATE POLICY "Users can view own sets" ON sets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own sets" ON sets
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own sets" ON sets
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own sets" ON sets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_exercises 
            JOIN workouts ON workouts.id = workout_exercises.workout_id
            WHERE workout_exercises.id = sets.workout_exercise_id 
            AND workouts.user_id = auth.uid()
        )
    );

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Exercises table is public read (everyone can see all exercises)
CREATE POLICY "Anyone can view exercises" ON exercises
    FOR SELECT USING (true);

-- Function to automatically create user profile and settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, username)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
    
    INSERT INTO public.user_settings (user_id)
    VALUES (new.id);
    
    RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();