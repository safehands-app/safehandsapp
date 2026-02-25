import { Truck, CheckCircle, Package, Settings, AlertCircle, TrendingUp } from 'lucide-react';
import vendorData from '../data/vendorData.json';
import './VendorDashboard.css';

export function VendorDashboard() {
    const { metrics, serviceQueue, assets } = vendorData;

    return (
        <div className="vendor-dashboard">
            <header className="vendor-header">
                <div>
                    <h2>Welcome back, Acme Medical</h2>
                    <p>Here is your daily operational overview.</p>
                </div>
                <div className="vendor-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </header>

            {/* Metrics Grid */}
            <div className="vendor-metrics-grid">
                <div className="vendor-metric-card">
                    <div className="vendor-metric-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Truck size={24} />
                    </div>
                    <div className="vendor-metric-content">
                        <h3>Open Tickets</h3>
                        <div className="metric-value">{metrics.openTickets}</div>
                    </div>
                </div>

                <div className="vendor-metric-card">
                    <div className="vendor-metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Package size={24} />
                    </div>
                    <div className="vendor-metric-content">
                        <h3>Assets Deployed</h3>
                        <div className="metric-value">{metrics.assetsDeployed}</div>
                    </div>
                </div>

                <div className="vendor-metric-card">
                    <div className="vendor-metric-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <AlertCircle size={24} />
                    </div>
                    <div className="vendor-metric-content">
                        <h3>Assets Offline</h3>
                        <div className="metric-value">{metrics.assetsOffline}</div>
                    </div>
                </div>

                <div className="vendor-metric-card">
                    <div className="vendor-metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="vendor-metric-content">
                        <h3>Pending Invoices</h3>
                        <div className="metric-value">{metrics.pendingInvoices}</div>
                    </div>
                </div>
            </div>

            <div className="vendor-content-grid">
                {/* Active Service Queue */}
                <div className="vendor-panel">
                    <div className="vendor-panel-header">
                        <h3>Priority Service Queue</h3>
                        <button className="text-btn">View All</button>
                    </div>
                    <div className="vendor-list">
                        {serviceQueue.map(ticket => (
                            <div key={ticket.id} className="vendor-list-item">
                                <div className="vendor-item-status">
                                    <div className={`status-indicator ${ticket.status.toLowerCase()}`}></div>
                                </div>
                                <div className="vendor-item-main">
                                    <div className="vendor-item-title">{ticket.item}</div>
                                    <div className="vendor-item-sub">{ticket.id} • {ticket.type}</div>
                                </div>
                                <div className="vendor-item-meta">
                                    <div className="vendor-item-loc">{ticket.location}</div>
                                    <div className="vendor-item-time">{ticket.created}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Critical Assets */}
                <div className="vendor-panel">
                    <div className="vendor-panel-header">
                        <h3>Equipment Alerts</h3>
                        <button className="text-btn">View Inventory</button>
                    </div>
                    <div className="vendor-list">
                        {assets.map(asset => (
                            <div key={asset.id} className="vendor-list-item">
                                <div className="vendor-item-icon">
                                    {asset.status === 'OFFLINE' ? <AlertCircle size={18} color="#ef4444" /> :
                                        asset.status === 'MAINTENANCE DUE' ? <Settings size={18} color="#f59e0b" /> :
                                            <CheckCircle size={18} color="#10b981" />}
                                </div>
                                <div className="vendor-item-main">
                                    <div className="vendor-item-title">{asset.name}</div>
                                    <div className="vendor-item-sub">{asset.id} • {asset.assignedTo}</div>
                                </div>
                                <div className="vendor-item-right">
                                    <span className={`vendor-badge ${asset.status.replace(' ', '-').toLowerCase()}`}>
                                        {asset.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
