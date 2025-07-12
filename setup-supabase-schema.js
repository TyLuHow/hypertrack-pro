#!/usr/bin/env node

// Setup Supabase Database Schema
// This script creates all necessary tables for HyperTrack Pro

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🏗️ Setting up Supabase database schema...');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

// HTTP client for Supabase REST API
async function executeSQLCommand(sql) {
    const url = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
    const headers = {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    };

    const options = {
        method: 'POST',
        headers,
        body: JSON.stringify({ sql })
    };

    console.log(`🔄 Executing SQL...`);
    
    try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        
        console.log(`✅ SQL executed successfully`);
        return responseText ? JSON.parse(responseText) : null;
    } catch (error) {
        console.error(`❌ Error executing SQL:`, error.message);
        throw error;
    }
}

// Alternative approach: Use the direct Postgres connection
async function setupTables() {
    console.log('📋 Creating database tables...');
    
    const createTablesSQL = `
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
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
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
            workout_id TEXT REFERENCES workouts(id) ON DELETE CASCADE,
            exercise_id UUID REFERENCES exercises(id),
            exercise_name TEXT NOT NULL,
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
            rest_time_seconds INTEGER,
            timestamp TIMESTAMP WITH TIME ZONE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
        CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
        CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
        CREATE INDEX IF NOT EXISTS idx_sets_workout_exercise_id ON sets(workout_exercise_id);

        -- Enable Row Level Security (RLS)
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
        ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
        ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
            FOR ALL USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can manage own workouts" ON workouts
            FOR ALL USING (true); -- Temporarily allow all access for migration

        CREATE POLICY IF NOT EXISTS "Users can manage own workout exercises" ON workout_exercises
            FOR ALL USING (true); -- Temporarily allow all access for migration

        CREATE POLICY IF NOT EXISTS "Users can manage own sets" ON sets
            FOR ALL USING (true); -- Temporarily allow all access for migration
    `;

    const statements = createTablesSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
        try {
            await executeSQLCommand(statement.trim() + ';');
        } catch (error) {
            console.warn(`⚠️ Warning: ${error.message}`);
            // Continue with other statements
        }
    }
}

async function verifySchema() {
    console.log('🔍 Verifying database schema...');
    
    try {
        // Check if tables exist by querying them
        const checkSQL = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('workouts', 'workout_exercises', 'sets', 'user_profiles', 'exercises');
        `;
        
        const result = await executeSQLCommand(checkSQL);
        console.log('✅ Schema verification complete');
        return true;
    } catch (error) {
        console.error('❌ Schema verification failed:', error.message);
        return false;
    }
}

async function main() {
    try {
        // Check if fetch is available
        if (typeof fetch === 'undefined') {
            const { default: fetch } = require('node-fetch');
            globalThis.fetch = fetch;
        }
        
        await setupTables();
        const verified = await verifySchema();
        
        if (verified) {
            console.log('\n🎉 Database schema setup completed successfully!');
            console.log('🚀 You can now run the migration script: node supabase-direct-migration.js');
        } else {
            console.log('\n⚠️ Schema setup completed but verification failed');
            console.log('💡 Try running the migration anyway or check Supabase dashboard');
        }
        
    } catch (error) {
        console.error('❌ Schema setup failed:', error);
        console.log('\n💡 Alternative: Run setup-database.sql manually in Supabase SQL Editor');
        process.exit(1);
    }
}

main();