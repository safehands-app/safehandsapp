import { useState, useEffect } from 'react';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../services/vendorService';
import type { Vendor } from '../lib/database.types';
import './TenantAdminVendors.css';

const SERVICE_TYPES = ['Electrician', 'Plumber', 'Cleaner', 'Carpenter', 'HVAC / AC', 'Pest Control', 'Security', 'Gardener', 'Other'];

export function TenantAdminVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({ name: '', service_type: '', phone: '', email: '' });

    useEffect(() => { load(); }, []);

    async function load() {
        try {
            setLoading(true);
            setVendors(await getVendors());
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setSubmitting(true);
            await createVendor(form);
            setShowForm(false);
            setForm({ name: '', service_type: '', phone: '', email: '' });
            await load();
        } catch (e: any) { setError(e.message); }
        finally { setSubmitting(false); }
    }

    async function handleToggleStatus(v: Vendor) {
        try {
            const updated = await updateVendor(v.id, { status: v.status === 'active' ? 'inactive' : 'active' });
            setVendors(prev => prev.map(x => x.id === v.id ? updated : x));
        } catch (e: any) { setError(e.message); }
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this vendor?')) return;
        try {
            await deleteVendor(id);
            setVendors(prev => prev.filter(v => v.id !== id));
        } catch (e: any) { setError(e.message); }
    }

    return (
        <div className="ta-vendors">
            <div className="ta-vendors__header">
                <div>
                    <h1>Vendors</h1>
                    <p>Local service providers available to your properties</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add Vendor'}
                </button>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}

            {showForm && (
                <form className="ta-vendors__form card" onSubmit={handleSubmit}>
                    <h3>Register New Vendor</h3>
                    <div className="form-grid">
                        <label><span>Vendor Name *</span>
                            <input required placeholder="e.g. Kumar Electricals" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </label>
                        <label><span>Service Type *</span>
                            <select required value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}>
                                <option value="">Select type…</option>
                                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </label>
                        <label><span>Phone</span>
                            <input placeholder="+91 9999 000000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </label>
                        <label><span>Email</span>
                            <input type="email" placeholder="vendor@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Vendor'}</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="loading-state">Loading vendors…</div>
            ) : vendors.length === 0 ? (
                <div className="empty-state"><span>🔧</span><p>No vendors yet. Add your first service provider.</p></div>
            ) : (
                <div className="vendors-table card">
                    <table>
                        <thead>
                            <tr><th>Name</th><th>Service</th><th>Phone</th><th>Email</th><th>Rating</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {vendors.map(v => (
                                <tr key={v.id}>
                                    <td className="vendor-name">{v.name}</td>
                                    <td><span className="tag">{v.service_type}</span></td>
                                    <td>{v.phone ?? '—'}</td>
                                    <td>{v.email ?? '—'}</td>
                                    <td>{'★'.repeat(Math.round(v.rating))}{'☆'.repeat(5 - Math.round(v.rating))}</td>
                                    <td>
                                        <span className={`status-badge ${v.status === 'active' ? 'status-badge--active' : 'status-badge--inactive'}`}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn-secondary-sm" onClick={() => handleToggleStatus(v)}>
                                            {v.status === 'active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button className="btn-danger-sm" onClick={() => handleDelete(v.id)}>Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
