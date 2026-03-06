/**
 * Tests for scheduleService.ts
 * Covers: getSchedules, createSchedule, updateSchedule, deleteSchedule
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse, mockUser } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

const { getSchedules, createSchedule, updateSchedule, deleteSchedule } =
    await import('../../services/scheduleService');

const MOCK_SCHEDULE = {
    id: 'sched-001',
    tenant_id: 'tenant-xyz-456',
    home_id: 'home-001',
    executive_id: mockUser.id,
    scheduled_at: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    frequency: 'weekly' as const,
    status: 'scheduled' as const,
    notes: 'Regular weekly check',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('scheduleService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getSchedules()', () => {
        it('returns scheduled visits', async () => {
            mockResolvedDbResponse({ data: [MOCK_SCHEDULE], error: null });
            const result = await getSchedules();
            expect(result).toHaveLength(1);
            expect(result[0].frequency).toBe('weekly');
        });

        it('filters by execId', async () => {
            mockResolvedDbResponse({ data: [MOCK_SCHEDULE], error: null });
            const { supabase } = await import('../__mocks__/supabase');
            const fromSpy = vi.spyOn(supabase, 'from');
            await getSchedules({ execId: mockUser.id });
            expect(fromSpy).toHaveBeenCalledWith('visit_schedules');
        });

        it('throws on error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'access denied' } });
            await expect(getSchedules()).rejects.toThrow();
        });
    });

    describe('createSchedule()', () => {
        it('creates a schedule successfully', async () => {
            mockResolvedDbResponse({ data: MOCK_SCHEDULE, error: null });
            const result = await createSchedule({
                home_id: 'home-001',
                scheduled_at: MOCK_SCHEDULE.scheduled_at,
                frequency: 'weekly',
            });
            expect(result).toBeDefined();
        });

        it('throws if not authenticated', async () => {
            const { supabase } = await import('../__mocks__/supabase');
            vi.spyOn(supabase.auth, 'getUser').mockResolvedValueOnce({
                data: { user: null }, error: null
            } as any);

            await expect(createSchedule({
                home_id: 'home-001',
                scheduled_at: new Date().toISOString(),
            })).rejects.toThrow('Not authenticated');
        });
    });

    describe('updateSchedule()', () => {
        it('updates the status to completed', async () => {
            const done = { ...MOCK_SCHEDULE, status: 'completed' as const };
            mockResolvedDbResponse({ data: done, error: null });
            const result = await updateSchedule('sched-001', { status: 'completed' });
            expect(result).toBeDefined();
        });
    });

    describe('deleteSchedule()', () => {
        it('deletes successfully', async () => {
            mockResolvedDbResponse({ data: null, error: null });
            await expect(deleteSchedule('sched-001')).resolves.toBeUndefined();
        });

        it('throws on delete error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'not found' } });
            await expect(deleteSchedule('sched-999')).rejects.toThrow();
        });
    });
});
