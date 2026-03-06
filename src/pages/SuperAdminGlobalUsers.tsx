import { useState, useEffect } from 'react';
import { Search, Shield, UserPlus, Database, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import './GenericSubPage.css';

// A strict, non-persisting client purely for signing up users without destroying the Super Admin's session.
const adminAuthSupabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    }
);

type ProfileRow = {
    id: string;
    email: string;
    name: string;
    role: string;
    tenant_id: string | null;
    region: string | null;
    is_active: boolean; // Add is_active
    created_at: string;
};

type TenantMinimal = {
    id: string;
    name: string;
};

export function SuperAdminGlobalUsers() {
    const [users, setUsers] = useState<ProfileRow[]>([]);
    const [tenants, setTenants] = useState<TenantMinimal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create User Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('family');
    const [newTenant, setNewTenant] = useState('');
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);

    // Edit User State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState('');
    const [editTenant, setEditTenant] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch non-deleted users
            const { data: usersData, error: usersErr } = await supabase
                .from('profiles')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            if (usersErr) throw usersErr;
            setUsers(usersData || []);

            // Fetch tenants for dropdowns
            const { data: tenantsData, error: tenantsErr } = await supabase
                .from('tenants')
                .select('id, name')
                .order('name');
            if (tenantsErr) throw tenantsErr;
            setTenants(tenantsData || []);
        } catch (err) {
            console.error('Failed to fetch global directory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError('');
        setCreating(true);

        try {
            // 1. Create the Auth user using the alt client
            const { data: authData, error: authErr } = await adminAuthSupabase.auth.signUp({
                email: newEmail,
                password: newPassword,
                options: {
                    data: { name: newName, role: newRole }
                }
            });

            if (authErr) throw authErr;
            if (!authData.user) throw new Error("Failed to create user.");

            // 2. The DB Trigger automatically creates the `profiles` row.
            // Wait a brief moment for the DB trigger to fire before updating.
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 3. Update the `profiles` row with the explicit tenant_id and role 
            // via the MAIN client (which has Super Admin RLS bypass).
            const { error: updateErr } = await supabase
                .from('profiles')
                .update({ role: newRole, tenant_id: newTenant || null })
                .eq('id', authData.user.id);

            if (updateErr) throw updateErr;

            // Success! Refresh & close
            await fetchData();
            setIsCreateOpen(false);
            setNewEmail('');
            setNewPassword('');
            setNewName('');
            setNewRole('family');
            setNewTenant('');
        } catch (err: any) {
            console.error('Sign up error:', err);
            setCreateError(err.message || 'Failed to create user.');
        } finally {
            setCreating(false);
        }
    };

    const handleSaveEdit = async (userId: string) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    role: editRole,
                    tenant_id: editTenant || null
                })
                .eq('id', userId);

            if (error) throw error;

            // Refresh local state without full reload
            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, role: editRole, tenant_id: editTenant || null }
                    : u
            ));
            setEditingUserId(null);
        } catch (err) {
            console.error('Failed to update user:', err);
            alert('Failed to update user profile.');
        }
    };

    const handleToggleActive = async (userId: string, currentStatus: boolean) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
        } catch (err) {
            console.error('Failed to toggle active status:', err);
            alert('Failed to update user status.');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;

        try {
            // Soft delete user via profiles
            const { error } = await supabase
                .from('profiles')
                .update({ deleted_at: new Date().toISOString(), is_active: false })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user profile.');
        }
    };

    const startEdit = (user: ProfileRow) => {
        setEditingUserId(user.id);
        setEditRole(user.role);
        setEditTenant(user.tenant_id || '');
    };

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
    );

    const getTenantName = (tid: string | null) => {
        if (!tid) return '—';
        return tenants.find(t => t.id === tid)?.name || 'Unknown';
    };

    return (
        <div className="generic-sub-page">
            <div className="gsp-header">
                <div>
                    <h2>Global Users Directory</h2>
                    <p>Omniscient view of every registered user across all tenants on the platform.</p>
                </div>
                <div className="gsp-actions">
                    <button className="gsp-btn-secondary" onClick={fetchData}>
                        Refresh
                    </button>
                    <button className="gsp-btn-primary" onClick={() => setIsCreateOpen(true)}>
                        <UserPlus size={18} /> Add User
                    </button>
                </div>
            </div>

            <div className="gsp-content">
                <div className="gsp-toolbar">
                    <div className="gsp-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="gsp-table-container">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading directory...</div>
                    ) : (
                        <table className="gsp-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Contact</th>
                                    <th>Role Capability</th>
                                    <th>Assigned Tenant</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => {
                                    const isEditing = editingUserId === u.id;
                                    return (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '14px' }}>
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    {u.name}
                                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {u.id.slice(0, 8)}...</div>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748b' }}>{u.email}</td>
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        value={editRole}
                                                        onChange={(e) => setEditRole(e.target.value)}
                                                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                    >
                                                        <option value="super-admin">Super Admin</option>
                                                        <option value="tenant-admin">Tenant Admin</option>
                                                        <option value="supervisor">Supervisor</option>
                                                        <option value="field-executive">Field Executive</option>
                                                        <option value="vendor">Vendor</option>
                                                        <option value="family">Family (Client)</option>
                                                    </select>
                                                ) : (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        backgroundColor: u.role === 'super-admin' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(56, 187, 248, 0.1)',
                                                        color: u.role === 'super-admin' ? '#a855f7' : '#0ea5e9',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <Shield size={12} /> {u.role}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <select
                                                        value={editTenant}
                                                        onChange={(e) => setEditTenant(e.target.value)}
                                                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                    >
                                                        <option value="">-- No Tenant (Global) --</option>
                                                        {tenants.map(t => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.85rem' }}>
                                                        <Database size={14} /> {getTenantName(u.tenant_id)}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleSaveEdit(u.id)}
                                                            className="gsp-btn-outline"
                                                            style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#10b981', borderColor: '#10b981' }}>
                                                            <Check size={14} style={{ marginRight: '4px' }} /> Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingUserId(null)}
                                                            className="gsp-btn-outline"
                                                            style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#64748b', borderColor: '#cbd5e1' }}>
                                                            <X size={14} style={{ marginRight: '4px' }} /> Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => startEdit(u)}
                                                            style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#475569' }}>
                                                            <Edit2 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleActive(u.id, u.is_active ?? true)}
                                                            style={{ padding: '4px 8px', background: 'transparent', border: `1px solid ${u.is_active !== false ? '#f59e0b' : '#10b981'}`, borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: u.is_active !== false ? '#f59e0b' : '#10b981' }}>
                                                            {u.is_active !== false ? 'Suspend' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            style={{ padding: '4px 8px', background: 'transparent', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {
                isCreateOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content" style={{ maxWidth: '450px' }}>
                            <div className="modal-header">
                                <h3>Create New User</h3>
                                <button className="icon-btn" onClick={() => setIsCreateOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateUser} className="modal-body">
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                    This will provision a new user in the Supabase Auth system and instantly assign their capabilities.
                                </p>

                                {createError && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>{createError}</div>}

                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@example.com" />
                                </div>

                                <div className="form-group">
                                    <label>Temporary Password</label>
                                    <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                                </div>

                                <div className="form-group">
                                    <label>Platform Role</label>
                                    <select value={newRole} onChange={e => setNewRole(e.target.value)} required>
                                        <option value="family">Family (Client)</option>
                                        <option value="field-executive">Field Executive</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="tenant-admin">Tenant Admin</option>
                                        <option value="super-admin">Super Admin</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Assigned Tenant</label>
                                    <select value={newTenant} onChange={e => setNewTenant(e.target.value)}>
                                        <option value="">-- No Tenant (Global Access) --</option>
                                        {tenants.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                                        Required for Tenant Admins, Supervisors, and Field Executives to see their data.
                                    </span>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="action-btn secondary" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="action-btn primary" disabled={creating}>
                                        {creating ? 'Provisioning...' : 'Provision User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
}
