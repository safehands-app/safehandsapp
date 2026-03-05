import { useState, useEffect } from 'react';
import { Search, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './GenericSubPage.css';

type ProfileRow = {
    id: string;
    email: string;
    name: string;
    role: string;
    region: string | null;
    created_at: string;
};

export function TenantAdminFamilies() {
    const [families, setFamilies] = useState<ProfileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchFamilies = async () => {
        try {
            // Note: RLS automatically handles restricting to the current user's tenant_id!
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'family')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFamilies(data || []);
        } catch (err) {
            console.error('Failed to fetch families:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
    }, []);

    const filtered = families.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="generic-sub-page">
            <div className="gsp-header">
                <div>
                    <h2>Enrolled Families</h2>
                    <p>Manage family accounts and subscriptions enrolled under your tenant.</p>
                </div>
                <div className="gsp-actions">
                    <button className="gsp-btn-primary" onClick={fetchFamilies}>
                        Refresh List
                    </button>
                </div>
            </div>

            <div className="gsp-content">
                <div className="gsp-toolbar">
                    <div className="gsp-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search families by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="gsp-table-container">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading families...</div>
                    ) : (
                        <table className="gsp-table">
                            <thead>
                                <tr>
                                    <th>Family Name</th>
                                    <th>Primary Contact</th>
                                    <th>Region</th>
                                    <th>Status</th>
                                    <th>Enrolled Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(f => (
                                    <tr key={f.id}>
                                        <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '14px' }}>
                                                {f.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                {f.name}
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {f.id.slice(0, 8)}...</div>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{f.email}</td>
                                        <td>
                                            {f.region ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.85rem' }}>
                                                    <MapPin size={14} /> {f.region}
                                                </span>
                                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                color: '#10b981',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                            {new Date(f.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No families found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
