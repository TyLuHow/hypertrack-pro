// api/workouts.js - Supabase Integration with User Authentication
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    // For GET requests without auth, fall back to guest mode
    if (req.method === 'GET' && !req.headers.authorization) {
      return handleGuestMode(req, res);
    }
    
    // Extract user from Authorization header for authenticated requests
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid authentication' });
      }
      
      req.user = user;
    }
    
    switch (req.method) {
      case 'GET':
        return await handleGetWorkouts(req, res);
      case 'POST':
        return await handleCreateWorkout(req, res);
      case 'PUT':
        return await handleUpdateWorkout(req, res);
      case 'DELETE':
        return await handleDeleteWorkout(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Workouts API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

function handleGuestMode(req, res) {
  // Return empty workouts for guest users
  return res.status(200).json({
    success: true,
    workouts: [],
    pagination: { limit: 50, offset: 0, hasMore: false },
    summaryStats: {
      totalWorkouts: 0,
      totalVolume: 0,
      totalSets: 0,
      averageVolumePerWorkout: 0,
      muscleGroupFrequency: {}
    },
    guestMode: true
  });
}

async function handleGetWorkouts(req, res) {
  const { limit = 50, offset = 0, startDate, endDate } = req.query;
  const userId = req.user.id;
  
  let query = supabase
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        *,
        exercises (
          name,
          muscle_group,
          category,
          tier,
          mvc_percentage
        ),
        sets (*)
      )
    `)
    .eq('user_id', userId)
    .order('workout_date', { ascending: false })
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);
  
  // Apply date filters
  if (startDate) {
    query = query.gte('workout_date', startDate);
  }
  if (endDate) {
    query = query.lte('workout_date', endDate);
  }
  
  const { data: workouts, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch workouts: ${error.message}`);
  }
  
  // Calculate analytics for each workout
  const workoutsWithAnalytics = workouts.map(workout => ({
    ...workout,
    analytics: calculateWorkoutAnalytics(workout.workout_exercises)
  }));
  
  // Get summary statistics
  const summaryStats = await calculateUserSummaryStats(userId, startDate, endDate);
  
  return res.status(200).json({
    success: true,
    workouts: workoutsWithAnalytics,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: workouts.length === parseInt(limit)
    },
    summaryStats
  });
}

async function handleCreateWorkout(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  const userId = req.user.id;
  const { workout_date, start_time, end_time, notes, exercises } = req.body;
  
  // Validate required fields
  if (!exercises || exercises.length === 0) {
    return res.status(400).json({ error: 'At least one exercise required' });
  }
  
  // Start transaction
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .insert([{
      user_id: userId,
      workout_date: workout_date || new Date().toISOString().split('T')[0],
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || new Date().toISOString(),
      notes: notes || null,
      metadata: {
        version: '2.0',
        source: 'hypertrack_pro'
      }
    }])
    .select()
    .single();
  
  if (workoutError) {
    throw new Error(`Failed to create workout: ${workoutError.message}`);
  }
  
  return res.status(201).json({
    success: true,
    workout: workout,
    message: 'Workout created successfully'
  });
}

function calculateWorkoutAnalytics(workoutExercises) {
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let totalTonnage = 0;
  const muscleGroups = new Set();
  const exerciseCategories = { compound: 0, isolation: 0 };
  
  workoutExercises.forEach(we => {
    muscleGroups.add(we.exercises.muscle_group);
    exerciseCategories[we.exercises.category.toLowerCase()]++;
    
    we.sets.forEach(set => {
      totalSets++;
      totalReps += set.reps;
      totalVolume += (set.weight * set.reps);
      totalTonnage += set.weight;
    });
  });
  
  return {
    totalSets,
    totalReps,
    totalVolume,
    totalTonnage,
    muscleGroupsTargeted: Array.from(muscleGroups),
    exerciseCategories
  };
}

async function calculateUserSummaryStats(userId, startDate, endDate) {
  return {
    totalWorkouts: 0,
    totalVolume: 0,
    totalSets: 0,
    averageVolumePerWorkout: 0,
    muscleGroupFrequency: {},
    dateRange: { startDate, endDate }
  };
}