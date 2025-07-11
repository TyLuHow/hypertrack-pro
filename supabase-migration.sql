-- HyperTrack Pro - Complete Data Migration to Supabase
-- This file contains all historical workouts plus July 8-9 workouts
-- Run this in your Supabase SQL Editor

-- First, clear any existing workout data (optional)
-- DELETE FROM sets;
-- DELETE FROM workout_exercises;  
-- DELETE FROM workouts;

-- Insert workouts

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_1', 'tyler_user_id', 'Pull Day', '2025-06-24', '09:00:00', '10:15:00', 75, 'Pull day - lat focus with bicep work', 'Pull', 16125);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_2', 'tyler_user_id', 'Push Day', '2025-06-25', '18:00:00', '19:30:00', 90, 'Push day - chest, shoulders, triceps with abs', 'Push', 30050);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_3', 'tyler_user_id', 'Shoulder Day', '2025-06-26', '18:00:00', '19:20:00', 80, 'Shoulder specialization day - all deltoids and traps', 'Shoulder', 18225);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_4', 'tyler_user_id', 'Pull Day', '2025-06-29', '18:00:00', '19:15:00', 75, 'Pull day - progression focus', 'Pull', 17890);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_5', 'tyler_user_id', 'Push Day', '2025-06-30', '18:00:00', '19:20:00', 80, 'Push day - strength progression', 'Push', 24725);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_6', 'tyler_user_id', 'Shoulder Day', '2025-07-02', '18:00:00', '19:15:00', 75, 'Shoulder day - volume progression', 'Shoulder', 18470);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_7', 'tyler_user_id', 'Pull Day', '2025-07-03', '18:00:00', '19:20:00', 80, 'Pull day - heavy back work with hammer curls', 'Pull', 16707.5);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_8', 'tyler_user_id', 'Push Day', '2025-07-05', '15:33:48', '16:41:52', 68, 'Push day - chest, triceps with strength progression', 'Push', 25180);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('historical_9', 'tyler_user_id', 'Shoulder Day', '2025-07-06', '13:21:47', '14:09:34', 48, 'Shoulder specialization day - lateral raises, traps, and rear delts', 'Shoulder', 17460);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('july_8_2025', 'tyler_user_id', 'Pull/Shoulder Day', '2025-07-08', '01:42:39', '02:40:02', 58, 'Pull day with shoulder work', 'Pull', 20230);

INSERT INTO workouts (id, user_id, name, date, start_time, end_time, duration_minutes, notes, workout_type, total_volume)
VALUES ('july_9_2025', 'tyler_user_id', 'Push/Abs Day', '2025-07-09', '23:21:04', '00:58:37', 98, 'Push day with abs work', 'Push', 59940);

