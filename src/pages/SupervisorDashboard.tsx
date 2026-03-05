import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckSquare, ArrowRight, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { getFieldExecutives } from '../services/execService';
import './SupervisorDashboard.css';

const statusColors: Record<string, string> = {
    REQUESTED: '#f59e0b',
    ASSIGNED: '#3b82f6',
    IN_PROGRESS: '#8b5cf6',
    DONE: '#f97316',
    COMPLETED: '#22c55e',
};

const priorityColors: Record<string, string> = {
    urgent: '#ef4444',
    high: '#f97316',
    normal: '#64748b',
};

export function SupervisorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Fetch live jobs for this supervisor's region
    const { jobs, loading } = useJobs({ region: user?.region || undefined, realtime: true });

    // Fetch live executives for this region
    const [executives, setExecutives] = useState<any[]>([]);
    useEffect(() => {
        if (user?.region) {
            getFieldExecutives(user.region).then(setExecutives).catch(console.error);
        }
    }, [user?.region]);

    const requestedJobs = jobs.filter(j => j.status === 'REQUESTED');
    const activeJobs = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'ASSIGNED');
    const awaitingReview = jobs.filter(j => j.status === 'DONE');
    const completedJobs = jobs.filter(j => j.status === 'COMPLETED');

    const metrics = [
        { label: 'Pending Assignment', value: requestedJobs.length, icon: <ClipboardList size={22} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', action: () => navigate('/supervisor/queue') },
        { label: 'Active Jobs', value: activeJobs.length, icon: <Activity size={22} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', action: () => navigate('/supervisor/queue') },
        { label: 'Awaiting Your Review', value: awaitingReview.length, icon: <CheckSquare size={22} />, color: '#f97316', bg: 'rgba(249,115,22,0.1)', action: () => navigate('/supervisor/review') },
        { label: 'Completed Today', value: completedJobs.length, icon: <CheckCircle2 size={22} />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', action: () => navigate('/supervisor/review') },
    ];

    return (
        <div className="supervisor-dashboard">
            <div className="supervisor-dashboard__greeting">
                <h2>Good morning, {user?.name.split(' ')[0]} 👋</h2>
                <p>You have <strong>{requestedJobs.length} job{requestedJobs.length !== 1 ? 's' : ''}</strong> waiting for assignment and <strong>{awaitingReview.length}</strong> awaiting your review.</p>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading live data...</div>
            ) : (
                <>

                    {/* Metrics Grid */}
                    <div className="supervisor-metrics-grid">
                        {metrics.map((m, i) => (
                            <button key={i} className="supervisor-metric-card" onClick={m.action}>
                                <div className="supervisor-metric-card__icon" style={{ background: m.bg, color: m.color }}>
                                    {m.icon}
                                </div>
                                <div className="supervisor-metric-card__body">
                                    <span className="supervisor-metric-card__value">{m.value}</span>
                                    <span className="supervisor-metric-card__label">{m.label}</span>
                                </div>
                                <ArrowRight size={16} className="supervisor-metric-card__arrow" />
                            </button>
                        ))}
                    </div>

                    {/* Area Breakdown */}
                    <div className="supervisor-dashboard__cols">
                        {/* Pending + Active Jobs */}
                        <div className="supervisor-panel">
                            <div className="supervisor-panel__header">
                                <h3>Pending Jobs</h3>
                                <button className="supervisor-panel__link" onClick={() => navigate('/supervisor/queue')}>
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="supervisor-job-list">
                                {[...requestedJobs, ...activeJobs].slice(0, 4).map(job => (
                                    <div key={job.id} className="supervisor-job-row" onClick={() => navigate('/supervisor/queue')}>
                                        <div className="supervisor-job-row__left">
                                            <span className="supervisor-job-row__type">{job.type}</span>
                                            <span className="supervisor-job-row__family">{job.family?.name || 'Unknown Family'}</span>
                                        </div>
                                        <div className="supervisor-job-row__right">
                                            {job.priority === 'urgent' && (
                                                <AlertTriangle size={14} style={{ color: priorityColors.urgent }} />
                                            )}
                                            <span className="supervisor-job-row__status" style={{ background: `${statusColors[job.status]}22`, color: statusColors[job.status] }}>
                                                {job.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {[...requestedJobs, ...activeJobs].length === 0 && (
                                    <div className="supervisor-empty">No pending jobs 🎉</div>
                                )}
                            </div>
                        </div>

                        {/* Review Queue */}
                        <div className="supervisor-panel">
                            <div className="supervisor-panel__header">
                                <h3>Awaiting Review</h3>
                                <button className="supervisor-panel__link" onClick={() => navigate('/supervisor/review')}>
                                    View All <ArrowRight size={14} />
                                </button>
                            </div>
                            <div className="supervisor-job-list">
                                {awaitingReview.map(job => (
                                    <div key={job.id} className="supervisor-job-row supervisor-job-row--review" onClick={() => navigate('/supervisor/review')}>
                                        <div className="supervisor-job-row__left">
                                            <span className="supervisor-job-row__type">{job.type}</span>
                                            <span className="supervisor-job-row__family">{job.family?.name} · {job.assigned_exec?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="supervisor-job-row__right">
                                            <span className="supervisor-job-row__photos">
                                                📷 {(job.before_photos?.length || 0) + (job.after_photos?.length || 0)} photos
                                            </span>
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                ))}
                                {awaitingReview.length === 0 && (
                                    <div className="supervisor-empty">No jobs awaiting review ✅</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* FE Status Overview */}
                    <div className="supervisor-panel">
                        <div className="supervisor-panel__header">
                            <h3>Field Executive Status</h3>
                            <button className="supervisor-panel__link" onClick={() => navigate('/supervisor/executives')}>
                                Manage <ArrowRight size={14} />
                            </button>
                        </div>
                        <div className="supervisor-fe-grid">
                            {executives.slice(0, 4).map(fe => (
                                <div key={fe.id} className="supervisor-fe-card">
                                    <div className="supervisor-fe-card__avatar">{fe.profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'FE'}</div>
                                    <div className="supervisor-fe-card__info">
                                        <span className="supervisor-fe-card__name">{fe.profile?.name}</span>
                                        <span className="supervisor-fe-card__region">{fe.region}</span>
                                    </div>
                                    <span className={`supervisor-fe-card__status ${fe.status === 'Free' ? 'free' : 'on-job'}`}>
                                        {fe.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
