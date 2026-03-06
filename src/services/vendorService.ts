import { supabase } from '../lib/supabase';
import type { Vendor } from '../lib/database.types';

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getVendors() {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Vendor[];
}

export async function getVendorById(id: string) {
    const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Vendor;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createVendor(payload: {
    name: string;
    service_type: string;
    phone?: string;
    email?: string;
    profile_id?: string;
}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) throw new Error('No tenant associated with this account.');

    const { data, error } = await supabase
        .from('vendors')
        .insert({ ...payload, tenant_id: profile.tenant_id })
        .select()
        .single();

    if (error) throw error;
    return data as Vendor;
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateVendor(id: string, payload: Partial<Vendor>) {
    const { data, error } = await supabase
        .from('vendors')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Vendor;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteVendor(id: string) {
    const { error } = await supabase.from('vendors').delete().eq('id', id);
    if (error) throw error;
}
