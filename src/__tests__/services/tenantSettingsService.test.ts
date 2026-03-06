/**
 * Tests for tenantSettingsService.ts
 * Covers: getTenantSettings, upsertTenantSettings, uploadTenantLogo
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockResolvedDbResponse } from '../__mocks__/supabase';

vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'));

const { getTenantSettings, upsertTenantSettings, uploadTenantLogo } =
    await import('../../services/tenantSettingsService');

const MOCK_SETTINGS = {
    id: 'settings-001',
    tenant_id: 'tenant-xyz-456',
    platform_name: 'SafeHands Portal',
    logo_url: 'https://example.com/logo.png',
    primary_color: '#2563eb',
    secondary_color: '#64748b',
    footer_text: '© 2025 SafeHands',
    support_email: 'support@safehands.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

describe('tenantSettingsService', () => {
    beforeEach(() => vi.clearAllMocks());

    describe('getTenantSettings()', () => {
        it('returns settings when they exist', async () => {
            mockResolvedDbResponse({ data: MOCK_SETTINGS, error: null });
            const result = await getTenantSettings('tenant-xyz-456');
            expect(result).not.toBeNull();
            expect(result?.platform_name).toBe('SafeHands Portal');
        });

        it('returns null when no settings exist (PGRST116 / no rows)', async () => {
            mockResolvedDbResponse({ data: null, error: { code: 'PGRST116', message: 'no rows' } });
            const result = await getTenantSettings('tenant-new-000');
            expect(result).toBeNull();
        });

        it('throws on non-PGRST116 DB errors', async () => {
            mockResolvedDbResponse({ data: null, error: { code: 'PGRST500', message: 'server error' } });
            await expect(getTenantSettings('tenant-xyz-456')).rejects.toThrow();
        });
    });

    describe('upsertTenantSettings()', () => {
        it('upserts and returns the settings row', async () => {
            mockResolvedDbResponse({ data: MOCK_SETTINGS, error: null });
            const result = await upsertTenantSettings('tenant-xyz-456', {
                platform_name: 'My Care Portal',
                primary_color: '#10b981',
            });
            expect(result).toBeDefined();
        });

        it('throws on upsert error', async () => {
            mockResolvedDbResponse({ data: null, error: { message: 'conflict' } });
            await expect(upsertTenantSettings('tenant-xyz-456', {})).rejects.toThrow();
        });
    });

    describe('uploadTenantLogo()', () => {
        it('returns a public URL after successful upload', async () => {
            const mockFile = new File(['logo data'], 'logo.png', { type: 'image/png' });
            const result = await uploadTenantLogo('tenant-xyz-456', mockFile);
            expect(typeof result).toBe('string');
            expect(result).toContain('http');
        });

        it('throws when storage upload fails', async () => {
            const { supabase } = await import('../__mocks__/supabase');
            vi.spyOn(supabase.storage, 'from').mockReturnValueOnce({
                upload: vi.fn().mockResolvedValue({ error: { message: 'storage error' } }),
                getPublicUrl: vi.fn(),
            } as any);

            const mockFile = new File(['data'], 'logo.png', { type: 'image/png' });
            await expect(uploadTenantLogo('tenant-xyz-456', mockFile)).rejects.toThrow();
        });
    });
});
