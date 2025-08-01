// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
console.log('✅ SUPABASE_URL =', supabaseUrl);
console.log('✅ SUPABASE_KEY =', supabaseKey);


export const supabase = createClient(supabaseUrl, supabaseKey);
