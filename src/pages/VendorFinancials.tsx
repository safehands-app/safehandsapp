import { DollarSign, Download, Plus, FileText, CheckCircle, Clock } from 'lucide-react';
import './VendorFinancials.css';
import vendorData from '../data/vendorData.json';

export function VendorFinancials() {
    const { metrics } = vendorData;

    // Mock financial ledger
    const ledger = [
        { id: 'INV-2026-001', date: 'Feb 15, 2026', desc: 'Monthly Equipment Leasing - Oakridge', amount: 4500.00, status: 'PAID' },
        { id: 'INV-2026-002', date: 'Feb 18, 2026', desc: 'Emergency Repair Service Call - Sunrise', amount: 850.00, status: 'PAID' },
        { id: 'INV-2026-003', date: 'Feb 22, 2026', desc: 'Hardware Deployment (5x Camera Kits)', amount: 2250.00, status: 'PENDING' },
        { id: 'INV-2026-004', date: 'Feb 24, 2026', desc: 'Routine HVAC Maintenance (Q1)', amount: 1200.00, status: 'PENDING' }
    ];

    const currentBalance = ledger.filter(l => l.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="vp-subpage">
            <div className="vp-subpage-header">
                <div className="vp-subpage-title">
                    <h2>Financials & Invoicing</h2>
                    <p>Track your submitted invoices, payouts, and billing history.</p>
                </div>
                <div className="vp-subpage-actions">
                    <button className="vp-btn-secondary"><Download size={16} /> Export Statement</button>
                    <button className="vp-btn-primary"><Plus size={16} /> New Invoice</button>
                </div>
            </div>

            <div className="vf-summary-grid">
                <div className="vf-summary-card balance">
                    <div className="vf-card-icon">
                        <DollarSign size={24} />
                    </div>
                    <div className="vf-card-content">
                        <h3>Outstanding Balance</h3>
                        <div className="vf-value">${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        <p>Expected within 15 days</p>
                    </div>
                </div>

                <div className="vf-summary-card">
                    <div className="vf-card-content">
                        <h3>Pending Invoices</h3>
                        <div className="vf-value">{metrics.pendingInvoices}</div>
                        <p>Processing</p>
                    </div>
                </div>

                <div className="vf-summary-card">
                    <div className="vf-card-content">
                        <h3>Total YTD Revenue</h3>
                        <div className="vf-value">$142,500.00</div>
                        <p>Jan 1 - Present</p>
                    </div>
                </div>
            </div>

            <div className="vp-table-container">
                <div className="vf-table-header">
                    <h3>Recent Transactions</h3>
                </div>
                <table className="vp-data-table">
                    <thead>
                        <tr>
                            <th>Invoice ID</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.map((item) => (
                            <tr key={item.id}>
                                <td className="font-mono text-sm opacity-70">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="opacity-50" />
                                        {item.id}
                                    </div>
                                </td>
                                <td>{item.date}</td>
                                <td className="font-medium">{item.desc}</td>
                                <td className="font-semibold">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                <td>
                                    <span className={`vf-badge ${item.status.toLowerCase()}`}>
                                        {item.status === 'PAID' ? <CheckCircle size={10} style={{ marginRight: '4px' }} /> : <Clock size={10} style={{ marginRight: '4px' }} />}
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="vp-btn-text">Download PDF</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
