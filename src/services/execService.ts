import { supabase } from '../lib/supabase';
import type { FieldExecutive } from '../lib/database.types';

export async function getFieldExecutives(region?: string) {
    let query = supabase
        .from('field_executives')
        .select(`
      *,
      profile:profiles(id, name, email, avatar_url)
    `)
        .order('rating', { ascending: false });

    if (region) query = query.eq('region', region);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function getFreeExecutives(region?: string) {
    let query = supabase
        .from('field_executives')
        .select(`
      *,
      profile:profiles(id, name, email, avatar_url)
    `)
        .eq('status', 'Free')
        .order('jobs_completed', { ascending: false });

    if (region) query = query.eq('region', region);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function updateExecStatus(
    profileId: string,
    status: 'Free' | 'On-Job',
    currentJobId?: string | null
) {
    const { data, error } = await supabase
        .from('field_executives')
        .update({ status, current_job_id: currentJobId ?? null })
        .eq('profile_id', profileId)
        .select()
        .single();

    if (error) throw error;
    return data as FieldExecutive;
}
