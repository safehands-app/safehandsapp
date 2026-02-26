import { Search, Filter, Anchor, Package, Shield, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import vendorData from '../data/vendorData.json';
import './VendorAssets.css';

export function VendorAssets() {
    const { assets } = vendorData;

    return (
        <div className="vp-subpage">
            <div className="vp-subpage-header">
                <div className="vp-subpage-title">
                    <h2>Asset Tracking & Inventory</h2>
                    <p>Manage deployed equipment and physical hardware across facilities.</p>
                </div>
                <div className="vp-subpage-actions">
                    <div className="vp-search-box">
                        <Search size={16} />
                        <input type="text" placeholder="Search by Asset ID or Name..." />
                    </div>
                    <button className="vp-btn-secondary"><Filter size={16} /> Filter</button>
                    <button className="vp-btn-primary"><Package size={16} /> Register Asset</button>
                </div>
            </div>

            <div className="vp-table-container">
                <table className="vp-data-table">
                    <thead>
                        <tr>
                            <th>Asset ID</th>
                            <th>Equipment Name</th>
                            <th>Category</th>
                            <th>Assigned Location</th>
                            <th>Status</th>
                            <th>Last Ping</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td className="font-mono text-sm opacity-70">{asset.id}</td>
                                <td className="font-semibold">{asset.name}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {asset.name.includes("Camera") || asset.name.includes("Sensor") ? <Shield size={14} className="opacity-50" /> : <Anchor size={14} className="opacity-50" />}
                                        Hardware
                                    </div>
                                </td>
                                <td>{asset.assignedTo}</td>
                                <td>
                                    <span className={`vp-badge ${asset.status.replace(' ', '-').toLowerCase()}`}>
                                        {asset.status === 'OFFLINE' && <AlertCircle size={10} style={{ marginRight: '4px' }} />}
                                        {asset.status === 'MAINTENANCE DUE' && <Settings size={10} style={{ marginRight: '4px' }} />}
                                        {asset.status === 'ONLINE' && <CheckCircle size={10} style={{ marginRight: '4px' }} />}
                                        {asset.status}
                                    </span>
                                </td>
                                <td className="opacity-70 text-sm">2 mins ago</td>
                                <td>
                                    <button className="vp-btn-text">View Specs</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
