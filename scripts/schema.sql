-- HyperTrack Pro Database Schema
-- PostgreSQL schema for evidence-based workout tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{
        "showResearchFacts": true,
        "darkMode": true,
        "compoundRest": 180,
        "isolationRest": 90,
        "progressionRate": 2.5
    }'
);

-- Exercise database table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Compound' or 'Isolation'
    tier INTEGER NOT NULL, -- 1 = primary, 2 = accessory
    mvc_percentage INTEGER, -- Maximum Voluntary Contraction percentage
    equipment JSONB DEFAULT '[]',
    description TEXT,
    research_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert research-backed exercises
INSERT INTO exercises (name, muscle_group, category, tier, mvc_percentage, equipment, description) VALUES
-- Chest exercises
('Barbell Bench Press', 'Chest', 'Compound', 1, 95, '["barbell", "bench"]', 'The gold standard for chest development with highest pectoralis major activation.'),
('Incline Dumbbell Press', 'Chest', 'Compound', 1, 90, '["dumbbells", "incline_bench"]', 'Superior upper chest activation compared to flat pressing movements.'),
('Dips', 'Chest', 'Compound', 1, 85, '["dip_station"]', 'Excellent compound movement for chest, triceps, and anterior deltoids.'),
('Cable Flyes', 'Chest', 'Isolation', 2, 60, '["cable_machine"]', 'Isolation movement maintaining constant tension throughout range of motion.'),

-- Back exercises
('Pull-ups', 'Back', 'Compound', 1, 117, '["pull_up_bar"]', 'Highest latissimus dorsi activation among all pulling exercises.'),
('Barbell Rows', 'Back', 'Compound', 1, 93, '["barbell"]', 'Excellent for building back thickness and overall pulling strength.'),
('Lat Pulldowns', 'Back', 'Compound', 1, 90, '["lat_pulldown_machine"]', 'Machine alternative to pull-ups with adjustable resistance.'),
('Face Pulls', 'Back', 'Isolation', 2, 65, '["cable_machine"]', 'Critical for rear deltoid and rhomboid development.'),

-- Leg exercises
('Squats', 'Legs', 'Compound', 1, 95, '["barbell", "squat_rack"]', 'The king of exercises - full-body compound movement.'),
('Romanian Deadlifts', 'Legs', 'Compound', 1, 90, '["barbell"]', 'Primary hamstring and glute developer with hip hinge pattern.'),
('Leg Press', 'Legs', 'Compound', 1, 88, '["leg_press_machine"]', 'Safe alternative to squats allowing for heavier loading.'),
('Leg Curls', 'Legs', 'Isolation', 2, 70, '["leg_curl_machine"]', 'Direct hamstring isolation with knee flexion movement.'),

-- Shoulder exercises
('Overhead Press', 'Shoulders', 'Compound', 1, 85, '["barbell"]', 'Primary compound movement for shoulder development and stability.'),
('Lateral Raises', 'Shoulders', 'Isolation', 2, 65, '["dumbbells"]', 'Direct medial deltoid isolation for shoulder width.'),
('Rear Delt Flyes', 'Shoulders', 'Isolation', 2, 60, '["dumbbells"]', 'Essential for balanced shoulder development and posture.'),

-- Arm exercises
('Barbell Curls', 'Arms', 'Isolation', 1, 90, '["barbell"]', 'Classic bicep builder allowing for maximum loading potential.'),
('Hammer Curls', 'Arms', 'Isolation', 2, 75, '["dumbbells"]', 'Targets brachialis and brachioradialis for arm thickness.'),
('Close-Grip Bench Press', 'Arms', 'Compound', 1, 85, '["barbell", "bench"]', 'Compound tricep movement allowing for heavy progressive overload.'),
('Tricep Pushdowns', 'Arms', 'Isolation', 2, 75, '["cable_machine"]', 'Direct tricep isolation with constant tension throughout movement.')
ON CONFLICT DO NOTHING;

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id),
    exercise_order INTEGER NOT NULL,
    parameters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sets table
CREATE TABLE IF NOT EXISTS sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    weight DECIMAL(6,2),
    reps INTEGER,
    rpe INTEGER, -- Rate of Perceived Exertion (1-10)
    tempo VARCHAR(20), -- e.g., "3-1-1-0"
    rest_time_actual INTEGER, -- seconds
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal records table
CREATE TABLE IF NOT EXISTS personal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id),
    record_type VARCHAR(50) NOT NULL, -- '1RM', 'Volume', 'Endurance'
    value DECIMAL(8,2) NOT NULL,
    secondary_value DECIMAL(8,2), -- For rep maxes, etc.
    achieved_date DATE NOT NULL,
    workout_id UUID REFERENCES workouts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exercise_id, record_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise ON sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);

-- Create views for analytics
CREATE OR REPLACE VIEW workout_analytics AS
SELECT 
    w.user_id,
    COUNT(*) as total_workouts,
    AVG(EXTRACT(EPOCH FROM (w.end_time - w.start_time))/60) as avg_duration_minutes,
    SUM(s.weight * s.reps) as total_volume_lbs,
    COUNT(s.id) as total_sets
FROM workouts w
LEFT JOIN workout_exercises we ON w.id = we.workout_id
LEFT JOIN sets s ON we.id = s.workout_exercise_id
WHERE w.end_time IS NOT NULL
GROUP BY w.user_id;

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (Note: These require auth.uid() function from Supabase)
-- Users can only see their own data
-- CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- CREATE POLICY "Users can view own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);
-- CREATE POLICY "Users can view own workout exercises" ON workout_exercises FOR ALL USING (
--     EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_exercises.workout_id AND workouts.user_id = auth.uid())
-- );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for public access (adjust for your needs)
GRANT SELECT ON exercises TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON workouts TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON workout_exercises TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON sets TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON personal_records TO public;
GRANT SELECT ON workout_analytics TO public;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO public;