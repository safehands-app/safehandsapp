import { supabase } from '../lib/supabase';
import type { WellbeingCheck } from '../lib/database.types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getWellbeingChecks(filters?: { homeId?: string }) {
    let query = supabase
        .from('wellbeing_checks')
        .select(`
            *,
            home:homes!wellbeing_checks_home_id_fkey(id, address, city),
            executive:profiles!wellbeing_checks_executive_id_fkey(id, name)
        `)
        .order('created_at', { ascending: false });

    if (filters?.homeId) query = query.eq('home_id', filters.homeId);

    const { data, error } = await query;
    if (error) throw error;
    return data as (WellbeingCheck & {
        home: { id: string; address: string; city: string } | null;
        executive: { id: string; name: string } | null;
    })[];
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createWellbeingCheck(payload: {
    home_id: string;
    status: WellbeingCheck['status'];
    notes?: string;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) throw new Error('No tenant associated.');

    const { data, error } = await supabase
        .from('wellbeing_checks')
        .insert({
            ...payload,
            tenant_id: profile.tenant_id,
            executive_id: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data as WellbeingCheck;
}
