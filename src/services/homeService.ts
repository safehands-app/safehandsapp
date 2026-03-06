import { supabase } from '../lib/supabase';
import type { Home } from '../lib/database.types';

// ─── Get all homes (RLS enforces tenant scope automatically) ──────────────────

export async function getHomes() {
    const { data, error } = await supabase
        .from('homes')
        .select(`
            *,
            owner:profiles!homes_owner_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Home & { owner: { id: string; name: string; email: string } | null })[];
}

export async function getHomeById(id: string) {
    const { data, error } = await supabase
        .from('homes')
        .select(`
            *,
            owner:profiles!homes_owner_user_id_fkey(id, name, email)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Home & { owner: { id: string; name: string; email: string } | null };
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createHome(payload: {
    owner_user_id: string;
    address: string;
    city: string;
    state?: string;
    country?: string;
    notes?: string;
    elderly_present?: boolean;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get the tenant_id from profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) throw new Error('No tenant associated with this account.');

    const { data, error } = await supabase
        .from('homes')
        .insert({ ...payload, tenant_id: profile.tenant_id })
        .select()
        .single();

    if (error) throw error;
    return data as Home;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateHome(id: string, payload: Partial<Home>) {
    const { data, error } = await supabase
        .from('homes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Home;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteHome(id: string) {
    const { error } = await supabase.from('homes').delete().eq('id', id);
    if (error) throw error;
}
