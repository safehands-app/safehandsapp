import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables.\n' +
        'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // The default 'local' lock mechanism can cause AbortError: Lock broken
        // by another request with the 'steal' option in React StrictMode/PWA environments.
        // We override this to memory or false if needed, but standard configuration
        // with explicit 'local' without the steal race condition usually stabilizes it.
        storage: window.localStorage,
        storageKey: 'safehands-auth-token',
    }
});
