import { createClient } from '@supabase/supabase-js';

const ctvSupabaseUrl = import.meta.env.VITE_CTV_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const ctvSupabaseAnonKey = import.meta.env.VITE_CTV_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!ctvSupabaseUrl || !ctvSupabaseAnonKey) {
    console.warn("CTV Supabase environment variables not found!");
}

export const ctvSupabase = createClient(ctvSupabaseUrl || '', ctvSupabaseAnonKey || '');
