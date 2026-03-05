import { useState, useEffect } from 'react';
import { Search, Building2, Plus, Building } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './GenericSubPage.css';

type TenantRow = {
    id: string;
    name: string;
    status: string;
    subscription: string;
    mrr: string;
    created_at: string;
};

export function SuperAdminTenants() {
    const { user } = useAuth();
    const [tenants, setTenants] = useState<TenantRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Modal states for adding a new tenant
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [newSub, setNewSub] = useState('Standard');
    const [newStatus, setNewStatus] = useState('Active');
    const [newMrr, setNewMrr] = useState('₹1,50,000');
    const [saving, setSaving] = useState(false);

    const fetchTenants = async () => {
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTenants(data || []);
        } catch (err) {
            console.error('Failed to fetch tenants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleAddTenant = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('tenants')
                .insert({
                    name: newName,
                    subscription: newSub,
                    status: newStatus,
                    mrr: newMrr
                });

            if (error) throw error;

            // Refresh list and close
            await fetchTenants();
            setIsModalOpen(false);
            setNewName('');
        } catch (err) {
            console.error('Failed to create tenant:', err);
            alert('Failed to create tenant.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = tenants.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.subscription.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="generic-sub-page">
            <div className="gsp-header">
                <div>
                    <h2>Tenant Management</h2>
                    <p>Provision and monitor your B2B SaaS customers (Service Providers).</p>
                </div>
                <div className="gsp-actions">
                    <button className="gsp-btn-outline" onClick={fetchTenants}>
                        Refresh List
                    </button>
                    <button className="gsp-btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Add Tenant
                    </button>
                </div>
            </div>

            <div className="gsp-content">
                <div className="gsp-toolbar">
                    <div className="gsp-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by company name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="gsp-table-container">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading tenants from database...</div>
                    ) : (
                        <table className="gsp-table">
                            <thead>
                                <tr>
                                    <th>Tenant Name</th>
                                    <th>Status</th>
                                    <th>Subscription</th>
                                    <th>Monthly Revenue</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                                <Building2 size={16} />
                                            </div>
                                            {t.name}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor:
                                                    t.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' :
                                                        t.status === 'Warning' ? 'rgba(245, 158, 11, 0.1)' :
                                                            'rgba(239, 68, 68, 0.1)',
                                                color:
                                                    t.status === 'Active' ? '#10b981' :
                                                        t.status === 'Warning' ? '#f59e0b' :
                                                            '#ef4444'
                                            }}>
                                                {t.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ color: '#475569' }}>{t.subscription}</td>
                                        <td style={{ color: '#475569', fontWeight: 500 }}>{t.mrr || '—'}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                            {new Date(t.created_at).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button className="gsp-btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No tenants found. Click "Add Tenant" to provision your first customer.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Tenant Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: '#fff', borderRadius: '12px', width: '400px',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                            <Building size={20} color="#3b82f6" /> Provision New Tenant
                        </h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Create a new isolated SaaS workspace down to the database row level.
                        </p>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="e.g. CareTech Boston"
                                style={{ width: '92%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                Subscription Tier
                            </label>
                            <select
                                value={newSub}
                                onChange={(e) => setNewSub(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            >
                                <option value="Basic">Basic</option>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                                <option value="Custom Enterprise">Custom Enterprise</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                                Estimated MRR
                            </label>
                            <input
                                type="text"
                                value={newMrr}
                                onChange={(e) => setNewMrr(e.target.value)}
                                placeholder="₹1,50,000"
                                style={{ width: '92%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTenant}
                                disabled={saving || !newName.trim()}
                                style={{ flex: 1, padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: (!newName.trim() || saving) ? 0.5 : 1 }}
                            >
                                {saving ? 'Provisioning...' : 'Create Tenant'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
