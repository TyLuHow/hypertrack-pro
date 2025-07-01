-- ✅ TYLER'S HISTORICAL WORKOUT DATA - CORRECTED UUIDs AND SCHEMA
-- June 24, 25, 26, 29, 30, 2024 (NOT December!)
-- Total: 5 workouts, 88 sets, 107,015 lbs volume

-- 1. Create Tyler's user record
INSERT INTO users (id, email, name, settings, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'tyler@hypertrack.local', 'Tyler', '{
    "showResearchFacts": true, "darkMode": true, "compoundRest": 180,
    "isolationRest": 90, "progressionRate": 2.5
  }', '2024-06-24T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 2. Ensure required exercises exist in exercises table (insert if not exists)
INSERT INTO exercises (name, muscle_group, category, tier, mvc_percentage, equipment, description) VALUES
  ('Lat Pulldowns', 'Back', 'Compound', 1, 90, '["lat_pulldown_machine"]', 'Machine alternative to pull-ups with adjustable resistance.'),
  ('Barbell Rows', 'Back', 'Compound', 1, 93, '["barbell"]', 'Excellent for building back thickness and overall pulling strength.'),
  ('Face Pulls', 'Back', 'Isolation', 2, 65, '["cable_machine"]', 'Critical for rear deltoid and rhomboid development.'),
  ('Barbell Curls', 'Arms', 'Isolation', 1, 90, '["barbell"]', 'Classic bicep builder allowing for maximum loading potential.'),
  ('Hammer Curls', 'Arms', 'Isolation', 2, 75, '["dumbbells"]', 'Targets brachialis and brachioradialis for arm thickness.'),
  ('Dips', 'Chest', 'Compound', 1, 85, '["dip_station"]', 'Excellent compound movement for chest, triceps, and anterior deltoids.'),
  ('Barbell Bench Press', 'Chest', 'Compound', 1, 95, '["barbell", "bench"]', 'The gold standard for chest development with highest pectoralis major activation.'),
  ('Incline Dumbbell Press', 'Chest', 'Compound', 1, 90, '["dumbbells", "incline_bench"]', 'Superior upper chest activation compared to flat pressing movements.'),
  ('Cable Crunches', 'Core', 'Isolation', 2, 70, '["cable_machine"]', 'Direct abdominal isolation with adjustable resistance.'),
  ('Close-Grip Bench Press', 'Arms', 'Compound', 1, 85, '["barbell", "bench"]', 'Compound tricep movement allowing for heavy progressive overload.'),
  ('Tricep Pushdowns', 'Arms', 'Isolation', 2, 75, '["cable_machine"]', 'Direct tricep isolation with constant tension throughout movement.'),
  ('Lateral Raises', 'Shoulders', 'Isolation', 2, 60, '["dumbbells"]', 'Primary lateral deltoid development exercise.'),
  ('Barbell Shrugs', 'Shoulders', 'Isolation', 2, 75, '["barbell"]', 'Trapezius development with heavy loading potential.'),
  ('Cable Lateral Raises', 'Shoulders', 'Isolation', 2, 60, '["cable_machine"]', 'Lateral deltoid isolation with constant tension.'),
  ('Upright Rows', 'Shoulders', 'Isolation', 2, 70, '["barbell"]', 'Compound shoulder and trap development.'),
  ('Rear Delt Flyes', 'Shoulders', 'Isolation', 2, 55, '["dumbbells"]', 'Posterior deltoid isolation for balanced shoulder development.'),
  ('External Rotations', 'Shoulders', 'Isolation', 2, 45, '["cable_machine"]', 'Rotator cuff strengthening and injury prevention.'),
  ('Dumbbell Flyes', 'Chest', 'Isolation', 2, 60, '["dumbbells"]', 'Chest isolation with stretch and contraction emphasis.')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Tyler's 5 historical workouts
