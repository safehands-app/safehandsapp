import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need the service role key to bypass RLS and see auth.users directly, 
// but since we only have ANON key, we can at least query profiles.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("Checking profiles table for meet.safehands@gmail.com...");
    const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'meet.safehands@gmail.com');

    console.log("Profiles result:", pErr || profiles);
}
check();
