/**
 * Tests for vendorService.ts
 * Covers: getVendors, createVendor, updateVendor, deleteVendor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse, mockUser } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

const { getVendors, createVendor, updateVendor, deleteVendor } = await import('../../services/vendorService');

const MOCK_VENDOR = {
    id: 'vendor-001',
    tenant_id: 'tenant-xyz-456',
    profile_id: null,
    name: 'Kumar Electricals',
    service_type: 'Electrician',
    phone: '+91 9999 000001',
    email: 'kumar@example.com',
    rating: 4,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('vendorService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getVendors()', () => {
        it('returns a list of vendors', async () => {
            mockResolvedDbResponse({ data: [MOCK_VENDOR], error: null });
            const result = await getVendors();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Kumar Electricals');
        });

        it('throws on DB error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'RLS violation' } });
            await expect(getVendors()).rejects.toThrow();
        });
    });

    describe('createVendor()', () => {
        it('inserts a vendor and returns the created row', async () => {
            mockResolvedDbResponse({ data: MOCK_VENDOR, error: null });
            const result = await createVendor({
                name: 'Kumar Electricals',
                service_type: 'Electrician',
                phone: '+91 9999 000001',
                email: 'kumar@example.com',
            });
            expect(result).toBeDefined();
        });

        it('throws when not authenticated', async () => {
            const { supabase } = await import('../__mocks__/supabase');
            vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null }, error: null,
            } as any);

            await expect(createVendor({ name: 'Test', service_type: 'Plumber' }))
                .rejects.toThrow('Not authenticated');
        });
    });

    describe('updateVendor()', () => {
        it('updates vendor status from active to inactive', async () => {
            const updated = { ...MOCK_VENDOR, status: 'inactive' as const };
            mockResolvedDbResponse({ data: updated, error: null });
            const result = await updateVendor('vendor-001', { status: 'inactive' });
            expect(result).toBeDefined();
        });
    });

    describe('deleteVendor()', () => {
        it('resolves successfully when vendor exists', async () => {
            mockResolvedDbResponse({ data: null, error: null });
            await expect(deleteVendor('vendor-001')).resolves.toBeUndefined();
        });

        it('throws on error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'Not found' } });
            await expect(deleteVendor('vendor-999')).rejects.toThrow();
        });
    });
});
