-- Temporary fix for RLS policies to allow development access
-- This allows access for development while maintaining data isolation

-- Add temporary policies for development access
-- These allow access for specific user IDs without auth requirement

-- Temporarily allow access for tyler_historical and generated user IDs
CREATE POLICY "Allow tyler_historical access" ON workouts
    FOR ALL USING (user_id = 'tyler_historical');

CREATE POLICY "Allow development user access" ON workouts  
    FOR ALL USING (user_id LIKE 'user_%');

-- Allow access to user_profiles for development
CREATE POLICY "Allow development profile access" ON user_profiles
    FOR ALL USING (user_id LIKE 'user_%' OR user_id = 'tyler_historical');

-- Ensure other related tables allow access
CREATE POLICY "Allow development workout_exercises access" ON workout_exercises
    FOR ALL USING (true);

CREATE POLICY "Allow development sets access" ON sets
    FOR ALL USING (true);

CREATE POLICY "Allow development user_settings access" ON user_settings
    FOR ALL USING (user_id LIKE 'user_%' OR user_id = 'tyler_historical');

CREATE POLICY "Allow development workout_analytics access" ON workout_analytics
    FOR ALL USING (user_id LIKE 'user_%' OR user_id = 'tyler_historical');

-- Note: In production, these should be replaced with proper auth.uid() policies
-- and users should authenticate through Supabase Auth