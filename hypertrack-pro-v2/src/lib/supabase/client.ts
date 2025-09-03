import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/types/supabase';

export const getSupabase = () => {
  const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '') as string;
  const supabaseKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '') as string;
  return createClient<Database>(supabaseUrl, supabaseKey);
};



