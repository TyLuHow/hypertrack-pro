// /api/exercises.js - Vercel serverless function with fallback
import { createClient } from '@supabase/supabase-js';

// Fallback exercise data if Supabase fails
const fallbackExercises = [
  { id: 1, name: "Barbell Bench Press", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 95 },
  { id: 2, name: "Incline Dumbbell Press", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 90 },
  { id: 3, name: "Dips", muscle_group: "Chest", category: "Compound", tier: 1, mvc_percentage: 85 },
  { id: 4, name: "Cable Flyes", muscle_group: "Chest", category: "Isolation", tier: 2, mvc_percentage: 60 },
  { id: 5, name: "Pull-ups", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 117 },
  { id: 6, name: "Barbell Rows", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 93 },
  { id: 7, name: "Lat Pulldowns", muscle_group: "Back", category: "Compound", tier: 1, mvc_percentage: 90 },
  { id: 8, name: "Face Pulls", muscle_group: "Back", category: "Isolation", tier: 2, mvc_percentage: 65 },
  { id: 9, name: "Squats", muscle_group: "Legs", category: "Compound", tier: 1, mvc_percentage: 95 },
  { id: 10, name: "Romanian Deadlifts", muscle_group: "Legs", category: "Compound", tier: 1, mvc_percentage: 90 },
  { id: 11, name: "Leg Press", muscle_group: "Legs", category: "Compound", tier: 1, mvc_percentage: 88 },
  { id: 12, name: "Leg Curls", muscle_group: "Legs", category: "Isolation", tier: 2, mvc_percentage: 70 },
  { id: 13, name: "Overhead Press", muscle_group: "Shoulders", category: "Compound", tier: 1, mvc_percentage: 85 },
  { id: 14, name: "Lateral Raises", muscle_group: "Shoulders", category: "Isolation", tier: 2, mvc_percentage: 65 },
  { id: 15, name: "Rear Delt Flyes", muscle_group: "Shoulders", category: "Isolation", tier: 2, mvc_percentage: 60 },
  { id: 16, name: "Barbell Curls", muscle_group: "Biceps", category: "Isolation", tier: 1, mvc_percentage: 90 },
  { id: 17, name: "Hammer Curls", muscle_group: "Biceps", category: "Isolation", tier: 2, mvc_percentage: 75 },
  { id: 18, name: "Close-Grip Bench Press", muscle_group: "Triceps", category: "Compound", tier: 1, mvc_percentage: 85 },
  { id: 19, name: "Tricep Pushdowns", muscle_group: "Triceps", category: "Isolation", tier: 2, mvc_percentage: 75 }
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Try Supabase first, fallback to static data
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('Missing Supabase env vars, using fallback data');
      return res.status(200).json({
        success: true,
        data: fallbackExercises,
        count: fallbackExercises.length,
        source: 'fallback',
        timestamp: new Date().toISOString()
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Attempting Supabase connection...');
    
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group, tier, name');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    if (!exercises || exercises.length === 0) {
      console.log('No exercises found in Supabase, using fallback');
      return res.status(200).json({
        success: true,
        data: fallbackExercises,
        count: fallbackExercises.length,
        source: 'fallback-empty',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Successfully fetched ${exercises.length} exercises from Supabase`);
    return res.status(200).json({
      success: true,
      data: exercises,
      count: exercises.length,
      source: 'supabase',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Exercises endpoint error:', error);
    
    // Return fallback data on any error
    return res.status(200).json({
      success: true,
      data: fallbackExercises,
      count: fallbackExercises.length,
      source: 'fallback-error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}