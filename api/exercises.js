// Advanced Exercise CRUD API with filtering and recommendations
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query, body } = req;
  const { muscle_group, category, tier, search, limit = 50 } = query;

  try {
    switch (method) {
      case 'GET':
        return handleGetExercises(res, { muscle_group, category, tier, search, limit });
      case 'POST':
        return handleCreateExercise(res, body);
      case 'PUT':
        return handleUpdateExercise(res, query.id, body);
      case 'DELETE':
        return handleDeleteExercise(res, query.id);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

async function handleGetExercises(res, filters) {
  try {
    let query = supabase.from('exercises').select('*');

    // Apply filters
    if (filters.muscle_group) {
      query = query.eq('muscle_group', filters.muscle_group);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.tier) {
      query = query.eq('tier', parseInt(filters.tier));
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    query = query.limit(parseInt(filters.limit));
    
    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Add progressive overload recommendations
    const exercisesWithRecommendations = data.map(exercise => ({
      ...exercise,
      recommendations: generateProgressiveOverloadRecommendations(exercise)
    }));

    return res.status(200).json({
      exercises: exercisesWithRecommendations,
      count: data.length,
      filters: filters
    });
  } catch (error) {
    throw error;
  }
}

async function handleCreateExercise(res, exerciseData) {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exerciseData])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ exercise: data[0] });
  } catch (error) {
    throw error;
  }
}

async function handleUpdateExercise(res, id, updates) {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    return res.status(200).json({ exercise: data[0] });
  } catch (error) {
    throw error;
  }
}

async function handleDeleteExercise(res, id) {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    return res.status(200).json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    throw error;
  }
}

function generateProgressiveOverloadRecommendations(exercise) {
  const baseRecommendations = {
    beginner: {
      weightIncrease: 2.5,
      repRange: [8, 12],
      progressionWeeks: 2
    },
    intermediate: {
      weightIncrease: 5,
      repRange: [6, 10],
      progressionWeeks: 3
    },
    advanced: {
      weightIncrease: 2.5,
      repRange: [5, 8],
      progressionWeeks: 4
    }
  };

  // Adjust based on exercise category and muscle group
  const categoryModifiers = {
    'Compound': { weightMultiplier: 1.2, repAdjustment: -1 },
    'Isolation': { weightMultiplier: 0.8, repAdjustment: 2 }
  };

  const muscleGroupModifiers = {
    'Legs': { weightMultiplier: 1.5 },
    'Back': { weightMultiplier: 1.3 },
    'Chest': { weightMultiplier: 1.2 },
    'Shoulders': { weightMultiplier: 0.9 },
    'Arms': { weightMultiplier: 0.8 }
  };

  return {
    baseRecommendations,
    categoryModifier: categoryModifiers[exercise.category] || { weightMultiplier: 1, repAdjustment: 0 },
    muscleGroupModifier: muscleGroupModifiers[exercise.muscle_group] || { weightMultiplier: 1 },
    restPeriod: exercise.rest_period || 120,
    optimalRepRange: exercise.target_rep_range || '8-12'
  };
}