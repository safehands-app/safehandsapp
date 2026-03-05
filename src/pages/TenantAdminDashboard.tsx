import { useState, useEffect } from 'react';
import { Users, AlertCircle, Briefcase, MessageSquare, MoreHorizontal, MapPin, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './TenantAdminDashboard.css';

type ProfileRow = {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

export function TenantAdminDashboard() {
    const [families, setFamilies] = useState<ProfileRow[]>([]);
    const [execs, setExecs] = useState<ProfileRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenantData = async () => {
            try {
                // Fetch profiles with role 'family'
                const { data: familyData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'family')
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Fetch profiles with role 'field-executive'
                const { data: execData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'field-executive')
                    .order('created_at', { ascending: false })
                    .limit(5);

                setFamilies(familyData || []);
                setExecs(execData || []);
            } catch (err) {
                console.error("Failed to load tenant data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTenantData();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Tenant Dashboard...</div>;
    }

    return (
        <div className="ta-dashboard">
            <div className="ta-page-header">
                <h1>Tenant Operations Dashboard</h1>
                <button className="ta-btn-primary">
                    <Plus size={16} /> New Enrollment
                </button>
            </div>

            {/* 4-Column Metric Grid */}
            <section className="ta-metric-grid">
                <div className="ta-metric-card">
                    <div className="ta-metric-header">
                        <span className="ta-metric-title">Enrolled Families</span>
                        <div className="ta-icon-wrapper indigo">
                            <Users size={18} />
                        </div>
                    </div>
                    <div className="ta-metric-body">
                        <span className="ta-metric-value">{families.length}</span>
                        <span className="ta-metric-trend positive">Active</span>
                    </div>
                </div>

                <div className="ta-metric-card">
                    <div className="ta-metric-header">
                        <span className="ta-metric-title">Active Field Execs</span>
                        <div className="ta-icon-wrapper green">
                            <Briefcase size={18} />
                        </div>
                    </div>
                    <div className="ta-metric-body">
                        <span className="ta-metric-value">{execs.length}</span>
                        <span className="ta-metric-trend positive">Available</span>
                    </div>
                </div>

                <div className="ta-metric-card">
                    <div className="ta-metric-header">
                        <span className="ta-metric-title">Critical Alerts</span>
                        <div className="ta-icon-wrapper red">
                            <AlertCircle size={18} />
                        </div>
                    </div>
                    <div className="ta-metric-body">
                        <span className="ta-metric-value">0</span>
                        <span className="ta-metric-trend positive">All Clear</span>
                    </div>
                </div>
            </section>

            {/* Main Columns: Families Table (Left) & Executives (Right) */}
            <section className="ta-main-columns">

                {/* Families Data Table */}
                <div className="ta-widget">
                    <div className="ta-widget-header">
                        <h3>Recently Enrolled Families</h3>
                        <button className="ta-btn-outline">View All</button>
                    </div>

                    <div className="ta-table-container">
                        <table className="ta-data-table">
                            <thead>
                                <tr>
                                    <th>Family Name</th>
                                    <th>Email Contact</th>
                                    <th>Status</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {families.length > 0 ? families.map((family) => (
                                    <tr key={family.id}>
                                        <td><strong>{family.name}</strong><br /><span style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {family.id.slice(0, 8)}...</span></td>
                                        <td>{family.email}</td>
                                        <td>
                                            <span className="ta-badge-table green">
                                                Active
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(family.created_at).toLocaleDateString()}</td>
                                        <td className="ta-table-actions">
                                            <button className="ta-btn-outline" title="Message Family"><MessageSquare size={14} /></button>
                                            <button className="ta-btn-outline" title="More Options"><MoreHorizontal size={14} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No families enrolled yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Field Executives List */}
                <div className="ta-widget">
                    <div className="ta-widget-header">
                        <h3>Field Personnel</h3>
                        <button className="ta-btn-outline"><MapPin size={14} /> Map</button>
                    </div>

                    <div className="ta-executives-list">
                        {execs.length > 0 ? execs.map((exec) => (
                            <div key={exec.id} className="ta-executive-item">
                                <div className="ta-exec-info">
                                    <div className="ta-exec-avatar">
                                        {exec.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ta-exec-details">
                                        <span className="ta-exec-name">{exec.name}</span>
                                        <span className="ta-exec-task" style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {exec.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="ta-exec-status">
                                    <span className="dot-status on-job">
                                        Active
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No field executives assigned yet.</div>
                        )}
                    </div>
                </div>

            </section>
        </div>
    );
}
