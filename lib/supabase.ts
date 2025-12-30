
import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables from Vercel/Process
const SUPABASE_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) 
  || 'https://zotouzeowxhqlarkkcts.supabase.co';

// Note: If using the fallback, ensure this is a valid Supabase Anon key (typically starts with eyJ...)
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) 
  || 'sb_publishable_2wYe3K2IaIrrqMALGxU3qQ_CyiV-GnS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
