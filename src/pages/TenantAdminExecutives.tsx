import { useState, useEffect } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
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

export function TenantAdminExecutives() {
    const [execs, setExecs] = useState<ProfileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchExecutives = async () => {
        try {
            // Note: RLS automatically handles restricting to the current user's tenant_id!
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'field-executive')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setExecs(data || []);
        } catch (err) {
            console.error('Failed to fetch field executives:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExecutives();
    }, []);

    const filtered = execs.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="generic-sub-page">
            <div className="gsp-header">
                <div>
                    <h2>Field Personnel Management</h2>
                    <p>Manage nurses, guards, and service personnel assigned to your underlying tenant.</p>
                </div>
                <div className="gsp-actions">
                    <button className="gsp-btn-primary" onClick={fetchExecutives}>
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
                            placeholder="Search personnel by name or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="gsp-table-container">
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading field personnel...</div>
                    ) : (
                        <table className="gsp-table">
                            <thead>
                                <tr>
                                    <th>Personnel Name</th>
                                    <th>Contact</th>
                                    <th>Region</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(e => (
                                    <tr key={e.id}>
                                        <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '14px' }}>
                                                {e.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                {e.name}
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {e.id.slice(0, 8)}...</div>
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{e.email}</td>
                                        <td>
                                            {e.region ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.85rem' }}>
                                                    <MapPin size={14} /> {e.region}
                                                </span>
                                            ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: 'rgba(56, 187, 248, 0.1)',
                                                color: '#0ea5e9',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <Clock size={12} /> Shift Active
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                            {new Date(e.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                            No field personnel found.
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
