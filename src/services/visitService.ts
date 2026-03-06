import { supabase } from '../lib/supabase';
import type { HomeVisit, HomeVisitWithDetails, VisitPhoto } from '../lib/database.types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getVisits(filters?: { homeId?: string; execId?: string }) {
    let query = supabase
        .from('home_visits')
        .select(`
            *,
            home:homes!home_visits_home_id_fkey(id, address, city, country),
            executive:profiles!home_visits_executive_id_fkey(id, name),
            photos:visit_photos(*)
        `)
        .order('visit_date', { ascending: false });

    if (filters?.homeId) query = query.eq('home_id', filters.homeId);
    if (filters?.execId) query = query.eq('executive_id', filters.execId);

    const { data, error } = await query;
    if (error) throw error;
    return data as HomeVisitWithDetails[];
}

export async function getVisitById(id: string) {
    const { data, error } = await supabase
        .from('home_visits')
        .select(`
            *,
            home:homes!home_visits_home_id_fkey(id, address, city, country),
            executive:profiles!home_visits_executive_id_fkey(id, name),
            photos:visit_photos(*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as HomeVisitWithDetails;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createVisit(payload: {
    home_id: string;
    executive_id: string;
    visit_date?: string;
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
        .from('home_visits')
        .insert({
            ...payload,
            tenant_id: profile.tenant_id,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data as HomeVisit;
}

// ─── Update status / notes ────────────────────────────────────────────────────

export async function updateVisit(id: string, payload: Partial<HomeVisit>) {
    const { data, error } = await supabase
        .from('home_visits')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as HomeVisit;
}

// ─── Photo upload ─────────────────────────────────────────────────────────────

export async function uploadVisitPhoto(
    visitId: string,
    file: File,
    caption?: string
): Promise<VisitPhoto> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const ext = file.name.split('.').pop();
    const filePath = `${visitId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
        .from('visit-photos')
        .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('visit-photos')
        .getPublicUrl(filePath);

    const { data, error } = await supabase
        .from('visit_photos')
        .insert({
            visit_id: visitId,
            url: publicUrl,
            caption: caption ?? file.name,
            uploaded_by: user.id,
        })
        .select()
        .single();

    if (error) throw error;
    return data as VisitPhoto;
}
