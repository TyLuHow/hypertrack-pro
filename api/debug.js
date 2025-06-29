// /api/debug.js - Supabase connection debug endpoint
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Missing environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey,
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test simple query
    const { data, error, status } = await supabase
      .from('exercises')
      .select('count', { count: 'exact', head: true });

    return res.status(200).json({
      success: true,
      supabaseUrl: supabaseUrl,
      supabaseKeyLength: supabaseKey.length,
      connectionTest: {
        error: error,
        status: status,
        count: data
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}