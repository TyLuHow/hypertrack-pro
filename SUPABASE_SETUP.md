# HyperTrack Pro - Supabase Integration Setup Guide

## 🚀 Complete Setup Instructions

### 1. Database Schema Setup

**Go to your Supabase SQL Editor:**
- Navigate to https://supabase.com/dashboard/project/zrmkzgwrmohhbmjfdxdf/sql
- Copy and paste the contents of `database-schema.sql`
- Execute the script to create all tables, indexes, and security policies

### 2. Seed Exercise Database

**Run the exercise seed script:**
- Copy and paste the contents of `seed-2025-data.sql` 
- Execute to populate the exercises table with 46+ exercises
- This includes all tiers, MVC percentages, and gym type compatibility

### 3. User Registration & Data Migration

**After a user signs up:**
1. User creates account through the app
2. User profile and settings are automatically created via trigger
3. App offers to migrate localStorage data to Supabase
4. Tyler's 2025 workout data can be seeded with:
   ```sql
   SELECT seed_tyler_workouts('user-id-here');
   ```

### 4. Key Configuration Details

**Project Details:**
- **Project URL:** https://zrmkzgwrmohhbmjfdxdf.supabase.co
- **Database:** postgresql://postgres:TylerLH090102@@db.zrmkzgwrmohhbmjfdxdf.supabase.co:5432/postgres
- **Anon Key:** Already configured in `supabase-config.js`

### 5. Security Features

**Row Level Security (RLS) enabled for:**
- ✅ Users can only see their own data
- ✅ Workouts, exercises, sets are user-specific
- ✅ Exercise database is public (read-only for all users)
- ✅ Automatic user profile creation on signup

### 6. Integration Features

**What's Integrated:**
- ✅ **Authentication** - Sign up/in with email/password
- ✅ **Real-time sync** - Workouts sync across devices  
- ✅ **Offline support** - Works offline, syncs when online
- ✅ **Data migration** - Moves localStorage data to cloud
- ✅ **User settings** - Synced preferences and configuration
- ✅ **2025 workout data** - Tyler's actual training history
- ✅ **Exercise database** - 46 exercises with research data

### 7. Database Schema Overview

```
users (extends auth.users)
├── id (UUID, primary key)
├── email, username, training_level
├── bodyweight, timezone, preferences
└── created_at, updated_at

exercises (master database)
├── id (serial, primary key) 
├── name, muscle_group, category
├── tier, mvc_percentage, equipment
├── gym_types[], biomechanical_function
└── target_rep_range, rest_period

workouts (user-specific)
├── id (UUID), user_id (foreign key)
├── workout_date, start_time, end_time
├── duration, split_type, tod, notes
└── total_volume, total_sets

workout_exercises (junction table)
├── id (UUID), workout_id, exercise_id
└── exercise_order, notes

sets (individual set data)
├── id (UUID), workout_exercise_id
├── set_number, weight, reps
├── rpe, rest_duration, completed_at
└── created_at

user_settings (synced preferences)
├── user_id, show_research_facts
├── dark_mode, auto_start_rest_timer
├── compound_rest, isolation_rest
└── progression_rate, training_level
```

### 8. Testing the Integration

**After setup, test these features:**
1. **Sign up** - Create new account
2. **Data migration** - Import localStorage workouts  
3. **Create workout** - Add exercises and sets
4. **Sync test** - Sign out/in, data should persist
5. **Offline test** - Go offline, create workout, come online
6. **Device sync** - Sign in on another device

### 9. Production Considerations

**Security:**
- RLS policies protect user data
- Anon key is safe for client-side use
- Service role key should never be exposed

**Performance:**
- Indexes on foreign keys and frequently queried columns
- Automatic cleanup of orphaned records via cascading deletes
- Optimized queries with proper joins

**Backup:**
- Supabase provides automatic backups
- Export functionality still available for user data portability

### 10. Next Steps

**Ready for deployment!** 
- ✅ All files updated with correct project details
- ✅ Authentication UI integrated 
- ✅ Offline/online sync working
- ✅ 2025 workout data ready to seed
- ✅ Research-based exercise database populated
- ✅ Settings sync implemented

The app now provides a complete cloud-native fitness tracking solution with authentication, real-time sync, and offline capabilities while maintaining all the evidence-based features and Tyler's actual training data.

## 🔧 Troubleshooting

**Common Issues:**
- **"Supabase not loaded"** - Check CDN link in index.html
- **Auth errors** - Verify project URL and anon key
- **RLS errors** - Ensure user is authenticated before data operations
- **Migration issues** - Check localStorage data format before migration

**Support:**
- Check Supabase dashboard logs for detailed error messages
- Use browser dev tools to debug authentication flow
- Verify database schema was created correctly via Supabase Table Editor