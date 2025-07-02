// api/exercises.js - Supabase Integration Version
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
    switch (req.method) {
      case 'GET':
        return await handleGetExercises(req, res);
      case 'POST':
        return await handleCreateExercise(req, res);
      case 'PUT':
        return await handleUpdateExercise(req, res);
      case 'DELETE':
        return await handleDeleteExercise(req, res);
      default:
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
  
  let query = supabase
    .from('exercises')
    .select('*');
  
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
  
  // Order by effectiveness (tier 1 first, then by MVC percentage)
  query = query.order('tier').order('mvc_percentage', { ascending: false });
  
  const { data: exercises, error } = await query;
  
  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }
  
  // Calculate metadata
  const allExercises = await supabase.from('exercises').select('muscle_group, category');
  const { data: allData } = allExercises;
  
  const metadata = {
    total: exercises.length,
    totalInDatabase: allData?.length || 0,
    muscleGroups: [...new Set(allData?.map(ex => ex.muscle_group) || [])],
    categories: [...new Set(allData?.map(ex => ex.category) || [])],
    lastUpdated: new Date().toISOString()
  };
  
  return res.status(200).json({
    success: true,
    exercises,
    metadata
  });
}

async function handleCreateExercise(req, res) {
  const exerciseData = req.body;
  
  // Validate required fields
  const required = ['name', 'muscle_group', 'category', 'tier', 'mvc_percentage'];
  for (const field of required) {
    if (!exerciseData[field]) {
      return res.status(400).json({ 
        error: `Missing required field: ${field}`
      });
    }
  }
  
  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert([{
      name: exerciseData.name,
      muscle_group: exerciseData.muscle_group,
      category: exerciseData.category,
      tier: exerciseData.tier,
      mvc_percentage: exerciseData.mvc_percentage,
      equipment: exerciseData.equipment || null,
      description: exerciseData.description || null,
      research_notes: exerciseData.research_notes || null
    }])
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create exercise: ${error.message}`);
  }
  
  return res.status(201).json({
    success: true,
    exercise,
    message: 'Exercise created successfully'
  });
}

async function handleUpdateExercise(req, res) {
  const { id } = req.query;
  const updates = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Exercise ID required' });
  }
  
  const { data: exercise, error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update exercise: ${error.message}`);
  }
  
  return res.status(200).json({
    success: true,
    exercise,
    message: 'Exercise updated successfully'
  });
}

async function handleDeleteExercise(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Exercise ID required' });
  }
  
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Failed to delete exercise: ${error.message}`);
  }
  
  return res.status(200).json({
    success: true,
    message: 'Exercise deleted successfully'
  });
}