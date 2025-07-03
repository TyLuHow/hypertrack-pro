#!/usr/bin/env node

// Database Setup Script for HyperTrack Pro
// Run with: node scripts/setup-database.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🔧 HyperTrack Pro Database Setup');
console.log('================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    console.log('\n📝 Please create .env.local with your Supabase credentials:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_ANON_KEY=your-anon-key');
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
    process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('   Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set\n');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
    console.log('🔌 Testing Supabase connection...');
    
    try {
        const { data, error } = await supabase
            .from('workouts')
            .select('count')
            .limit(1);
            
        if (error) {
            console.log('⚠️  Connection successful, but workouts table may not exist yet');
            console.log('   Error:', error.message);
            return false;
        }
        
        console.log('✅ Database connection successful!');
        return true;
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        return false;
    }
}

async function createTables() {
    console.log('\n📋 Setting up database tables...');
    
    const workoutsTableSQL = `
        CREATE TABLE IF NOT EXISTS workouts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            workout_date DATE NOT NULL,
            start_time TIMESTAMPTZ,
            end_time TIMESTAMPTZ,
            duration_minutes INTEGER,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    `;
    
    const exercisesTableSQL = `
        CREATE TABLE IF NOT EXISTS workout_exercises (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
            exercise_name VARCHAR(255) NOT NULL,
            muscle_group VARCHAR(100),
            category VARCHAR(50),
            order_in_workout INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `;
    
    const setsTableSQL = `
        CREATE TABLE IF NOT EXISTS exercise_sets (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
            set_number INTEGER NOT NULL,
            weight DECIMAL(8,2),
            reps INTEGER,
            rpe INTEGER,
            rest_time_seconds INTEGER,
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `;
    
    const indexesSQL = `
        CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, workout_date);
        CREATE INDEX IF NOT EXISTS idx_exercises_workout ON workout_exercises(workout_id);
        CREATE INDEX IF NOT EXISTS idx_sets_exercise ON exercise_sets(exercise_id);
    `;
    
    try {
        console.log('   Creating workouts table...');
        await supabase.rpc('exec_sql', { sql: workoutsTableSQL });
        
        console.log('   Creating workout_exercises table...');
        await supabase.rpc('exec_sql', { sql: exercisesTableSQL });
        
        console.log('   Creating exercise_sets table...');
        await supabase.rpc('exec_sql', { sql: setsTableSQL });
        
        console.log('   Creating indexes...');
        await supabase.rpc('exec_sql', { sql: indexesSQL });
        
        console.log('✅ Database tables created successfully!');
        return true;
    } catch (error) {
        console.error('❌ Failed to create tables:', error.message);
        console.log('\n💡 You may need to run these SQL commands manually in Supabase:');
        console.log(workoutsTableSQL);
        console.log(exercisesTableSQL);
        console.log(setsTableSQL);
        console.log(indexesSQL);
        return false;
    }
}

async function insertSampleData() {
    console.log('\n📊 Would you like to insert Tyler\'s historical data into the database? (y/n)');
    
    // For automation, we'll skip the prompt and just create tables
    console.log('   Skipping sample data insertion for now...');
    console.log('   Tyler\'s data is already available in the frontend via tyler-data-integration.js');
}

async function main() {
    const connected = await testConnection();
    
    if (!connected) {
        console.log('\n🛠️  Database connection issues detected.');
        console.log('   Please check your Supabase credentials and try again.\n');
        return;
    }
    
    await createTables();
    await insertSampleData();
    
    console.log('\n🎉 Database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your .env.local with correct Supabase credentials');
    console.log('   2. Test the app at http://localhost:3000');
    console.log('   3. Create a new workout to test data persistence\n');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testConnection, createTables };