-- Insert workout exercises

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_1_ex_1', 'historical_1', 'Lat Pulldowns', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_1_ex_2', 'historical_1', 'Smith Machine Rows', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_1_ex_3', 'historical_1', 'Face Pulls', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_1_ex_4', 'historical_1', 'Dumbbell Bicep Curls', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_1_ex_5', 'historical_1', 'Reverse Grip EZ Bar Curl', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_1', 'historical_2', 'Bodyweight Dips', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_2', 'historical_2', 'Smith Machine Bench Press', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_3', 'historical_2', 'Incline Dumbbell Press', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_4', 'historical_2', 'Bodyweight Dips', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_5', 'historical_2', 'Cable Crunch Machine', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_6', 'historical_2', 'Close-Grip Smith Machine Press', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_2_ex_7', 'historical_2', 'Tricep Cable Rope Pulldowns', 7, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_3_ex_1', 'historical_3', 'Dumbbell Lateral Raises', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_3_ex_2', 'historical_3', 'Smith Machine Barbell Shrugs', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_3_ex_3', 'historical_3', 'Cable Lateral Raises', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_3_ex_4', 'historical_3', 'EZ Bar Upright Rows', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_3_ex_5', 'historical_3', 'Kettlebell Prone Y Raises', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_3_ex_6', 'historical_3', 'Cable External Rotations', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_4_ex_1', 'historical_4', 'Lat Pulldowns', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_4_ex_2', 'historical_4', 'Smith Machine Rows', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_4_ex_3', 'historical_4', 'Face Pulls', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_4_ex_4', 'historical_4', 'Dumbbell Bicep Curls', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_4_ex_5', 'historical_4', 'Reverse Grip EZ Bar Curl', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_5_ex_1', 'historical_5', 'Smith Machine Bench Press', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_5_ex_2', 'historical_5', 'Incline Dumbbell Press', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_5_ex_3', 'historical_5', 'Bodyweight Dips', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_5_ex_4', 'historical_5', 'Dumbbell Flyes', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_5_ex_5', 'historical_5', 'Close-Grip Smith Machine Press', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_5_ex_6', 'historical_5', 'Tricep Cable Rope Pulldowns', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_6_ex_1', 'historical_6', 'Dumbbell Lateral Raises', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_6_ex_2', 'historical_6', 'Smith Machine Barbell Shrugs', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_6_ex_3', 'historical_6', 'Cable Lateral Raises', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_6_ex_4', 'historical_6', 'Dumbbell Reverse Flyes', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_6_ex_5', 'historical_6', 'Kettlebell Prone Y Raises', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_6_ex_6', 'historical_6', 'Cable External Rotations', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_7_ex_1', 'historical_7', 'Lat Pulldowns', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_7_ex_2', 'historical_7', 'Smith Machine Rows', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_7_ex_3', 'historical_7', 'Face Pulls', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_7_ex_4', 'historical_7', 'Dumbbell Bicep Curls', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_7_ex_5', 'historical_7', 'Cable Hammer Curls', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_7_ex_6', 'historical_7', 'Tricep Cable Rope Pulldowns', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_8_ex_1', 'historical_8', 'Smith Machine Bench Press', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_8_ex_2', 'historical_8', 'Chest Press Machine', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_8_ex_3', 'historical_8', 'Bodyweight Dips', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_8_ex_4', 'historical_8', 'Dumbbell Flyes', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_8_ex_5', 'historical_8', 'Tricep Cable Rope Pulldowns', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_8_ex_6', 'historical_8', 'Close-Grip Smith Machine Press', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_9_ex_1', 'historical_9', 'Dumbbell Lateral Raises', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_9_ex_2', 'historical_9', 'Smith Machine Barbell Shrugs', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_9_ex_3', 'historical_9', 'Cable Lateral Raises', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_9_ex_4', 'historical_9', 'Dumbbell Reverse Flyes', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('historical_9_ex_5', 'historical_9', 'Cable External Rotations', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_8_2025_ex_1', 'july_8_2025', 'Lat Pulldowns', 1, 'Sometimes I don't feel it in my last and it's more in my rhomboids. It's also very easy to feel lopsided and I never know if I'm leaning back too much');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_8_2025_ex_2', 'july_8_2025', 'Smith Machine Rows', 2, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_8_2025_ex_3', 'july_8_2025', 'Face Pulls', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_8_2025_ex_4', 'july_8_2025', 'Dumbbell Bicep Curls', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_8_2025_ex_5', 'july_8_2025', 'Cable Hammer Curls', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_8_2025_ex_6', 'july_8_2025', 'Smith Machine Shoulder Press', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_1', 'july_9_2025', 'Cable Crunch Machine', 1, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_2', 'july_9_2025', 'Russian Twists', 2, 'This was decline & reps were each side');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_3', 'july_9_2025', 'Planks', 3, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_4', 'july_9_2025', 'Incline Dumbbell Press', 4, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_5', 'july_9_2025', 'Smith Machine Bench Press', 5, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_6', 'july_9_2025', 'Bodyweight Dips', 6, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_7', 'july_9_2025', 'Dumbbell Flyes', 7, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_8', 'july_9_2025', 'Close-Grip Smith Machine Press', 8, '');

