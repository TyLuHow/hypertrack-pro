// /api/exercises.js - Vercel serverless function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

  try {
    console.log('Fetching exercises from Supabase...');
    
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('muscle_group, tier, name');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Successfully fetched ${exercises?.length || 0} exercises`);

    res.status(200).json({
      success: true,
      data: exercises || [],
      count: exercises?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exercises',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}