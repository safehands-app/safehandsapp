/**
 * Tests for wellbeingService.ts
 * Covers: getWellbeingChecks, createWellbeingCheck
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse, mockUser } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

const { getWellbeingChecks, createWellbeingCheck } = await import('../../services/wellbeingService');

const MOCK_CHECK = {
    id: 'check-001',
    tenant_id: 'tenant-xyz-456',
    home_id: 'home-001',
    executive_id: mockUser.id,
    status: 'ok' as const,
    notes: 'Elderly person is doing well.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('wellbeingService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getWellbeingChecks()', () => {
        it('returns a list of checks', async () => {
            mockResolvedDbResponse({ data: [MOCK_CHECK], error: null });
            const result = await getWellbeingChecks();
            expect(result).toHaveLength(1);
            expect(result[0].status).toBe('ok');
        });

        it('returns empty array when no checks exist', async () => {
            mockResolvedDbResponse({ data: [], error: null });
            const result = await getWellbeingChecks();
            expect(result).toHaveLength(0);
        });

        it('throws on DB error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'Access denied' } });
            await expect(getWellbeingChecks()).rejects.toThrow();
        });
    });

    describe('createWellbeingCheck()', () => {
        it('creates a check successfully', async () => {
            mockResolvedDbResponse({ data: MOCK_CHECK, error: null });
            const result = await createWellbeingCheck({
                home_id: 'home-001',
                status: 'ok',
                notes: 'All good',
            });
            expect(result).toBeDefined();
        });

        it('creates an attention-required check', async () => {
            const attnCheck = { ...MOCK_CHECK, status: 'attention-required' as const };
            mockResolvedDbResponse({ data: attnCheck, error: null });
            const result = await createWellbeingCheck({
                home_id: 'home-001',
                status: 'attention-required',
            });
            expect(result).toBeDefined();
        });

        it('creates an emergency check', async () => {
            const emergency = { ...MOCK_CHECK, status: 'emergency' as const };
            mockResolvedDbResponse({ data: emergency, error: null });
            const result = await createWellbeingCheck({
                home_id: 'home-001',
                status: 'emergency',
                notes: 'Fell down, ambulance called',
            });
            expect(result).toBeDefined();
        });

        it('throws when not authenticated', async () => {
            const { supabase } = await import('../__mocks__/supabase');
            vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null }, error: null,
            } as any);

            await expect(createWellbeingCheck({
                home_id: 'home-001',
                status: 'ok',
            })).rejects.toThrow('Not authenticated');
        });
    });
});
