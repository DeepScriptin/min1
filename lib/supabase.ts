
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string, fallback: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://zotouzeowxhqlarkkcts.supabase.co');
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'sb_publishable_2wYe3K2IaIrrqMALGxU3qQ_CyiV-GnS');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
