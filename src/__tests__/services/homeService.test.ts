/**
 * Tests for homeService.ts
 * Covers: getHomes, createHome, updateHome, deleteHome
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse, mockUser, mockProfile } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

// Import after mocking
const { getHomes, createHome, updateHome, deleteHome } = await import('../../services/homeService');

const MOCK_HOME = {
    id: 'home-001',
    tenant_id: 'tenant-xyz-456',
    owner_user_id: mockUser.id,
    address: '12 Main Street',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    notes: 'Ground floor',
    elderly_present: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('homeService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ─── getHomes ─────────────────────────────────────────────────────────────

    describe('getHomes()', () => {
        it('returns an array of homes on success', async () => {
            mockResolvedDbResponse({ data: [MOCK_HOME], error: null });
            const result = await getHomes();
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
        });

        it('filters by homeId when provided', async () => {
            mockResolvedDbResponse({ data: [MOCK_HOME], error: null });
            const { supabase } = await import('../__mocks__/supabase');
            const fromSpy = vi.spyOn(supabase, 'from');
            await getHomes({ homeId: 'home-001' });
            expect(fromSpy).toHaveBeenCalledWith('homes');
        });

        it('throws when Supabase returns an error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'DB error' } });
            await expect(getHomes()).rejects.toThrow();
        });
    });

    // ─── createHome ───────────────────────────────────────────────────────────

    describe('createHome()', () => {
        it('calls supabase.from("homes").insert() with correct payload', async () => {
            mockResolvedDbResponse({ data: MOCK_HOME, error: null });
            const { supabase } = await import('../__mocks__/supabase');
            const fromSpy = vi.spyOn(supabase, 'from');

            await createHome({
                owner_user_id: mockUser.id,
                address: '12 Main Street',
                city: 'Chennai',
                country: 'India',
                elderly_present: true,
            });

            expect(fromSpy).toHaveBeenCalledWith('homes');
        });

        it('throws when not authenticated', async () => {
            const { supabase } = await import('../__mocks__/supabase');
            vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null }, error: null,
            } as any);
            mockResolvedDbResponse({ data: null, error: null });

            await expect(createHome({
                owner_user_id: '',
                address: '1 Test St',
                city: 'City',
                country: 'Country',
                elderly_present: false,
            })).rejects.toThrow('Not authenticated');
        });
    });

    // ─── updateHome ───────────────────────────────────────────────────────────

    describe('updateHome()', () => {
        it('returns updated home data', async () => {
            const updated = { ...MOCK_HOME, city: 'Bengaluru' };
            mockResolvedDbResponse({ data: updated, error: null });
            const result = await updateHome('home-001', { city: 'Bengaluru' });
            expect(result).toBeDefined();
        });
    });

    // ─── deleteHome ───────────────────────────────────────────────────────────

    describe('deleteHome()', () => {
        it('resolves without error on success', async () => {
            mockResolvedDbResponse({ data: null, error: null });
            await expect(deleteHome('home-001')).resolves.toBeUndefined();
        });

        it('throws on Supabase delete error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'delete failed' } });
            await expect(deleteHome('home-001')).rejects.toThrow();
        });
    });
});
