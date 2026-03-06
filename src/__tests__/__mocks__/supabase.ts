/**
 * Manual Supabase client mock.
 *
 * Tests import this via:
 *   vi.mock('../../lib/supabase', () => import('../__mocks__/supabase'))
 *
 * The mock uses a chainable builder pattern so calls like:
 *   supabase.from('homes').select('*').eq('id', x).single()
 * all resolve to a configurable response.
 */

import { vi } from 'vitest';

// ─────────────────────────────────────────────────────────────────────────────
// Storage mock
// ─────────────────────────────────────────────────────────────────────────────

const storageMock = {
    from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/photo.jpg' } }),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Query chain mock — configure via mockResolvedDbResponse()
// ─────────────────────────────────────────────────────────────────────────────

let _mockDbResponse: { data: unknown; error: unknown; count: number | null } = {
    data: [],
    error: null,
    count: 0,
};

/** Call this in your test's beforeEach to set what the mock DB will return. */
export function mockResolvedDbResponse(res: Partial<typeof _mockDbResponse>) {
    _mockDbResponse = { data: [], error: null, count: 0, ...res };
}

// Chainable query builder — every method returns `this` until the final await
const makeQueryChain = () => {
    const chain: Record<string, unknown> = {};

    const terminators = ['single', 'maybeSingle'];
    const methods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq',
        'gt', 'lt', 'gte', 'lte', 'in', 'is', 'like', 'ilike', 'not',
        'or', 'and', 'filter', 'match', 'contains', 'containedBy',
        'order', 'limit', 'range', 'returns', 'head', 'throwOnError'];

    for (const m of methods) {
        chain[m] = vi.fn().mockReturnValue(chain);
    }

    // Terminators resolve to the configured response
    for (const t of terminators) {
        chain[t] = vi.fn().mockReturnValue(
            new Promise(r => r(_mockDbResponse))
        );
    }

    // The chain itself is thenable (await supabase.from(...).select())
    chain.then = (resolve: (v: unknown) => void) =>
        Promise.resolve(_mockDbResponse).then(resolve);

    return chain;
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth mock
// ─────────────────────────────────────────────────────────────────────────────

export const mockUser = {
    id: 'user-abc-123',
    email: 'admin@test.com',
    user_metadata: { name: 'Test Admin' },
};

export const mockProfile = {
    id: 'user-abc-123',
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'tenant-admin',
    tenant_id: 'tenant-xyz-456',
};

const authMock = {
    getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Exported supabase mock
// ─────────────────────────────────────────────────────────────────────────────

export const supabase = {
    from: vi.fn().mockImplementation(() => makeQueryChain()),
    auth: authMock,
    storage: storageMock,
};
