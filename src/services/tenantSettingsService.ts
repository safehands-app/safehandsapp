import { supabase } from '../lib/supabase';
import type { TenantSettings } from '../lib/database.types';

// ─── Get branding settings for current tenant ─────────────────────────────────

export async function getTenantSettings(tenantId: string) {
    const { data, error } = await supabase
        .from('tenant_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data as TenantSettings | null;
}

// ─── Upsert (create or update) branding settings ─────────────────────────────

export async function upsertTenantSettings(
    tenantId: string,
    payload: Partial<Omit<TenantSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>
) {
    const { data, error } = await supabase
        .from('tenant_settings')
        .upsert({ tenant_id: tenantId, ...payload }, { onConflict: 'tenant_id' })
        .select()
        .single();

    if (error) throw error;
    return data as TenantSettings;
}

// ─── Upload tenant logo to Supabase Storage ───────────────────────────────────

export async function uploadTenantLogo(tenantId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const filePath = `logos/${tenantId}.${ext}`;

    const { error } = await supabase.storage
        .from('visit-photos')  // reuse same bucket, different folder
        .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('visit-photos')
        .getPublicUrl(filePath);

    return publicUrl;
}
