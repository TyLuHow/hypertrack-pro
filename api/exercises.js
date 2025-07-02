import { createClient } from '@supabase/supabase-js';

// Fallback exercise data for when database is not configured
const fallbackExercises = [
  {
    id: 1,
    name: "Barbell Bench Press",
    muscle_group: "Chest",
    category: "Compound",
    tier: 1,
    mvc_percentage: 95,
    equipment: ["barbell", "bench"],
    description: "The gold standard for chest development with highest pectoralis major activation."
  },
  {
    id: 2,
    name: "Incline Dumbbell Press",
    muscle_group: "Chest", 
    category: "Compound",
    tier: 1,
    mvc_percentage: 90,
    equipment: ["dumbbells", "incline_bench"],
    description: "Superior upper chest activation compared to flat pressing movements."
  },
  {
    id: 3,
    name: "Pull-ups",
    muscle_group: "Back",
    category: "Compound", 
    tier: 1,
    mvc_percentage: 117,
    equipment: ["pull_up_bar"],
    description: "Highest latissimus dorsi activation among all pulling exercises."
  },
  {
    id: 4,
    name: "Barbell Rows",
    muscle_group: "Back",
    category: "Compound",
    tier: 1, 
    mvc_percentage: 93,
    equipment: ["barbell"],
    description: "Excellent for building back thickness and overall pulling strength."
  },
  {
    id: 5,
    name: "Squats",
    muscle_group: "Legs",
    category: "Compound",
    tier: 1,
    mvc_percentage: 88,
    equipment: ["barbell", "squat_rack"],
    description: "The king of exercises for overall leg development and strength."
  },
  {
    id: 6,
    name: "Deadlifts", 
    muscle_group: "Legs",
    category: "Compound",
    tier: 1,
    mvc_percentage: 85,
    equipment: ["barbell"],
    description: "Fundamental movement for posterior chain and overall strength."
  },
  {
    id: 7,
    name: "Overhead Press",
    muscle_group: "Shoulders",
    category: "Compound", 
    tier: 1,
    mvc_percentage: 82,
    equipment: ["barbell"],
    description: "Essential for shoulder strength and stability."
  },
  {
    id: 8,
    name: "Dips",
    muscle_group: "Chest",
    category: "Compound",
    tier: 1,
    mvc_percentage: 85,
    equipment: ["dip_station"],
    description: "Excellent compound movement for chest, triceps, and anterior deltoids."
  },
  {
    id: 9,
    name: "Lateral Raises",
    muscle_group: "Shoulders", 
    category: "Isolation",
    tier: 2,
    mvc_percentage: 78,
    equipment: ["dumbbells"],
    description: "Primary isolation exercise for medial deltoid development."
  },
  {
    id: 10,
    name: "Barbell Curls",
    muscle_group: "Biceps",
    category: "Isolation",
    tier: 2, 
    mvc_percentage: 75,
    equipment: ["barbell"],
    description: "Classic bicep exercise for arm development."
  }
];

const supabase = process.env.SUPABASE_URL ? createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
) : null;

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    if (req.method === 'GET') {
      return await handleGetExercises(req, res);
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Exercises API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

async function handleGetExercises(req, res) {
  const { muscleGroup, tier, category, search } = req.query;
  
  // Use database if configured, otherwise use fallback data
  let exercises = fallbackExercises;
  let usingFallback = true;
  
  if (supabase) {
    try {
      let query = supabase.from('exercises').select('*');
      
      // Apply filters
      if (muscleGroup) {
        if (muscleGroup === 'Arms') {
          query = query.in('muscle_group', ['Biceps', 'Triceps']);
        } else {
          query = query.eq('muscle_group', muscleGroup);
        }
      }
      
      if (tier) {
        query = query.eq('tier', parseInt(tier));
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      query = query.order('tier').order('mvc_percentage', { ascending: false });
      
      const { data: dbExercises, error } = await query;
      
      if (!error && dbExercises) {
        exercises = dbExercises;
        usingFallback = false;
      }
    } catch (error) {
      console.log('Database query failed, using fallback data:', error.message);
    }
  }
  
  // Apply client-side filtering for fallback data
  if (usingFallback) {
    exercises = exercises.filter(exercise => {
      let matches = true;
      
      if (muscleGroup && muscleGroup !== 'all') {
        if (muscleGroup === 'Arms') {
          matches = matches && ['Biceps', 'Triceps'].includes(exercise.muscle_group);
        } else {
          matches = matches && exercise.muscle_group === muscleGroup;
        }
      }
      
      if (tier) {
        matches = matches && exercise.tier === parseInt(tier);
      }
      
      if (category) {
        matches = matches && exercise.category === category;
      }
      
      if (search) {
        matches = matches && exercise.name.toLowerCase().includes(search.toLowerCase());
      }
      
      return matches;
    });
  }
  
  const metadata = {
    total: exercises.length,
    totalInDatabase: usingFallback ? fallbackExercises.length : exercises.length,
    muscleGroups: [...new Set(exercises.map(ex => ex.muscle_group))],
    categories: [...new Set(exercises.map(ex => ex.category))],
    lastUpdated: new Date().toISOString(),
    usingFallback: usingFallback,
    databaseConfigured: !!supabase
  };
  
  return res.status(200).json({
    success: true,
    exercises,
    metadata
  });
}