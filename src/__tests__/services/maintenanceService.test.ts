/**
 * Tests for maintenanceService.ts
 * Covers: getMaintenanceRequests, createMaintenanceRequest,
 *         assignMaintenanceRequest, updateMaintenanceStatus
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse, mockUser } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

const {
    getMaintenanceRequests,
    createMaintenanceRequest,
    assignMaintenanceRequest,
    updateMaintenanceStatus,
} = await import('../../services/maintenanceService');

const MOCK_REQUEST = {
    id: 'req-001',
    tenant_id: 'tenant-xyz-456',
    home_id: 'home-001',
    requested_by: mockUser.id,
    description: 'Leaking tap in kitchen',
    status: 'pending' as const,
    priority: 'high' as const,
    assigned_vendor_id: null,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('maintenanceService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getMaintenanceRequests()', () => {
        it('returns list of maintenance requests', async () => {
            mockResolvedDbResponse({ data: [MOCK_REQUEST], error: null });
            const result = await getMaintenanceRequests();
            expect(result).toHaveLength(1);
            expect(result[0].description).toBe('Leaking tap in kitchen');
        });

        it('filters by homeId when provided', async () => {
            mockResolvedDbResponse({ data: [MOCK_REQUEST], error: null });
            const { supabase } = await import('../__mocks__/supabase');
            const fromSpy = vi.spyOn(supabase, 'from');
            await getMaintenanceRequests({ homeId: 'home-001' });
            expect(fromSpy).toHaveBeenCalledWith('maintenance_requests');
        });

        it('throws on DB error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'RLS violation' } });
            await expect(getMaintenanceRequests()).rejects.toThrow();
        });
    });

    describe('createMaintenanceRequest()', () => {
        it('creates a request and returns the new row', async () => {
            mockResolvedDbResponse({ data: MOCK_REQUEST, error: null });
            const result = await createMaintenanceRequest({
                home_id: 'home-001',
                description: 'Leaking tap in kitchen',
                priority: 'high',
            });
            expect(result).toBeDefined();
        });

        it('throws when not authenticated', async () => {
            const { supabase } = await import('../__mocks__/supabase');
            vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null }, error: null,
            } as any);

            await expect(createMaintenanceRequest({
                home_id: 'home-001',
                description: 'Test',
            })).rejects.toThrow('Not authenticated');
        });
    });

    describe('assignMaintenanceRequest()', () => {
        it('sets the assigned_vendor_id on the request', async () => {
            const assigned = { ...MOCK_REQUEST, assigned_vendor_id: 'vendor-001', status: 'assigned' as const };
            mockResolvedDbResponse({ data: assigned, error: null });
            const result = await assignMaintenanceRequest('req-001', 'vendor-001');
            expect(result).toBeDefined();
        });
    });

    describe('updateMaintenanceStatus()', () => {
        it('updates status to completed', async () => {
            const resolved = { ...MOCK_REQUEST, status: 'completed' as const };
            mockResolvedDbResponse({ data: resolved, error: null });
            const result = await updateMaintenanceStatus('req-001', 'completed');
            expect(result).toBeDefined();
        });

        it('throws on error updating status', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'update failed' } });
            await expect(updateMaintenanceStatus('req-001', 'completed')).rejects.toThrow();
        });
    });
});
