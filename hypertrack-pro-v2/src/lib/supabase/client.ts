import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/types/supabase';

let client: SupabaseClient<Database> | null = null;

export const getSupabase = () => {
  if (client) return client;
  const supabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '') as string;
  const supabaseKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '') as string;
  client = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      storageKey: 'htp-auth',
    },
  });
  return client;
};

export const getCurrentUserId = async (): Promise<string | null> => {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};



