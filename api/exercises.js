// /api/exercises.js - Vercel serverless function
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) throw error;

    res.status(200).json(exercises);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
}