// lib/supabaseClient.ts
import { Database } from '@/types/supabase';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';


export const supabaseClient = createBrowserSupabaseClient<Database>();
