import { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, MapPin, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFieldExecutives } from '../services/execService';
import './SupervisorExecManagement.css';

export function SupervisorExecManagement() {
    const { user } = useAuth();
    const [executives, setExecutives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (user?.region) {
            setLoading(true);
            getFieldExecutives(user.region)
                .then(data => setExecutives(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user?.region]);

    const regions = ['ALL', ...Array.from(new Set(executives.map(fe => fe.region)))];

    const filtered = executives.filter(fe => {
        const name = fe.profile?.name || '';
        const matchSearch = name.toLowerCase().includes(search.toLowerCase());
        const matchRegion = regionFilter === 'ALL' || fe.region === regionFilter;
        const matchStatus = statusFilter === 'ALL' || fe.status === statusFilter;
        return matchSearch && matchRegion && matchStatus;
    });

    const totalFE = executives.length;
    const onJob = executives.filter(fe => fe.status === 'On-Job').length;
    const free = totalFE - onJob;

    return (
        <div className="supervisor-exec">
            {/* Summary Strip */}
            <div className="supervisor-exec__summary">
                <div className="supervisor-exec__summary-card">
                    <span className="supervisor-exec__summary-label">Total Executives</span>
                    <span className="supervisor-exec__summary-value">{totalFE}</span>
                </div>
                <div className="supervisor-exec__summary-card">
                    <span className="supervisor-exec__summary-label" style={{ color: '#22c55e' }}>Available</span>
                    <span className="supervisor-exec__summary-value" style={{ color: '#22c55e' }}>{free}</span>
                </div>
                <div className="supervisor-exec__summary-card">
                    <span className="supervisor-exec__summary-label" style={{ color: '#8b5cf6' }}>On-Job</span>
                    <span className="supervisor-exec__summary-value" style={{ color: '#8b5cf6' }}>{onJob}</span>
                </div>
                <div className="supervisor-exec__summary-card">
                    <span className="supervisor-exec__summary-label" style={{ color: '#f59e0b' }}>Avg Rating</span>
                    <span className="supervisor-exec__summary-value" style={{ color: '#f59e0b' }}>
                        {totalFE > 0 ? (executives.reduce((a, f) => a + (f.rating || 0), 0) / totalFE).toFixed(1) : '0.0'}
                    </span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="supervisor-exec__toolbar">
                <div className="supervisor-exec__search">
                    <Search size={16} />
                    <input
                        placeholder="Search field executives..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="supervisor-exec__filters">
                    <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                        {regions.map(r => <option key={r}>{r}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="ALL">All Status</option>
                        <option value="Free">Free</option>
                        <option value="On-Job">On-Job</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading field executives...</div>
            ) : (
                <div className="supervisor-exec__grid">
                    {filtered.map(fe => (
                        <div key={fe.profile_id} className="supervisor-exec-card">
                            <div className="supervisor-exec-card__top">
                                <div className="supervisor-exec-card__avatar">
                                    {fe.profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'FE'}
                                </div>
                                <span className={`supervisor-exec-card__status ${fe.status === 'Free' ? 'free' : 'on-job'}`}>
                                    {fe.status === 'Free' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                    {fe.status}
                                </span>
                            </div>
                            <h4 className="supervisor-exec-card__name">{fe.profile?.name || 'Unknown Executive'}</h4>
                            <div className="supervisor-exec-card__region">
                                <MapPin size={12} /> {fe.region}
                            </div>
                            <div className="supervisor-exec-card__stats">
                                <div className="supervisor-exec-card__stat">
                                    <span className="supervisor-exec-card__stat-value">{fe.jobs_completed}</span>
                                    <span className="supervisor-exec-card__stat-label">Jobs Done</span>
                                </div>
                                <div className="supervisor-exec-card__stat">
                                    <span className="supervisor-exec-card__stat-value">
                                        <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b', verticalAlign: 'middle' }} /> {fe.rating}
                                    </span>
                                    <span className="supervisor-exec-card__stat-label">Rating</span>
                                </div>
                            </div>
                            {fe.current_job_id && (
                                <div className="supervisor-exec-card__current-job">
                                    Currently on: <strong>#{fe.current_job_id.slice(0, 8)}</strong>
                                </div>
                            )}
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="supervisor-empty" style={{ gridColumn: '1 / -1' }}>No executives found matching your filters.</div>
                    )}
                </div>
            )}
        </div>
    );
}
