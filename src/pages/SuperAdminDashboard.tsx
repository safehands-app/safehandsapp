import { useState, useEffect } from 'react';
import { Building2, Users, Activity, IndianRupee, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './SuperAdminDashboard.css';

type TenantRow = {
    id: string;
    name: string;
    status: string;
    subscription: string;
    mrr: string;
    created_at: string;
};

export function SuperAdminDashboard() {
    const [stats, setStats] = useState({ tenants: 0, mrrTotal: 0, users: 0, activeExecs: 0 });
    const [recentTenants, setRecentTenants] = useState<TenantRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch totals
                const [{ count: tenantCount }, { data: allTenants }, { count: userCount }, { count: execCount }, { data: recentTData }] = await Promise.all([
                    supabase.from('tenants').select('*', { count: 'exact', head: true }),
                    supabase.from('tenants').select('mrr'),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }),
                    supabase.from('field_executives').select('*', { count: 'exact', head: true }),
                    supabase.from('tenants').select('*').order('created_at', { ascending: false }).limit(5)
                ]);

                // Calculate total MRR roughly from strings like '₹1,50,000'
                let totalMrr = 0;
                if (allTenants) {
                    allTenants.forEach(t => {
                        if (t.mrr) {
                            const numStr = t.mrr.replace(/[^0-9]/g, '');
                            if (numStr) totalMrr += parseInt(numStr, 10);
                        }
                    });
                }

                setStats({
                    tenants: tenantCount || 0,
                    mrrTotal: totalMrr,
                    users: userCount || 0,
                    activeExecs: execCount || 0
                });

                setRecentTenants(recentTData || []);
            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Super Admin Dashboard...</div>;
    }

    return (
        <div className="sa-dashboard">
            <div className="sa-page-header">
                <h1>Platform Overview</h1>
                <div className="sa-date-filter">Live Database</div>
            </div>

            {/* Metric Grid */}
            <section className="sa-metric-grid">
                <div className="sa-metric-card">
                    <div className="sa-metric-header">
                        <span className="sa-metric-title">Active Tenants</span>
                        <div className="sa-icon-wrapper blue">
                            <Building2 size={18} />
                        </div>
                    </div>
                    <div className="sa-metric-body">
                        <span className="sa-metric-value">{stats.tenants}</span>
                    </div>
                </div>

                <div className="sa-metric-card">
                    <div className="sa-metric-header">
                        <span className="sa-metric-title">Monthly Recurring Rev</span>
                        <div className="sa-icon-wrapper green">
                            <IndianRupee size={18} />
                        </div>
                    </div>
                    <div className="sa-metric-body">
                        <span className="sa-metric-value">₹{stats.mrrTotal.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <div className="sa-metric-card">
                    <div className="sa-metric-header">
                        <span className="sa-metric-title">Field Executives</span>
                        <div className="sa-icon-wrapper green">
                            <Shield size={18} />
                        </div>
                    </div>
                    <div className="sa-metric-body">
                        <span className="sa-metric-value">{stats.activeExecs}</span>
                    </div>
                </div>

                <div className="sa-metric-card">
                    <div className="sa-metric-header">
                        <span className="sa-metric-title">System Health</span>
                        <div className="sa-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <Activity size={18} />
                        </div>
                    </div>
                    <div className="sa-metric-body">
                        <span className="sa-metric-value" style={{ color: '#10b981' }}>Online</span>
                    </div>
                </div>
            </section>

            {/* Bottom Row: Data Table */}
            <section className="sa-widget sa-table-widget" style={{ marginTop: '2rem' }}>
                <div className="sa-widget-header">
                    <h3>Recently Provisioned Tenants</h3>
                </div>

                <div className="sa-table-container">
                    <table className="sa-data-table">
                        <thead>
                            <tr>
                                <th>Tenant Name</th>
                                <th>Status</th>
                                <th>Subscription</th>
                                <th>Provisioned Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTenants.length > 0 ? (
                                recentTenants.map((tenant) => (
                                    <tr key={tenant.id}>
                                        <td><strong>{tenant.name}</strong></td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: tenant.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: tenant.status === 'Active' ? '#10b981' : '#f59e0b'
                                            }}>
                                                {tenant.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{tenant.subscription}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                            {new Date(tenant.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                        No tenants found. Add your first tenant from the Tenants page.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
