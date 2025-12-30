
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zotouzeowxhqlarkkcts.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2wYe3K2IaIrrqMALGxU3qQ_CyiV-GnS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
