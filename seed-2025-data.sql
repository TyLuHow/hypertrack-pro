-- Seed 2025 Workout Data for HyperTrack Pro
-- Run this after creating the database schema

-- First, let's seed the exercises table with the comprehensive database
INSERT INTO exercises (name, muscle_group, category, tier, mvc_percentage, equipment, gym_types, biomechanical_function, target_rep_range, rest_period) VALUES
-- VERTICAL PULL
('Lat Pulldowns', 'Vertical Pull', 'Compound', 1, 90, 'cable', ARRAY['commercial', 'barbell', 'crossfit'], 'Shoulder Adduction', '8-12', 180),
('Wide-Grip Pull-ups', 'Vertical Pull', 'Compound', 1, 95, 'bodyweight', ARRAY['commercial', 'barbell', 'crossfit', 'minimalist'], 'Shoulder Adduction', '5-10', 180),
('Assisted Pull-ups', 'Vertical Pull', 'Compound', 2, 85, 'machine', ARRAY['commercial', 'planet_fitness'], 'Shoulder Adduction', '8-12', 180),

-- HORIZONTAL PULL
('Smith Machine Rows', 'Horizontal Pull', 'Compound', 1, 95, 'smith', ARRAY['commercial', 'planet_fitness'], 'Shoulder Extension', '8-12', 180),
('Barbell Bent-Over Rows', 'Horizontal Pull', 'Compound', 1, 100, 'barbell', ARRAY['barbell', 'crossfit', 'minimalist'], 'Shoulder Extension', '6-10', 180),
('Seated Cable Rows', 'Horizontal Pull', 'Compound', 2, 88, 'cable', ARRAY['commercial', 'crossfit'], 'Shoulder Extension', '10-15', 150),
('Dumbbell Single-Arm Rows', 'Horizontal Pull', 'Compound', 2, 85, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Extension', '10-15', 150),

-- HORIZONTAL PUSH
('Smith Machine Bench Press', 'Horizontal Push', 'Compound', 1, 95, 'smith', ARRAY['commercial', 'planet_fitness'], 'Shoulder Horizontal Adduction', '6-10', 180),
('Barbell Bench Press', 'Horizontal Push', 'Compound', 1, 100, 'barbell', ARRAY['barbell', 'crossfit'], 'Shoulder Horizontal Adduction', '6-10', 180),
('Incline Dumbbell Press', 'Horizontal Push', 'Compound', 1, 90, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Horizontal Adduction', '8-12', 180),
('Bodyweight Dips', 'Horizontal Push', 'Compound', 1, 95, 'bodyweight', ARRAY['commercial', 'crossfit', 'minimalist'], 'Shoulder Horizontal Adduction', '8-15', 180),
('Dumbbell Flyes', 'Horizontal Push', 'Isolation', 2, 80, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Horizontal Adduction', '12-15', 120),

-- VERTICAL PUSH
('Standing Overhead Press', 'Vertical Push', 'Compound', 1, 90, 'barbell', ARRAY['barbell', 'crossfit', 'minimalist'], 'Shoulder Flexion', '6-10', 180),
('Seated Dumbbell Press', 'Vertical Push', 'Compound', 1, 85, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Flexion', '8-12', 180),
('Smith Machine Shoulder Press', 'Vertical Push', 'Compound', 2, 80, 'smith', ARRAY['commercial', 'planet_fitness'], 'Shoulder Flexion', '8-12', 180),

-- SIDE DELTS
('Dumbbell Lateral Raises', 'Side Delts', 'Isolation', 1, 75, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Abduction', '12-20', 90),
('Cable Lateral Raises', 'Side Delts', 'Isolation', 1, 70, 'cable', ARRAY['commercial', 'crossfit'], 'Shoulder Abduction', '12-20', 90),
('Machine Lateral Raises', 'Side Delts', 'Isolation', 2, 68, 'machine', ARRAY['commercial', 'planet_fitness'], 'Shoulder Abduction', '12-20', 90),
('EZ Bar Upright Rows', 'Side Delts', 'Compound', 3, 65, 'barbell', ARRAY['commercial', 'barbell', 'crossfit'], 'Shoulder Abduction', '12-20', 90),

-- REAR DELTS
('Face Pulls', 'Rear Delts', 'Isolation', 1, 75, 'cable', ARRAY['commercial', 'crossfit'], 'Shoulder Horizontal Abduction', '15-25', 90),
('Dumbbell Reverse Flyes', 'Rear Delts', 'Isolation', 2, 70, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Horizontal Abduction', '15-25', 90),
('Kettlebell Prone Y Raises', 'Rear Delts', 'Isolation', 3, 65, 'kettlebell', ARRAY['crossfit', 'minimalist'], 'Shoulder Horizontal Abduction', '15-25', 90),
('Cable External Rotations', 'Rear Delts', 'Isolation', 3, 60, 'cable', ARRAY['commercial', 'crossfit'], 'External Rotation', '15-25', 90),

-- TRAPS
('Smith Machine Barbell Shrugs', 'Traps', 'Isolation', 1, 85, 'smith', ARRAY['commercial', 'planet_fitness'], 'Shoulder Elevation', '10-15', 120),
('Barbell Shrugs', 'Traps', 'Isolation', 1, 90, 'barbell', ARRAY['barbell', 'crossfit', 'minimalist'], 'Shoulder Elevation', '10-15', 120),
('Dumbbell Shrugs', 'Traps', 'Isolation', 2, 80, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Shoulder Elevation', '12-20', 120),

-- BICEPS
('Dumbbell Bicep Curls', 'Biceps', 'Isolation', 1, 90, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Elbow Flexion', '10-15', 90),
('Barbell Bicep Curls', 'Biceps', 'Isolation', 1, 95, 'barbell', ARRAY['barbell', 'crossfit', 'minimalist'], 'Elbow Flexion', '8-12', 90),
('Cable Hammer Curls', 'Biceps', 'Isolation', 2, 85, 'cable', ARRAY['commercial', 'crossfit'], 'Elbow Flexion', '10-15', 90),
('Dumbbell Hammer Curls', 'Biceps', 'Isolation', 2, 82, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Elbow Flexion', '10-15', 90),
('Reverse Grip EZ Bar Curl', 'Biceps', 'Isolation', 2, 80, 'barbell', ARRAY['commercial', 'barbell', 'crossfit'], 'Elbow Flexion', '10-15', 90),

-- TRICEPS
('Tricep Cable Rope Pulldowns', 'Triceps', 'Isolation', 1, 80, 'cable', ARRAY['commercial', 'crossfit'], 'Elbow Extension', '12-20', 90),
('Close-Grip Smith Machine Press', 'Triceps', 'Compound', 1, 85, 'smith', ARRAY['commercial', 'planet_fitness'], 'Elbow Extension', '8-12', 120),
('Close-Grip Bench Press', 'Triceps', 'Compound', 1, 90, 'barbell', ARRAY['barbell', 'crossfit'], 'Elbow Extension', '8-12', 120),
('Overhead Tricep Extension', 'Triceps', 'Isolation', 2, 75, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Elbow Extension', '12-20', 90),

-- LEGS
('Smith Machine Squats', 'Quads', 'Compound', 1, 90, 'smith', ARRAY['commercial', 'planet_fitness'], 'Knee Extension', '8-15', 180),
('Barbell Back Squats', 'Quads', 'Compound', 1, 95, 'barbell', ARRAY['barbell', 'crossfit'], 'Knee Extension', '6-12', 180),
('Leg Press', 'Quads', 'Compound', 2, 85, 'machine', ARRAY['commercial', 'planet_fitness'], 'Knee Extension', '12-20', 150),
('Romanian Deadlifts', 'Hamstrings', 'Compound', 1, 95, 'barbell', ARRAY['barbell', 'crossfit', 'minimalist'], 'Hip Hinge', '8-12', 180),
('Dumbbell Romanian Deadlifts', 'Hamstrings', 'Compound', 1, 88, 'dumbbell', ARRAY['commercial', 'minimalist', 'planet_fitness'], 'Hip Hinge', '10-15', 180),
('Lying Leg Curls', 'Hamstrings', 'Isolation', 2, 80, 'machine', ARRAY['commercial', 'planet_fitness'], 'Knee Flexion', '12-20', 120),
('Hip Thrusts', 'Glutes', 'Compound', 1, 95, 'barbell', ARRAY['commercial', 'barbell', 'crossfit'], 'Hip Extension', '8-15', 150),
('Dumbbell Hip Thrusts', 'Glutes', 'Compound', 2, 85, 'dumbbell', ARRAY['minimalist', 'planet_fitness'], 'Hip Extension', '12-20', 150),
('Standing Calf Raises', 'Calves', 'Isolation', 1, 85, 'machine', ARRAY['commercial', 'planet_fitness'], 'Plantar Flexion', '15-25', 90),
('Dumbbell Calf Raises', 'Calves', 'Isolation', 2, 75, 'dumbbell', ARRAY['minimalist', 'commercial'], 'Plantar Flexion', '15-25', 90),

-- ABS
('Cable Crunch Machine', 'Abs', 'Isolation', 2, 70, 'cable', ARRAY['commercial', 'planet_fitness'], 'Spinal Flexion', '15-25', 60)

ON CONFLICT (name) DO NOTHING;

-- Now let's create a demo user and seed Tyler's 2025 workout data
-- Note: You'll need to replace 'demo-user-id' with an actual user ID after creating an account

-- Insert demo workouts (you'll need to update user_id after authentication)
-- Workout 1: June 24, 2025 - Pull Day
INSERT INTO workouts (user_id, workout_date, start_time, end_time, duration, split_type, tod, notes, total_sets, total_volume) VALUES
('00000000-0000-0000-0000-000000000000', '2025-06-24', '2025-06-24T09:00:00Z', '2025-06-24T10:15:00Z', 4500000, 'Pull', 'AM', 'Pull day - lat focus with bicep work', 15, 8850);

-- Note: You'll need to manually insert the full workout data after user registration
-- This is just a template to show the structure

-- Create a function to seed Tyler's complete workout data for a user
CREATE OR REPLACE FUNCTION seed_tyler_workouts(target_user_id UUID)
RETURNS void AS $$
DECLARE
    workout_id_1 UUID;
    workout_id_2 UUID;
    workout_id_3 UUID;
    workout_id_4 UUID;
    workout_id_5 UUID;
    workout_id_6 UUID;
    workout_id_7 UUID;
    
    lat_pulldown_id INTEGER;
    smith_row_id INTEGER;
    face_pulls_id INTEGER;
    db_curl_id INTEGER;
    ez_curl_id INTEGER;
    bench_press_id INTEGER;
    incline_db_id INTEGER;
    dips_id INTEGER;
    cable_crunch_id INTEGER;
    cg_smith_id INTEGER;
    tricep_rope_id INTEGER;
    lat_raise_id INTEGER;
    shrugs_id INTEGER;
    cable_lat_id INTEGER;
    ez_upright_id INTEGER;
    prone_y_id INTEGER;
    ext_rot_id INTEGER;
    rev_fly_id INTEGER;
    cable_hammer_id INTEGER;
    db_fly_id INTEGER;
    
    we_id UUID;
BEGIN
    -- Get exercise IDs
    SELECT id INTO lat_pulldown_id FROM exercises WHERE name = 'Lat Pulldowns';
    SELECT id INTO smith_row_id FROM exercises WHERE name = 'Smith Machine Rows';
    SELECT id INTO face_pulls_id FROM exercises WHERE name = 'Face Pulls';
    SELECT id INTO db_curl_id FROM exercises WHERE name = 'Dumbbell Bicep Curls';
    SELECT id INTO ez_curl_id FROM exercises WHERE name = 'Reverse Grip EZ Bar Curl';
    SELECT id INTO bench_press_id FROM exercises WHERE name = 'Smith Machine Bench Press';
    SELECT id INTO incline_db_id FROM exercises WHERE name = 'Incline Dumbbell Press';
    SELECT id INTO dips_id FROM exercises WHERE name = 'Bodyweight Dips';
    SELECT id INTO cable_crunch_id FROM exercises WHERE name = 'Cable Crunch Machine';
    SELECT id INTO cg_smith_id FROM exercises WHERE name = 'Close-Grip Smith Machine Press';
    SELECT id INTO tricep_rope_id FROM exercises WHERE name = 'Tricep Cable Rope Pulldowns';
    SELECT id INTO lat_raise_id FROM exercises WHERE name = 'Dumbbell Lateral Raises';
    SELECT id INTO shrugs_id FROM exercises WHERE name = 'Smith Machine Barbell Shrugs';
    SELECT id INTO cable_lat_id FROM exercises WHERE name = 'Cable Lateral Raises';
    SELECT id INTO ez_upright_id FROM exercises WHERE name = 'EZ Bar Upright Rows';
    SELECT id INTO prone_y_id FROM exercises WHERE name = 'Kettlebell Prone Y Raises';
    SELECT id INTO ext_rot_id FROM exercises WHERE name = 'Cable External Rotations';
    SELECT id INTO rev_fly_id FROM exercises WHERE name = 'Dumbbell Reverse Flyes';
    SELECT id INTO cable_hammer_id FROM exercises WHERE name = 'Cable Hammer Curls';
    SELECT id INTO db_fly_id FROM exercises WHERE name = 'Dumbbell Flyes';

    -- Workout 1: 2025-06-24 Pull Day
    INSERT INTO workouts (user_id, workout_date, start_time, end_time, duration, split_type, tod, notes, total_sets, total_volume)
    VALUES (target_user_id, '2025-06-24', '2025-06-24T09:00:00Z', '2025-06-24T10:15:00Z', 4500000, 'Pull', 'AM', 'Pull day - lat focus with bicep work', 15, 8850)
    RETURNING id INTO workout_id_1;

    -- Lat Pulldowns
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES (workout_id_1, lat_pulldown_id, 1) RETURNING id INTO we_id;
    INSERT INTO sets (workout_exercise_id, set_number, weight, reps, completed_at) VALUES 
        (we_id, 1, 130, 12, '2025-06-24T09:05:00Z'),
        (we_id, 2, 130, 15, '2025-06-24T09:08:00Z'),
        (we_id, 3, 145, 11, '2025-06-24T09:11:00Z');

    -- Smith Machine Rows
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES (workout_id_1, smith_row_id, 2) RETURNING id INTO we_id;
    INSERT INTO sets (workout_exercise_id, set_number, weight, reps, completed_at) VALUES 
        (we_id, 1, 165, 5, '2025-06-24T09:15:00Z'),
        (we_id, 2, 145, 9, '2025-06-24T09:18:00Z'),
        (we_id, 3, 145, 9, '2025-06-24T09:21:00Z');

    -- Face Pulls
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES (workout_id_1, face_pulls_id, 3) RETURNING id INTO we_id;
    INSERT INTO sets (workout_exercise_id, set_number, weight, reps, completed_at) VALUES 
        (we_id, 1, 55, 16, '2025-06-24T09:25:00Z'),
        (we_id, 2, 65, 13, '2025-06-24T09:27:00Z'),
        (we_id, 3, 65, 14, '2025-06-24T09:29:00Z');

    -- Dumbbell Bicep Curls
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES (workout_id_1, db_curl_id, 4) RETURNING id INTO we_id;
    INSERT INTO sets (workout_exercise_id, set_number, weight, reps, completed_at) VALUES 
        (we_id, 1, 80, 11, '2025-06-24T09:33:00Z'),
        (we_id, 2, 80, 13, '2025-06-24T09:35:00Z'),
        (we_id, 3, 90, 9, '2025-06-24T09:37:00Z');

    -- Reverse Grip EZ Bar Curl
    INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order) VALUES (workout_id_1, ez_curl_id, 5) RETURNING id INTO we_id;
    INSERT INTO sets (workout_exercise_id, set_number, weight, reps, completed_at) VALUES 
        (we_id, 1, 60, 12, '2025-06-24T09:41:00Z'),
        (we_id, 2, 60, 15, '2025-06-24T09:43:00Z'),
        (we_id, 3, 60, 10, '2025-06-24T09:45:00Z');

    -- Continue with remaining workouts...
    -- (This is a sample - the full implementation would include all 7 workouts)
    
    RAISE NOTICE 'Tyler''s workout data seeded successfully for user %', target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Instructions to run after user registration:
-- SELECT seed_tyler_workouts('your-user-id-here');