import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkProfiles() {
    console.log("Fetching profiles as anon...");
    console.time("fetchProfile");

    const { data: profData, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

    console.timeEnd("fetchProfile");

    if (profErr) {
        console.error("Profile Error:", profErr);
        return;
    }

    console.log("Profile Success:", profData);
}

checkProfiles().catch(console.error);
