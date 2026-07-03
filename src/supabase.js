import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://rrdhxfcvidnewjqjcbtv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Xkzpzb3Laoe7FLpMFLwS2A_euhqqM3j';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const hasSupabaseConfig =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  !supabaseAnonKey.includes('your_supabase_anon_key_here');

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
