import { supabase } from '../lib/supabase';
import type { Json } from '../lib/database.types';

// ─── Write an audit log entry ─────────────────────────────────────────────────

export async function logAction(params: {
    action: string;
    resource_type: string;
    resource_id?: string;
    detail?: Json;
    tenant_id?: string;
}) {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('audit_logs').insert({
        user_id: user?.id ?? null,
        tenant_id: params.tenant_id ?? null,
        action: params.action,
        resource_type: params.resource_type,
        resource_id: params.resource_id ?? null,
        detail: params.detail ?? null,
    });

    // Audit failures should be non-fatal — just log to console
    if (error) console.error('Audit log failed:', error.message);
}

// ─── Fetch audit logs (admin-only, RLS enforced) ──────────────────────────────

export async function getAuditLogs(limit = 100) {
    const { data, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            actor:profiles!audit_logs_user_id_fkey(id, name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data;
}