INSERT INTO workout_exercises (id, workout_id, exercise_name, order_in_workout, notes)
VALUES ('july_9_2025_ex_9', 'july_9_2025', 'Tricep Cable Rope Pulldowns', 9, '');

-- Insert sets

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_1', 1, 12, 130, NULL, '2025-06-24T09:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_1', 2, 15, 130, NULL, '2025-06-24T09:08:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_1', 3, 11, 145, NULL, '2025-06-24T09:11:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_2', 1, 5, 165, NULL, '2025-06-24T09:15:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_2', 2, 9, 145, NULL, '2025-06-24T09:18:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_2', 3, 9, 145, NULL, '2025-06-24T09:21:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_3', 1, 16, 55, NULL, '2025-06-24T09:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_3', 2, 13, 65, NULL, '2025-06-24T09:27:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_3', 3, 14, 65, NULL, '2025-06-24T09:29:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_4', 1, 11, 80, NULL, '2025-06-24T09:33:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_4', 2, 13, 80, NULL, '2025-06-24T09:35:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_4', 3, 9, 90, NULL, '2025-06-24T09:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_5', 1, 12, 60, NULL, '2025-06-24T09:41:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_5', 2, 15, 60, NULL, '2025-06-24T09:43:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_1_ex_5', 3, 10, 60, NULL, '2025-06-24T09:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_1', 1, 6, 225, NULL, '2025-06-25T18:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_2', 1, 8, 165, NULL, '2025-06-25T18:10:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_2', 2, 9, 165, NULL, '2025-06-25T18:13:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_2', 3, 6, 175, NULL, '2025-06-25T18:16:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_2', 4, 8, 165, NULL, '2025-06-25T18:19:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_3', 1, 12, 120, NULL, '2025-06-25T18:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_3', 2, 12, 120, NULL, '2025-06-25T18:28:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_3', 3, 12, 120, NULL, '2025-06-25T18:31:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_4', 1, 5, 225, NULL, '2025-06-25T18:35:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_4', 2, 6, 225, NULL, '2025-06-25T18:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_4', 3, 6, 225, NULL, '2025-06-25T18:39:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_5', 1, 15, 200, NULL, '2025-06-25T18:43:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_5', 2, 15, 200, NULL, '2025-06-25T18:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_5', 3, 15, 200, NULL, '2025-06-25T18:47:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_6', 1, 20, 95, NULL, '2025-06-25T18:51:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_6', 2, 12, 115, NULL, '2025-06-25T18:54:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_6', 3, 8, 135, NULL, '2025-06-25T18:57:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_7', 1, 13, 55, NULL, '2025-06-25T19:01:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_7', 2, 11, 55, NULL, '2025-06-25T19:03:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_2_ex_7', 3, 14, 50, NULL, '2025-06-25T19:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_1', 1, 12, 30, NULL, '2025-06-26T18:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_1', 2, 12, 60, NULL, '2025-06-26T18:08:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_1', 3, 14, 60, NULL, '2025-06-26T18:11:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_1', 4, 16, 60, NULL, '2025-06-26T18:14:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_2', 1, 18, 135, NULL, '2025-06-26T18:19:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_2', 2, 12, 165, NULL, '2025-06-26T18:22:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_2', 3, 14, 175, NULL, '2025-06-26T18:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_2', 4, 11, 185, NULL, '2025-06-26T18:28:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_3', 1, 15, 30, NULL, '2025-06-26T18:33:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_3', 2, 15, 30, NULL, '2025-06-26T18:35:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_3', 3, 15, 30, NULL, '2025-06-26T18:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_4', 1, 15, 60, NULL, '2025-06-26T18:41:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_4', 2, 15, 60, NULL, '2025-06-26T18:43:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_4', 3, 15, 60, NULL, '2025-06-26T18:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_5', 1, 15, 40, NULL, '2025-06-26T18:49:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_5', 2, 15, 40, NULL, '2025-06-26T18:51:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_5', 3, 17, 40, NULL, '2025-06-26T18:53:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_6', 1, 11, 20, NULL, '2025-06-26T18:57:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_3_ex_6', 2, 15, 20, NULL, '2025-06-26T18:59:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_1', 1, 15, 145, NULL, '2025-06-29T18:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_1', 2, 10, 160, NULL, '2025-06-29T18:08:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_1', 3, 10, 160, NULL, '2025-06-29T18:11:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_2', 1, 10, 150, NULL, '2025-06-29T18:15:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_2', 2, 10, 150, NULL, '2025-06-29T18:18:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_2', 3, 9, 155, NULL, '2025-06-29T18:21:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_3', 1, 16, 65, NULL, '2025-06-29T18:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_3', 2, 12, 70, NULL, '2025-06-29T18:27:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_3', 3, 12, 65, NULL, '2025-06-29T18:29:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_4', 1, 11, 90, NULL, '2025-06-29T18:33:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_4', 2, 13, 90, NULL, '2025-06-29T18:35:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_4', 3, 12, 80, NULL, '2025-06-29T18:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_5', 1, 15, 60, NULL, '2025-06-29T18:41:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_5', 2, 13, 60, NULL, '2025-06-29T18:43:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_4_ex_5', 3, 11, 60, NULL, '2025-06-29T18:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_1', 1, 9, 175, NULL, '2025-06-30T18:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_1', 2, 8, 175, NULL, '2025-06-30T18:08:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_1', 3, 8, 175, NULL, '2025-06-30T18:11:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_1', 4, 8, 165, NULL, '2025-06-30T18:14:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_2', 1, 15, 130, NULL, '2025-06-30T18:19:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_2', 2, 15, 130, NULL, '2025-06-30T18:22:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_2', 3, 13, 130, NULL, '2025-06-30T18:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_3', 1, 7, 225, NULL, '2025-06-30T18:29:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_3', 2, 8, 225, NULL, '2025-06-30T18:31:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_3', 3, 7, 225, NULL, '2025-06-30T18:33:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_4', 1, 17, 60, NULL, '2025-06-30T18:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_4', 2, 15, 70, NULL, '2025-06-30T18:39:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_4', 3, 12, 80, NULL, '2025-06-30T18:41:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_5', 1, 8, 140, NULL, '2025-06-30T18:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_5', 2, 8, 140, NULL, '2025-06-30T18:48:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_5', 3, 8, 140, NULL, '2025-06-30T18:51:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_6', 1, 11, 60, NULL, '2025-06-30T18:55:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_6', 2, 12, 60, NULL, '2025-06-30T18:57:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_5_ex_6', 3, 12, 60, NULL, '2025-06-30T18:59:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_1', 1, 13, 70, NULL, '2025-07-02T18:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_1', 2, 12, 70, NULL, '2025-07-02T18:08:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_1', 3, 12, 70, NULL, '2025-07-02T18:11:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_1', 4, 10, 70, NULL, '2025-07-02T18:14:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_2', 1, 18, 155, NULL, '2025-07-02T18:19:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_2', 2, 14, 175, NULL, '2025-07-02T18:22:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_2', 3, 12, 185, NULL, '2025-07-02T18:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_2', 4, 10, 195, NULL, '2025-07-02T18:28:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_3', 1, 16, 30, NULL, '2025-07-02T18:33:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_3', 2, 12, 40, NULL, '2025-07-02T18:35:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_3', 3, 13, 30, NULL, '2025-07-02T18:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_4', 1, 16, 50, NULL, '2025-07-02T18:41:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_4', 2, 14, 55, NULL, '2025-07-02T18:43:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_4', 3, 12, 55, NULL, '2025-07-02T18:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_5', 1, 8, 50, NULL, '2025-07-02T18:49:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_5', 2, 15, 40, NULL, '2025-07-02T18:51:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_5', 3, 15, 40, NULL, '2025-07-02T18:53:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_6', 1, 12, 20, NULL, '2025-07-02T18:57:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_6_ex_6', 2, 14, 25, NULL, '2025-07-02T18:59:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_1', 1, 10, 160, NULL, '2025-07-03T18:05:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_1', 2, 9, 160, NULL, '2025-07-03T18:08:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_1', 3, 12, 145, NULL, '2025-07-03T18:11:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_2', 1, 6, 180, NULL, '2025-07-03T18:15:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_2', 2, 8, 165, NULL, '2025-07-03T18:18:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_2', 3, 10, 145, NULL, '2025-07-03T18:21:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_3', 1, 14, 70, NULL, '2025-07-03T18:25:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_3', 2, 12, 70, NULL, '2025-07-03T18:27:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_3', 3, 13, 65, NULL, '2025-07-03T18:29:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_4', 1, 10, 90, NULL, '2025-07-03T18:33:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_4', 2, 10, 90, NULL, '2025-07-03T18:35:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_4', 3, 12, 80, NULL, '2025-07-03T18:37:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_5', 1, 14, 47.5, NULL, '2025-07-03T18:41:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_5', 2, 11, 52.5, NULL, '2025-07-03T18:43:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_5', 3, 12, 52.5, NULL, '2025-07-03T18:45:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_7_ex_6', 1, 12, 65, NULL, '2025-07-03T18:49:00Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_1', 1, 12, 165, NULL, '2025-07-05T15:35:46.608Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_1', 2, 10, 175, NULL, '2025-07-05T15:40:33.885Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_1', 3, 9, 175, NULL, '2025-07-05T15:44:08.691Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_1', 4, 8, 175, NULL, '2025-07-05T15:48:42.291Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_2', 1, 18, 130, NULL, '2025-07-05T15:51:40.000Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_2', 2, 14, 145, NULL, '2025-07-05T15:54:40.000Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_2', 3, 12, 152.5, NULL, '2025-07-05T15:57:40.000Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_3', 1, 8, 180, NULL, '2025-07-05T15:59:40.000Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_3', 2, 8, 180, NULL, '2025-07-05T16:01:40.000Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_3', 3, 8, 180, NULL, '2025-07-05T16:03:40.000Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_4', 1, 13, 80, NULL, '2025-07-05T16:22:13.788Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_4', 2, 11, 90, NULL, '2025-07-05T16:22:13.789Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_4', 3, 10, 100, NULL, '2025-07-05T16:22:13.789Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_5', 1, 8, 70, NULL, '2025-07-05T16:28:22.582Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_5', 2, 9, 65, NULL, '2025-07-05T16:28:22.583Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_5', 3, 8, 65, NULL, '2025-07-05T16:28:22.583Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_6', 1, 6, 155, NULL, '2025-07-05T16:41:34.944Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_6', 2, 7, 140, NULL, '2025-07-05T16:41:34.944Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_8_ex_6', 3, 10, 135, NULL, '2025-07-05T16:41:34.944Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_1', 1, 15, 60, NULL, '2025-07-06T13:23:32.675Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_1', 2, 13, 70, NULL, '2025-07-06T13:27:03.093Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_1', 3, 6, 80, NULL, '2025-07-06T13:32:15.405Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_1', 4, 11, 70, NULL, '2025-07-06T13:32:15.405Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_2', 1, 15, 185, NULL, '2025-07-06T13:44:47.836Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_2', 2, 16, 195, NULL, '2025-07-06T13:44:47.836Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_2', 3, 9, 215, NULL, '2025-07-06T13:44:47.836Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_2', 4, 10, 205, NULL, '2025-07-06T13:44:47.837Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_3', 1, 15, 30, NULL, '2025-07-06T13:52:44.452Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_3', 2, 8, 40, NULL, '2025-07-06T13:52:44.452Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_3', 3, 15, 30, NULL, '2025-07-06T13:52:44.452Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_4', 1, 15, 55, NULL, '2025-07-06T14:00:41.357Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_4', 2, 15, 55, NULL, '2025-07-06T14:00:41.357Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_4', 3, 12, 60, NULL, '2025-07-06T14:00:41.357Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_5', 1, 9, 30, NULL, '2025-07-06T14:09:34.570Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_5', 2, 15, 20, NULL, '2025-07-06T14:09:34.570Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('historical_9_ex_5', 3, 12, 30, NULL, '2025-07-06T14:09:34.570Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_1', 1, 8, 175, 141, '2025-07-09T01:42:39.965Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_1', 2, 10, 160, 227, '2025-07-09T01:45:01.265Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_1', 3, 10, 160, NULL, '2025-07-09T01:48:48.457Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_2', 1, 10, 150, 469, '2025-07-09T01:52:38.719Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_2', 2, 10, 150, NULL, '2025-07-09T02:00:27.362Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_2', 3, 8, 150, NULL, '2025-07-09T02:00:27.362Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_3', 1, 15, 70, 319, '2025-07-09T02:04:39.247Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_3', 2, 16, 65, NULL, '2025-07-09T02:09:58.513Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_3', 3, 17, 65, NULL, '2025-07-09T02:09:58.514Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_4', 1, 9, 90, 4, '2025-07-09T02:21:28.348Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_4', 2, 12, 80, 12, '2025-07-09T02:21:32.361Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_4', 3, 10, 80, NULL, '2025-07-09T02:21:44.382Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_5', 1, 10, 60, 132, '2025-07-09T02:25:32.250Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_5', 2, 9, 60, 115, '2025-07-09T02:27:44.739Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_5', 3, 10, 60, NULL, '2025-07-09T02:29:40.178Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_6', 1, 18, 75, NULL, '2025-07-09T02:40:02.606Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_6', 2, 13, 115, NULL, '2025-07-09T02:40:02.606Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_8_2025_ex_6', 3, 8, 135, NULL, '2025-07-09T02:40:02.606Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_1', 1, 8, 200, NULL, '2025-07-09T23:21:04.082Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_1', 2, 15, 180, NULL, '2025-07-09T23:21:04.082Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_1', 3, 17, 170, NULL, '2025-07-09T23:21:04.082Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_2', 1, 20, 25, NULL, '2025-07-09T23:30:01.305Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_2', 2, 20, 25, NULL, '2025-07-09T23:30:01.305Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_2', 3, 20, 25, NULL, '2025-07-09T23:30:01.305Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_3', 1, 120, 225, NULL, '2025-07-09T23:43:30.668Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_4', 1, 12, 120, NULL, '2025-07-09T23:52:05.954Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_4', 2, 18, 120, NULL, '2025-07-09T23:52:05.954Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_5', 1, 6, 190, NULL, '2025-07-10T00:02:05.827Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_5', 2, 7, 185, NULL, '2025-07-10T00:02:05.827Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_5', 3, 8, 185, NULL, '2025-07-10T00:02:05.827Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_6', 1, 8, 225, NULL, '2025-07-10T00:19:17.476Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_6', 2, 9, 225, NULL, '2025-07-10T00:19:17.476Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_6', 3, 10, 225, NULL, '2025-07-10T00:19:17.476Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_7', 1, 15, 80, NULL, '2025-07-10T00:35:43.440Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_7', 2, 15, 90, NULL, '2025-07-10T00:35:43.440Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_7', 3, 13, 100, NULL, '2025-07-10T00:35:43.440Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_8', 1, 10, 150, NULL, '2025-07-10T00:48:57.141Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_8', 2, 8, 155, NULL, '2025-07-10T00:48:57.141Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_8', 3, 11, 155, NULL, '2025-07-10T00:48:57.141Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_9', 1, 14, 55, NULL, '2025-07-10T00:58:37.782Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_9', 2, 15, 55, NULL, '2025-07-10T00:58:37.782Z');

INSERT INTO sets (workout_exercise_id, set_number, reps, weight, rest_time_seconds, timestamp)
VALUES ('july_9_2025_ex_9', 3, 14, 55, NULL, '2025-07-10T00:58:37.782Z');

-- Verify the migration
SELECT 
  w.date,
  w.name,
  w.workout_type,
  COUNT(DISTINCT we.id) as exercise_count,
  COUNT(s.id) as total_sets,
  w.total_volume
FROM workouts w
LEFT JOIN workout_exercises we ON w.id = we.workout_id
LEFT JOIN sets s ON we.id = s.workout_exercise_id
GROUP BY w.id, w.date, w.name, w.workout_type, w.total_volume
ORDER BY w.date;
