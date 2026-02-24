import { Users, DollarSign, AlertCircle, Activity, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import './SuperAdminDashboard.css';
import superAdminData from '../data/superAdminData.json';

// Helper to map icon string to Lucide component
const getIcon = (type: string, size = 18) => {
    switch (type) {
        case 'users': return <Users size={size} />;
        case 'dollar': return <DollarSign size={size} />;
        case 'alert': return <AlertCircle size={size} />;
        case 'activity': return <Activity size={size} />;
        default: return <Activity size={size} />;
    }
}

export function SuperAdminDashboard() {
    const { overview, liveActivity, tenants } = superAdminData;

    return (
        <div className="sa-dashboard">
            <div className="sa-page-header">
                <h1>Global Overview</h1>
                <div className="sa-date-filter">{overview.filter}</div>
            </div>

            {/* 4-Column Metric Grid */}
            <section className="sa-metric-grid">
                {overview.metrics.map((metric) => (
                    <div key={metric.id} className="sa-metric-card">
                        <div className="sa-metric-header">
                            <span className="sa-metric-title">{metric.title}</span>
                            <div className={`sa-icon-wrapper ${metric.iconType === 'users' ? 'teal' :
                                    metric.iconType === 'dollar' ? 'green' :
                                        metric.iconType === 'alert' ? 'red' : 'blue'
                                }`}>
                                {getIcon(metric.iconType)}
                            </div>
                        </div>
                        <div className="sa-metric-body">
                            <span className="sa-metric-value">{metric.value}</span>
                            <span className={`sa-metric-trend ${metric.trendType}`}>
                                {metric.trendType === 'positive' && <ArrowUpRight size={14} />}
                                {metric.trendType === 'negative' && <ArrowDownRight size={14} />}
                                {metric.trendType !== 'neutral' && " "}
                                {metric.trendValue}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Middle Row: Map & Activity Feed */}
            <section className="sa-middle-row">

                {/* Map Placeholder */}
                <div className="sa-widget sa-map-widget">
                    <div className="sa-widget-header">
                        <h3>Global Emergency Oversight</h3>
                        <div className="sa-widget-actions">
                            <button className="sa-btn-outline active">Regions</button>
                            <button className="sa-btn-outline">Live Map</button>
                        </div>
                    </div>
                    <div className="sa-map-placeholder">
                        <div className="map-dot red" style={{ top: '30%', left: '20%' }}></div>
                        <div className="map-dot teal" style={{ top: '50%', left: '70%' }}></div>
                        <div className="map-dot amber" style={{ top: '60%', left: '40%' }}></div>
                        <span className="map-text">Interactive Map Visualization</span>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="sa-widget sa-activity-widget">
                    <div className="sa-widget-header">
                        <h3>Live Activity</h3>
                        <button className="sa-icon-btn"><MoreHorizontal size={18} /></button>
                    </div>
                    <div className="sa-activity-list">
                        {liveActivity.map((activity) => (
                            <div key={activity.id} className="sa-activity-item">
                                <div className={`sa-activity-icon ${activity.type === 'alert' ? 'red' :
                                        activity.type === 'users' ? 'teal' : 'amber'
                                    }`}>
                                    {getIcon(activity.type, 14)}
                                </div>
                                <div className="sa-activity-content">
                                    <p><strong>{activity.title}</strong> {activity.context}</p>
                                    <span>{activity.detail}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </section>

            {/* Bottom Row: Data Table */}
            <section className="sa-widget sa-table-widget">
                <div className="sa-widget-header">
                    <h3>Tenant Health Monitoring</h3>
                    <button className="sa-btn-primary">View All Tenants</button>
                </div>

                <div className="sa-table-container">
                    <table className="sa-data-table">
                        <thead>
                            <tr>
                                <th>Tenant Name</th>
                                <th>Health Status</th>
                                <th>Subscription</th>
                                <th>MRR</th>
                                <th>Users</th>
                                <th>Last Event</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((tenant) => (
                                <tr key={tenant.id}>
                                    <td><strong>{tenant.name}</strong><br /><span>ID: {tenant.id}</span></td>
                                    <td>
                                        <span className={`sa-badge-table ${tenant.health === 'Healthy' ? 'green' :
                                                tenant.health === 'Warning' ? 'amber' : 'red'
                                            }`}>
                                            {tenant.health}
                                        </span>
                                    </td>
                                    <td>{tenant.subscription}</td>
                                    <td>{tenant.mrr}</td>
                                    <td>{tenant.users.toLocaleString()}</td>
                                    <td>{tenant.lastEvent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
}