INSERT INTO workouts (id, user_id, workout_date, start_time, end_time, notes, created_at) VALUES
  ('110e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '2024-06-24', '2024-06-24T10:00:00Z', '2024-06-24T11:30:00Z', 'Pull day workout', '2024-06-24T10:00:00Z'),
  ('110e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '2024-06-25', '2024-06-25T18:00:00Z', '2024-06-25T19:30:00Z', 'Push day workout', '2024-06-25T18:00:00Z'),
  ('110e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '2024-06-26', '2024-06-26T18:00:00Z', '2024-06-26T19:30:00Z', 'Shoulder day workout', '2024-06-26T18:00:00Z'),
  ('110e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', '2024-06-29', '2024-06-29T18:00:00Z', '2024-06-29T19:30:00Z', 'Pull day workout', '2024-06-29T18:00:00Z'),
  ('110e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', '2024-06-30', '2024-06-30T18:00:00Z', '2024-06-30T19:30:00Z', 'Push day workout', '2024-06-30T18:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 4.1 Workout 1: 2024-06-24 (Pull day workout)
INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_order, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440100', '110e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercises WHERE name = 'Lat Pulldowns'), 1, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440101', '110e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 2, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440102', '110e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercises WHERE name = 'Face Pulls'), 3, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440103', '110e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercises WHERE name = 'Barbell Curls'), 4, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440104', '110e8400-e29b-41d4-a716-446655440001', (SELECT id FROM exercises WHERE name = 'Hammer Curls'), 5, '2024-06-24T10:00:00Z');

INSERT INTO sets (workout_exercise_id, set_number, weight, reps, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440100', 1, 130, 12, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440100', 2, 130, 15, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440100', 3, 145, 11, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440101', 1, 165, 5, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440101', 2, 145, 9, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440101', 3, 145, 9, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440102', 1, 55, 16, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440102', 2, 65, 13, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440102', 3, 65, 14, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440103', 1, 80, 11, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440103', 2, 80, 13, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440103', 3, 90, 9, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440104', 1, 60, 12, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440104', 2, 60, 15, '2024-06-24T10:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440104', 3, 60, 10, '2024-06-24T10:00:00Z');

-- 4.2 Workout 2: 2024-06-25 (Push day workout)
INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_order, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440200', '110e8400-e29b-41d4-a716-446655440002', (SELECT id FROM exercises WHERE name = 'Dips'), 1, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440201', '110e8400-e29b-41d4-a716-446655440002', (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 2, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440202', '110e8400-e29b-41d4-a716-446655440002', (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press'), 3, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440203', '110e8400-e29b-41d4-a716-446655440002', (SELECT id FROM exercises WHERE name = 'Cable Crunches'), 4, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440204', '110e8400-e29b-41d4-a716-446655440002', (SELECT id FROM exercises WHERE name = 'Close-Grip Bench Press'), 5, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440205', '110e8400-e29b-41d4-a716-446655440002', (SELECT id FROM exercises WHERE name = 'Tricep Pushdowns'), 6, '2024-06-25T18:00:00Z');

INSERT INTO sets (workout_exercise_id, set_number, weight, reps, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440200', 1, 225, 6, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440200', 2, 225, 5, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440200', 3, 225, 6, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440200', 4, 225, 6, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440201', 1, 165, 8, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440201', 2, 165, 9, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440201', 3, 175, 6, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440201', 4, 165, 8, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440202', 1, 120, 12, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440202', 2, 120, 12, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440202', 3, 120, 12, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440203', 1, 200, 15, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440203', 2, 200, 15, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440203', 3, 200, 15, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440204', 1, 95, 20, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440204', 2, 115, 12, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440204', 3, 135, 8, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440205', 1, 55, 13, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440205', 2, 55, 11, '2024-06-25T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440205', 3, 50, 14, '2024-06-25T18:00:00Z');

-- 4.3 Workout 3: 2024-06-26 (Shoulder day workout)
INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_order, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440300', '110e8400-e29b-41d4-a716-446655440003', (SELECT id FROM exercises WHERE name = 'Lateral Raises'), 1, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440301', '110e8400-e29b-41d4-a716-446655440003', (SELECT id FROM exercises WHERE name = 'Barbell Shrugs'), 2, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440302', '110e8400-e29b-41d4-a716-446655440003', (SELECT id FROM exercises WHERE name = 'Cable Lateral Raises'), 3, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440303', '110e8400-e29b-41d4-a716-446655440003', (SELECT id FROM exercises WHERE name = 'Upright Rows'), 4, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440304', '110e8400-e29b-41d4-a716-446655440003', (SELECT id FROM exercises WHERE name = 'Rear Delt Flyes'), 5, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440305', '110e8400-e29b-41d4-a716-446655440003', (SELECT id FROM exercises WHERE name = 'External Rotations'), 6, '2024-06-26T18:00:00Z');

INSERT INTO sets (workout_exercise_id, set_number, weight, reps, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440300', 1, 30, 12, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440300', 2, 60, 12, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440300', 3, 60, 14, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440300', 4, 60, 16, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440301', 1, 135, 18, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440301', 2, 165, 12, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440301', 3, 175, 14, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440301', 4, 185, 11, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440302', 1, 30, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440302', 2, 30, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440302', 3, 30, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440303', 1, 60, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440303', 2, 60, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440303', 3, 60, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440304', 1, 40, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440304', 2, 40, 15, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440304', 3, 40, 17, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440305', 1, 20, 11, '2024-06-26T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440305', 2, 20, 15, '2024-06-26T18:00:00Z');

-- 4.4 Workout 4: 2024-06-29 (Pull day workout)
INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_order, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440400', '110e8400-e29b-41d4-a716-446655440004', (SELECT id FROM exercises WHERE name = 'Lat Pulldowns'), 1, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440401', '110e8400-e29b-41d4-a716-446655440004', (SELECT id FROM exercises WHERE name = 'Barbell Rows'), 2, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440402', '110e8400-e29b-41d4-a716-446655440004', (SELECT id FROM exercises WHERE name = 'Face Pulls'), 3, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440403', '110e8400-e29b-41d4-a716-446655440004', (SELECT id FROM exercises WHERE name = 'Barbell Curls'), 4, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440404', '110e8400-e29b-41d4-a716-446655440004', (SELECT id FROM exercises WHERE name = 'Hammer Curls'), 5, '2024-06-29T18:00:00Z');

INSERT INTO sets (workout_exercise_id, set_number, weight, reps, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440400', 1, 145, 15, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440400', 2, 160, 10, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440400', 3, 160, 10, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440401', 1, 150, 10, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440401', 2, 150, 10, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440401', 3, 155, 9, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440402', 1, 65, 16, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440402', 2, 70, 12, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440402', 3, 65, 12, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440403', 1, 90, 11, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440403', 2, 90, 13, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440403', 3, 80, 12, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440404', 1, 60, 15, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440404', 2, 60, 13, '2024-06-29T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440404', 3, 60, 11, '2024-06-29T18:00:00Z');

-- 4.5 Workout 5: 2024-06-30 (Push day workout)
INSERT INTO workout_exercises (id, workout_id, exercise_id, exercise_order, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440500', '110e8400-e29b-41d4-a716-446655440005', (SELECT id FROM exercises WHERE name = 'Barbell Bench Press'), 1, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440501', '110e8400-e29b-41d4-a716-446655440005', (SELECT id FROM exercises WHERE name = 'Incline Dumbbell Press'), 2, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440502', '110e8400-e29b-41d4-a716-446655440005', (SELECT id FROM exercises WHERE name = 'Dips'), 3, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440503', '110e8400-e29b-41d4-a716-446655440005', (SELECT id FROM exercises WHERE name = 'Dumbbell Flyes'), 4, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440504', '110e8400-e29b-41d4-a716-446655440005', (SELECT id FROM exercises WHERE name = 'Close-Grip Bench Press'), 5, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440505', '110e8400-e29b-41d4-a716-446655440005', (SELECT id FROM exercises WHERE name = 'Tricep Pushdowns'), 6, '2024-06-30T18:00:00Z');

INSERT INTO sets (workout_exercise_id, set_number, weight, reps, created_at) VALUES
  ('220e8400-e29b-41d4-a716-446655440500', 1, 175, 9, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440500', 2, 175, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440500', 3, 175, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440500', 4, 165, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440501', 1, 130, 15, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440501', 2, 130, 15, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440501', 3, 130, 13, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440502', 1, 225, 7, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440502', 2, 225, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440502', 3, 225, 7, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440503', 1, 60, 17, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440503', 2, 70, 15, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440503', 3, 80, 12, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440504', 1, 140, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440504', 2, 140, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440504', 3, 140, 8, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440505', 1, 60, 11, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440505', 2, 60, 12, '2024-06-30T18:00:00Z'),
  ('220e8400-e29b-41d4-a716-446655440505', 3, 60, 12, '2024-06-30T18:00:00Z');

-- ✅ VERIFICATION QUERY:
-- Run this to verify the data was inserted correctly:
SELECT 
    w.workout_date,
    w.notes,
    COUNT(s.id) as total_sets,
    SUM(s.weight * s.reps) as total_volume
FROM workouts w
LEFT JOIN workout_exercises we ON w.id = we.workout_id
LEFT JOIN sets s ON we.id = s.workout_exercise_id
WHERE w.user_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY w.id, w.workout_date, w.notes
ORDER BY w.workout_date;

-- Expected results:
-- 2024-06-24 | Pull day workout     | 15 | 16125
-- 2024-06-25 | Push day workout     | 20 | 30050  
-- 2024-06-26 | Shoulder day workout | 19 | 18225
-- 2024-06-29 | Pull day workout     | 15 | 17890
-- 2024-06-30 | Push day workout     | 19 | 24725
-- TOTAL: 88 sets, 107,015 lbs