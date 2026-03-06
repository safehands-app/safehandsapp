import { useState, useEffect } from 'react';
import { getHomes } from '../services/homeService';
import { getWellbeingChecks } from '../services/wellbeingService';
import type { Home, WellbeingCheck } from '../lib/database.types';
import './FamilyWellbeing.css';

type WellbeingWithDetails = WellbeingCheck & {
    home: { id: string; address: string; city: string } | null;
    executive: { id: string; name: string } | null;
};

export function FamilyWellbeing() {
    const [homes, setHomes] = useState<Home[]>([]);
    const [checks, setChecks] = useState<WellbeingWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAll();
    }, []);

    async function loadAll() {
        try {
            setLoading(true);
            const homeData = await getHomes();
            const elderlyHomes = (homeData as Home[]).filter(h => h.elderly_present);
            setHomes(elderlyHomes);

            // Load checks for all elderly homes
            const allChecks: WellbeingWithDetails[] = [];
            for (const h of elderlyHomes) {
                const data = await getWellbeingChecks({ homeId: h.id });
                allChecks.push(...data);
            }
            allChecks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setChecks(allChecks);
        } catch (e: any) { setError(e.message); }
        finally { setLoading(false); }
    }

    const latestByHome = homes.map(h => ({
        home: h,
        latest: checks.find(c => c.home_id === h.id) ?? null,
    }));

    const statusConfig = {
        ok: { icon: '✅', label: 'All Good', cls: 'status--ok' },
        'attention-required': { icon: '⚠️', label: 'Attention Required', cls: 'status--warn' },
        emergency: { icon: '🚨', label: 'Emergency', cls: 'status--emergency' },
    };

    if (loading) return <div className="loading-state">Loading wellbeing data…</div>;

    return (
        <div className="family-wellbeing">
            <div className="family-wellbeing__header">
                <h1>Wellbeing Monitoring</h1>
                <p>Health and safety check-ins for elderly family members at your properties</p>
            </div>

            {error && <div className="alert-error">{error}<button onClick={() => setError(null)}>✕</button></div>}

            {homes.length === 0 ? (
                <div className="empty-state">
                    <span>💙</span>
                    <p>No elderly care monitoring is currently active for your homes.</p>
                    <small>If you have elderly family members at home, ask your service coordinator to enable monitoring.</small>
                </div>
            ) : (
                <>
                    {/* Status Overview Cards */}
                    <div className="wellbeing-overview">
                        {latestByHome.map(({ home, latest }) => {
                            const cfg = latest ? statusConfig[latest.status] : null;
                            return (
                                <div key={home.id} className={`wellbeing-card card ${cfg ? cfg.cls : 'status--unknown'}`}>
                                    <div className="wellbeing-card__icon">{cfg?.icon ?? '❓'}</div>
                                    <div className="wellbeing-card__info">
                                        <h3>{home.address}</h3>
                                        <p className="wellbeing-card__city">{home.city}</p>
                                        <span className="wellbeing-card__status">{cfg?.label ?? 'No Data'}</span>
                                        {latest && (
                                            <p className="wellbeing-card__date">
                                                Last checked: {new Date(latest.created_at).toLocaleDateString()} by {latest.executive?.name ?? 'Staff'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Full history */}
                    <div className="wellbeing-history">
                        <h2>Check-in History</h2>
                        {checks.length === 0 ? (
                            <div className="empty-state small"><p>No check-ins recorded yet.</p></div>
                        ) : (
                            <div className="history-list">
                                {checks.map(c => {
                                    const cfg = statusConfig[c.status];
                                    return (
                                        <div key={c.id} className="history-item card">
                                            <div className="history-item__icon">{cfg.icon}</div>
                                            <div className="history-item__info">
                                                <p className="history-item__address">{c.home?.address}, {c.home?.city}</p>
                                                <p className="history-item__sub">
                                                    {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {' · Checked by '}{c.executive?.name ?? 'Staff'}
                                                </p>
                                                {c.notes && <p className="history-item__notes">"{c.notes}"</p>}
                                            </div>
                                            <span className={`badge-wb ${cfg.cls}`}>{cfg.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
