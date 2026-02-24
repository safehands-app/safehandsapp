import { Users, AlertCircle, Briefcase, CheckCircle, MoreHorizontal, MessageSquare, MapPin, Plus } from 'lucide-react';
import './TenantAdminDashboard.css';
import tenantData from '../data/tenantAdminData.json';

const getIcon = (type: string, size = 18) => {
    switch (type) {
        case 'users': return <Users size={size} />;
        case 'briefcase': return <Briefcase size={size} />;
        case 'alert': return <AlertCircle size={size} />;
        case 'check': return <CheckCircle size={size} />;
        default: return <Briefcase size={size} />;
    }
}

export function TenantAdminDashboard() {
    const { overview, families, fieldExecutives } = tenantData;

    return (
        <div className="ta-dashboard">
            <div className="ta-page-header">
                <h1>{overview.tenantName} Dashboard</h1>
                <button className="ta-btn-primary">
                    <Plus size={16} /> New Enrollment
                </button>
            </div>

            {/* 4-Column Metric Grid */}
            <section className="ta-metric-grid">
                {overview.metrics.map((metric) => (
                    <div key={metric.id} className="ta-metric-card">
                        <div className="ta-metric-header">
                            <span className="ta-metric-title">{metric.title}</span>
                            <div className={`ta-icon-wrapper ${metric.iconType === 'users' ? 'indigo' :
                                    metric.iconType === 'alert' ? 'red' :
                                        metric.iconType === 'check' ? 'green' : 'amber'
                                }`}>
                                {getIcon(metric.iconType)}
                            </div>
                        </div>
                        <div className="ta-metric-body">
                            <span className="ta-metric-value">{metric.value}</span>
                            <span className={`ta-metric-trend ${metric.trendType}`}>
                                {metric.trendValue}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Main Columns: Families Table (Left) & Executives (Right) */}
            <section className="ta-main-columns">

                {/* Families Data Table */}
                <div className="ta-widget">
                    <div className="ta-widget-header">
                        <h3>Enrolled Families</h3>
                        <button className="ta-btn-outline">View All</button>
                    </div>

                    <div className="ta-table-container">
                        <table className="ta-data-table">
                            <thead>
                                <tr>
                                    <th>Family Name</th>
                                    <th>Contact</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Last Visit</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {families.map((family) => (
                                    <tr key={family.id}>
                                        <td><strong>{family.familyName}</strong><br /><span>ID: {family.id}</span></td>
                                        <td>{family.primaryContact}<br /><span>{family.phone}</span></td>
                                        <td>
                                            <span className={`ta-badge-table ${family.status === 'Active' ? 'green' :
                                                    family.status === 'Attention' ? 'amber' : 'gray'
                                                }`}>
                                                {family.status}
                                            </span>
                                        </td>
                                        <td>{family.subscription}</td>
                                        <td>{family.lastVisit}</td>
                                        <td className="ta-table-actions">
                                            <button className="ta-btn-outline" title="Message Family"><MessageSquare size={14} /></button>
                                            <button className="ta-btn-outline" title="More Options"><MoreHorizontal size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
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
                        {fieldExecutives.map((exec) => (
                            <div key={exec.id} className="ta-executive-item">
                                <div className="ta-exec-info">
                                    <div className="ta-exec-avatar">
                                        {exec.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="ta-exec-details">
                                        <span className="ta-exec-name">{exec.name}</span>
                                        <span className="ta-exec-task">
                                            {exec.currentFamily !== '-' ? `At: ${exec.currentFamily}` : 'No active assignment'}
                                        </span>
                                    </div>
                                </div>
                                <div className="ta-exec-status">
                                    <span className={`dot-status ${exec.status.toLowerCase().replace(' ', '-')}`}>
                                        {exec.status}
                                    </span>
                                    {exec.eta !== '-' && <span className="ta-exec-eta">ETA: {exec.eta}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </section>
        </div>
    );
}
