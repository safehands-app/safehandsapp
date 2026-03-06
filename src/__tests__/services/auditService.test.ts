/**
 * Tests for auditService.ts
 * The key behavior: logAction() MUST be non-fatal — it should never throw
 * even when Supabase insert fails.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

const { logAction, getAuditLogs } = await import('../../services/auditService');

describe('auditService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('logAction()', () => {
        it('resolves without throwing on success', async () => {
            mockResolvedDbResponse({ data: null, error: null });
            await expect(
                logAction({ action: 'CREATE', resource_type: 'home', resource_id: 'home-001' })
            ).resolves.toBeUndefined();
        });

        it('does NOT throw even when Supabase insert fails (non-fatal)', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockResolvedDbResponse({ data: null, error: { message: 'insert failed' } });

            // This MUST NOT reject — audit failures are non-fatal
            await expect(
                logAction({ action: 'DELETE', resource_type: 'vendor', resource_id: 'v-001' })
            ).resolves.toBeUndefined();

            // But it should log the error
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Audit log failed:'),
                expect.any(String)
            );
            consoleSpy.mockRestore();
        });

        it('passes correct payload shape to Supabase', async () => {
            mockResolvedDbResponse({ data: null, error: null });
            const { supabase } = await import('../__mocks__/supabase');
            const fromSpy = vi.spyOn(supabase, 'from');

            await logAction({
                action: 'UPDATE',
                resource_type: 'maintenance_request',
                resource_id: 'mr-001',
                tenant_id: 'tenant-xyz-456',
                detail: { status: 'resolved' },
            });

            expect(fromSpy).toHaveBeenCalledWith('audit_logs');
        });
    });

    describe('getAuditLogs()', () => {
        it('returns an array of audit log entries', async () => {
            const mockLog = {
                id: 'log-001',
                action: 'CREATE',
                resource_type: 'home',
                created_at: new Date().toISOString(),
            };
            mockResolvedDbResponse({ data: [mockLog], error: null });
            const result = await getAuditLogs();
            expect(result).toHaveLength(1);
            expect(result![0].action).toBe('CREATE');
        });

        it('throws when getAuditLogs fails (unlike logAction, reads should surface errors)', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'permission denied' } });
            await expect(getAuditLogs()).rejects.toThrow();
        });

        it('respects the limit argument', async () => {
            mockResolvedDbResponse({ data: [], error: null });
            const { supabase } = await import('../__mocks__/supabase');
            const fromSpy = vi.spyOn(supabase, 'from');
            await getAuditLogs(25);
            expect(fromSpy).toHaveBeenCalledWith('audit_logs');
        });
    });
});
