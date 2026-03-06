import { supabase } from '../lib/supabase';
import type { VisitSchedule, VisitScheduleWithDetails } from '../lib/database.types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getSchedules(filters?: { execId?: string; homeId?: string }) {
    let query = supabase
        .from('visit_schedules')
        .select(`
            *,
            home:homes!visit_schedules_home_id_fkey(id, address, city),
            executive:profiles!visit_schedules_executive_id_fkey(id, name)
        `)
        .order('scheduled_at', { ascending: true });

    if (filters?.homeId) query = query.eq('home_id', filters.homeId);
    if (filters?.execId) query = query.eq('executive_id', filters.execId);

    const { data, error } = await query;
    if (error) throw error;
    return data as VisitScheduleWithDetails[];
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createSchedule(payload: {
    home_id: string;
    scheduled_at: string;
    frequency?: VisitSchedule['frequency'];
    executive_id?: string;
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
        .from('visit_schedules')
        .insert({
            ...payload,
            tenant_id: profile.tenant_id,
            status: 'scheduled',
        })
        .select()
        .single();

    if (error) throw error;
    return data as VisitSchedule;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateSchedule(id: string, payload: Partial<VisitSchedule>) {
    const { data, error } = await supabase
        .from('visit_schedules')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as VisitSchedule;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSchedule(id: string) {
    const { error } = await supabase.from('visit_schedules').delete().eq('id', id);
    if (error) throw error;
}
