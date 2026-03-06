import { supabase } from '../lib/supabase';
import type { MaintenanceRequest, MaintenanceRequestWithDetails } from '../lib/database.types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getMaintenanceRequests(filters?: {
    homeId?: string;
    status?: MaintenanceRequest['status'];
}) {
    let query = supabase
        .from('maintenance_requests')
        .select(`
            *,
            home:homes!maintenance_requests_home_id_fkey(id, address, city),
            requester:profiles!maintenance_requests_requested_by_fkey(id, name),
            vendor:vendors!maintenance_requests_assigned_vendor_id_fkey(id, name, service_type)
        `)
        .order('created_at', { ascending: false });

    if (filters?.homeId) query = query.eq('home_id', filters.homeId);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data as MaintenanceRequestWithDetails[];
}

export async function getMaintenanceRequestById(id: string) {
    const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
            *,
            home:homes!maintenance_requests_home_id_fkey(id, address, city),
            requester:profiles!maintenance_requests_requested_by_fkey(id, name),
            vendor:vendors!maintenance_requests_assigned_vendor_id_fkey(id, name, service_type)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as MaintenanceRequestWithDetails;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createMaintenanceRequest(payload: {
    home_id: string;
    description: string;
    priority?: MaintenanceRequest['priority'];
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
        .from('maintenance_requests')
        .insert({
            ...payload,
            tenant_id: profile.tenant_id,
            requested_by: user.id,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return data as MaintenanceRequest;
}

// ─── Assign to vendor ─────────────────────────────────────────────────────────

export async function assignMaintenanceRequest(id: string, vendorId: string) {
    const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ assigned_vendor_id: vendorId, status: 'assigned' })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as MaintenanceRequest;
}

// ─── Update status ────────────────────────────────────────────────────────────

export async function updateMaintenanceStatus(
    id: string,
    status: MaintenanceRequest['status'],
    notes?: string
) {
    const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ status, ...(notes !== undefined ? { notes } : {}) })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as MaintenanceRequest;
}
