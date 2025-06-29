// /api/workouts.js - Vercel serverless function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { 
        user_id, 
        limit = 10, 
        offset = 0,
        start_date,
        end_date
      } = req.query;
      
      let query = supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            *,
            sets (*)
          )
        `)
        .order('workout_date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (user_id) {
        query = query.eq('user_id', user_id);
      }
      
      if (start_date) {
        query = query.gte('workout_date', start_date);
      }
      
      if (end_date) {
        query = query.lte('workout_date', end_date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      res.status(200).json({
        success: true,
        data: data || [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: data?.length || 0
        }
      });
    } catch (error) {
      console.error('Error fetching workouts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch workouts',
        message: error.message
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { workout_date, user_id, metadata = {} } = req.body;
      
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          workout_date: workout_date || new Date().toISOString().split('T')[0],
          start_time: new Date(),
          user_id: user_id || '00000000-0000-0000-0000-000000000000',
          metadata
        })
        .select()
        .single();
      
      if (error) throw error;
      
      res.status(201).json({
        success: true,
        data,
        message: 'Workout created successfully'
      });
    } catch (error) {
      console.error('Error creating workout:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create workout',
        message: error.message
      });
    }
  }
}