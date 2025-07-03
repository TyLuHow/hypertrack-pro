# Database Setup Guide

## Quick Setup

### 1. Get Supabase Credentials
1. Go to [Supabase](https://app.supabase.com)
2. Create a new project or use existing one
3. Go to Project Settings → API
4. Copy these values:
   - Project URL
   - Project API keys (anon and service_role)

### 2. Configure Environment Variables
Update `.env.local` with your credentials:

```bash
# Replace with your actual Supabase values
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Setup Database Tables
Run the setup script:

```bash
npm install
npm run setup-db
```

Or manually create tables in Supabase SQL Editor:

```sql
-- Workouts table
CREATE TABLE workouts (
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

-- Workout exercises table
CREATE TABLE workout_exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    muscle_group VARCHAR(100),
    category VARCHAR(50),
    order_in_workout INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise sets table
CREATE TABLE exercise_sets (
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

-- Indexes for performance
CREATE INDEX idx_workouts_user_date ON workouts(user_id, workout_date);
CREATE INDEX idx_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_sets_exercise ON exercise_sets(exercise_id);
```

### 4. Test Connection
```bash
npm run test-db
```

## Data Persistence Features

### Automatic Fallback
- **Primary**: Saves to Supabase database
- **Fallback**: Saves to localStorage if database unavailable
- **Historical Data**: Tyler's data loads from `tyler-data-integration.js`

### What Gets Saved
- ✅ Complete workout sessions
- ✅ Exercise details (name, muscle group, category)
- ✅ Set data (weight, reps, timestamps)
- ✅ Workout duration and metadata
- ✅ Progress tracking and analytics

### Debugging
1. Check browser console for connection messages
2. Verify `.env.local` variables are correct
3. Confirm Supabase project is active
4. Test API endpoints: `/api/health` and `/api/workouts`

## Troubleshooting

### Common Issues

**"Connection failed" error:**
- Check SUPABASE_URL format: `https://yourproject.supabase.co`
- Verify service role key (not anon key) for setup script

**"Table doesn't exist" error:**
- Run database setup: `npm run setup-db`
- Or create tables manually in Supabase SQL Editor

**"Authentication failed" error:**
- App uses simplified single-user auth
- Check that SUPABASE_SERVICE_ROLE_KEY is correct

**Data not persisting:**
- Check browser console for error messages
- Data will save to localStorage as fallback
- Analytics will still show local data

### Manual Database Recovery
If you have localStorage data and want to migrate to database:
1. Export data: Settings → Export Data
2. Setup database properly
3. Import data: Settings → Import Data

## Next Steps
- Test workout creation and completion
- Verify data appears in Analytics tab
- Check Supabase dashboard for saved data
- Consider setting up user authentication for multi-user support