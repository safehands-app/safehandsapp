import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogin() {
    console.log("1. Attempting signInWithPassword...");
    console.time("signInWithPassword");

    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: 'meet.safehands@gmail.com',
        password: 'password123'
    });

    console.timeEnd("signInWithPassword");

    if (authErr) {
        console.error("Auth Error:", authErr);
        return;
    }

    console.log("Auth Success. User ID:", authData.user?.id);

    if (!authData.user) return;

    console.log("2. Attempting to fetch profile...");
    console.time("fetchProfile");

    const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    console.timeEnd("fetchProfile");

    if (profErr) {
        console.error("Profile Error:", profErr);
        return;
    }

    console.log("Profile Success:", profData);
}

checkLogin().catch(console.error);
