import { useState, useEffect } from 'react';
import { getHomes, createHome, deleteHome } from '../services/homeService';
import type { Home } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import './TenantAdminHomes.css';

export function TenantAdminHomes() {
    const { user } = useAuth();
    const [homes, setHomes] = useState<(Home & { owner: { id: string; name: string; email: string } | null })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [famProfiles, setFamProfiles] = useState<{ id: string; name: string; email: string }[]>([]);

    // Form state
    const [form, setForm] = useState({
        owner_user_id: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        notes: '',
        elderly_present: false,
    });

    useEffect(() => {
        loadHomes();
        loadFamilyProfiles();
    }, []);

    async function loadHomes() {
        try {
            setLoading(true);
            const data = await getHomes();
            setHomes(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function loadFamilyProfiles() {
        const { supabase } = await import('../lib/supabase');
        const { data } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('role', 'family');
        if (data) setFamProfiles(data);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setSubmitting(true);
            await createHome(form);
            setShowForm(false);
            setForm({ owner_user_id: '', address: '', city: '', state: '', country: 'India', notes: '', elderly_present: false });
            await loadHomes();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this home? This cannot be undone.')) return;
        try {
            await deleteHome(id);
            setHomes(prev => prev.filter(h => h.id !== id));
        } catch (e: any) {
            setError(e.message);
        }
    }

    return (
        <div className="ta-homes">
            <div className="ta-homes__header">
                <div>
                    <h1>Homes</h1>
                    <p className="ta-homes__subtitle">Manage all properties under your organisation</p>
                </div>
                <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? '✕ Cancel' : '+ Add Home'}
                </button>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}

            {showForm && (
                <form className="ta-homes__form card" onSubmit={handleSubmit}>
                    <h3>Register New Home</h3>
                    <div className="form-grid">
                        <label>
                            <span>Family Owner *</span>
                            <select required value={form.owner_user_id} onChange={e => setForm(f => ({ ...f, owner_user_id: e.target.value }))}>
                                <option value="">Select family user…</option>
                                {famProfiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span>Address *</span>
                            <input required placeholder="Street address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                        </label>
                        <label>
                            <span>City *</span>
                            <input required placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                        </label>
                        <label>
                            <span>State</span>
                            <input placeholder="State" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                        </label>
                        <label>
                            <span>Country</span>
                            <input placeholder="Country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
                        </label>
                        <label className="full-width">
                            <span>Notes</span>
                            <textarea placeholder="Any additional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={form.elderly_present} onChange={e => setForm(f => ({ ...f, elderly_present: e.target.checked }))} />
                            <span>Elderly person present in home</span>
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Home'}</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="loading-state">Loading homes…</div>
            ) : homes.length === 0 ? (
                <div className="empty-state">
                    <span>🏠</span>
                    <p>No homes registered yet. Add your first property.</p>
                </div>
            ) : (
                <div className="ta-homes__grid">
                    {homes.map(home => (
                        <div key={home.id} className="home-card card">
                            <div className="home-card__header">
                                <div className="home-card__icon">{home.elderly_present ? '👴' : '🏠'}</div>
                                <div>
                                    <h3>{home.address}</h3>
                                    <p>{home.city}{home.state ? `, ${home.state}` : ''} · {home.country}</p>
                                </div>
                            </div>
                            <div className="home-card__meta">
                                <span className="tag">Owner: {home.owner?.name ?? 'Unassigned'}</span>
                                {home.elderly_present && <span className="tag tag--warning">Elderly Present</span>}
                            </div>
                            {home.notes && <p className="home-card__notes">{home.notes}</p>}
                            <div className="home-card__footer">
                                <span className="date">Added {new Date(home.created_at).toLocaleDateString()}</span>
                                {user?.role === 'tenant-admin' && (
                                    <button className="btn-danger-sm" onClick={() => handleDelete(home.id)}>Remove</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
