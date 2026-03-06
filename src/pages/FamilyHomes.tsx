import { useState, useEffect } from 'react';
import { getHomes } from '../services/homeService';
import { getMaintenanceRequests, createMaintenanceRequest } from '../services/maintenanceService';
import { getVisits } from '../services/visitService';
import type { Home, MaintenanceRequestWithDetails, HomeVisitWithDetails } from '../lib/database.types';
import { useAuth } from '../context/AuthContext';
import './FamilyHomes.css';

export function FamilyHomes() {
    useAuth();
    const [homes, setHomes] = useState<Home[]>([]);
    const [selectedHome, setSelectedHome] = useState<Home | null>(null);
    const [visits, setVisits] = useState<HomeVisitWithDetails[]>([]);
    const [requests, setRequests] = useState<MaintenanceRequestWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'visits' | 'maintenance'>('visits');
    const [showReqForm, setShowReqForm] = useState(false);
    const [reqForm, setReqForm] = useState({ description: '', priority: 'normal' as const, notes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (selectedHome) {
            loadHomeData(selectedHome.id);
        }
    }, [selectedHome]);

    async function load() {
        try {
            setLoading(true);
            const data = await getHomes();
            setHomes(data as Home[]);
            if (data.length > 0) setSelectedHome(data[0] as Home);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    async function loadHomeData(homeId: string) {
        const [v, r] = await Promise.all([
            getVisits({ homeId }),
            getMaintenanceRequests({ homeId }),
        ]);
        setVisits(v);
        setRequests(r);
    }

    async function handleRequest(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedHome) return;
        try {
            setSubmitting(true);
            await createMaintenanceRequest({ home_id: selectedHome.id, ...reqForm });
            setShowReqForm(false);
            setReqForm({ description: '', priority: 'normal', notes: '' });
            const updated = await getMaintenanceRequests({ homeId: selectedHome.id });
            setRequests(updated);
        } catch (e: any) { setError(e.message); }
        finally { setSubmitting(false); }
    }

    if (loading) return <div className="loading-state">Loading your homes…</div>;

    return (
        <div className="family-homes">
            <div className="family-homes__header">
                <h1>My Homes</h1>
                <p>View visit history and manage maintenance requests for your properties</p>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}

            {homes.length === 0 ? (
                <div className="empty-state"><span>🏠</span><p>No homes registered for your account yet. Contact your service provider.</p></div>
            ) : (
                <div className="family-homes__layout">
                    {/* Sidebar: home list */}
                    <aside className="homes-sidebar card">
                        <h3>Properties</h3>
                        {homes.map(h => (
                            <button
                                key={h.id}
                                className={`home-item ${selectedHome?.id === h.id ? 'home-item--active' : ''}`}
                                onClick={() => setSelectedHome(h)}
                            >
                                <span className="home-item__icon">{h.elderly_present ? '👴' : '🏠'}</span>
                                <div>
                                    <div className="home-item__addr">{h.address}</div>
                                    <div className="home-item__city">{h.city}, {h.country}</div>
                                </div>
                            </button>
                        ))}
                    </aside>

                    {/* Main content */}
                    {selectedHome && (
                        <main className="home-detail">
                            <div className="home-detail__top">
                                <div>
                                    <h2>{selectedHome.address}</h2>
                                    <p>{selectedHome.city}{selectedHome.state ? `, ${selectedHome.state}` : ''} · {selectedHome.country}</p>
                                </div>
                                <button className="btn-primary" onClick={() => setShowReqForm(!showReqForm)}>
                                    + Request Service
                                </button>
                            </div>

                            {showReqForm && (
                                <form className="req-form card" onSubmit={handleRequest}>
                                    <h3>New Maintenance Request</h3>
                                    <label><span>Description *</span>
                                        <textarea required rows={3} value={reqForm.description} onChange={e => setReqForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue…" />
                                    </label>
                                    <label><span>Priority</span>
                                        <select value={reqForm.priority} onChange={e => setReqForm(f => ({ ...f, priority: e.target.value as any }))}>
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </label>
                                    <label><span>Notes</span>
                                        <input value={reqForm.notes} onChange={e => setReqForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional details" />
                                    </label>
                                    <div className="form-actions">
                                        <button type="button" className="btn-secondary" onClick={() => setShowReqForm(false)}>Cancel</button>
                                        <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Request'}</button>
                                    </div>
                                </form>
                            )}

                            {/* Tabs */}
                            <div className="tabs">
                                <button className={`tab ${tab === 'visits' ? 'tab--active' : ''}`} onClick={() => setTab('visits')}>
                                    Visit History ({visits.length})
                                </button>
                                <button className={`tab ${tab === 'maintenance' ? 'tab--active' : ''}`} onClick={() => setTab('maintenance')}>
                                    Maintenance ({requests.length})
                                </button>
                            </div>

                            {tab === 'visits' && (
                                visits.length === 0 ? (
                                    <div className="empty-state small"><p>No visits recorded yet.</p></div>
                                ) : (
                                    <div className="items-list">
                                        {visits.map(v => (
                                            <div key={v.id} className="list-item card">
                                                <div className="list-item__left">
                                                    <span className={`status-dot status-dot--${v.status}`}></span>
                                                    <div>
                                                        <p className="list-item__title">Visit by {v.executive?.name ?? 'Staff'}</p>
                                                        <p className="list-item__sub">{new Date(v.visit_date).toLocaleDateString()} · {v.notes ?? 'No notes'}</p>
                                                    </div>
                                                </div>
                                                <span className={`badge badge--${v.status}`}>{v.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                            {tab === 'maintenance' && (
                                requests.length === 0 ? (
                                    <div className="empty-state small"><p>No maintenance requests yet.</p></div>
                                ) : (
                                    <div className="items-list">
                                        {requests.map(r => (
                                            <div key={r.id} className="list-item card">
                                                <div className="list-item__left">
                                                    <span className={`status-dot status-dot--${r.status}`}></span>
                                                    <div>
                                                        <p className="list-item__title">{r.description}</p>
                                                        <p className="list-item__sub">
                                                            Priority: {r.priority} · {r.vendor ? `Assigned to ${r.vendor.name}` : 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`badge badge--${r.status}`}>{r.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </main>
                    )}
                </div>
            )}
        </div>
    );
}
