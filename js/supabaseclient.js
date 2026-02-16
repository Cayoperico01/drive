import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// Initialize Supabase Client
// We use the global 'supabase' object provided by the CDN script
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
