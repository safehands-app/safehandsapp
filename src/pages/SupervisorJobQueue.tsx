import { useState, useEffect } from 'react';
import { Search, User, MapPin, AlertTriangle, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { assignJob } from '../services/jobService';
import { getFreeExecutives } from '../services/execService';
import type { JobWithDetails } from '../lib/database.types';
import './SupervisorJobQueue.css';

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

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function SupervisorJobQueue() {
    const { user } = useAuth();
    // Fetch live jobs for the region
    const { jobs, loading } = useJobs({ region: user?.region || undefined, realtime: true });

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedJob, setSelectedJob] = useState<JobWithDetails | null>(null);
    const [assignModalJob, setAssignModalJob] = useState<JobWithDetails | null>(null);

    // Field executives state
    const [freeExecutives, setFreeExecutives] = useState<any[]>([]);
    const [selectedFE, setSelectedFE] = useState<any | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);

    // Fetch free FEs when modal opens
    useEffect(() => {
        if (assignModalJob && user?.region) {
            getFreeExecutives(user.region).then(setFreeExecutives).catch(console.error);
        }
    }, [assignModalJob, user?.region]);

    const filteredJobs = jobs.filter(j => {
        const matchSearch = j.type.toLowerCase().includes(search.toLowerCase()) ||
            (j.family?.name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || j.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleAssign = async () => {
        if (!assignModalJob || !selectedFE) return;
        setIsAssigning(true);
        try {
            await assignJob(assignModalJob.id, selectedFE.profile_id);
            setAssignModalJob(null);
            setSelectedFE(null);
        } catch (err) {
            console.error('Failed to assign job:', err);
            alert('Failed to assign job. Please try again.');
        } finally {
            setIsAssigning(false);
        }
    };

    const statusOptions = ['ALL', 'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'COMPLETED'];

    return (
        <div className="supervisor-queue">
            <div className="supervisor-queue__toolbar">
                <div className="supervisor-queue__search">
                    <Search size={16} />
                    <input
                        placeholder="Search by job type or family..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="supervisor-queue__filters">
                    {statusOptions.map(s => (
                        <button
                            key={s}
                            className={`supervisor-queue__filter-btn ${statusFilter === s ? 'active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s === 'ALL' ? 'All Jobs' : s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="supervisor-queue__table-wrap">
                <table className="supervisor-queue__table">
                    <thead>
                        <tr>
                            <th>Job</th>
                            <th>Family</th>
                            <th>Priority</th>
                            <th>Scheduled</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredJobs.map(job => (
                            <tr key={job.id} onClick={() => setSelectedJob(job)} className="supervisor-queue__row">
                                <td>
                                    <span className="supervisor-queue__job-type">{job.type}</span>
                                    <span className="supervisor-queue__job-id">#{job.id.slice(0, 8)}</span>
                                </td>
                                <td>
                                    <div className="supervisor-queue__family">
                                        <MapPin size={12} />
                                        <span>{job.family?.name || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="supervisor-queue__priority" style={{ color: priorityColors[job.priority] }}>
                                        {job.priority === 'urgent' && <AlertTriangle size={12} />}
                                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                                    </span>
                                </td>
                                <td className="supervisor-queue__date">
                                    {job.scheduled_at ? formatDate(job.scheduled_at) : '—'}
                                </td>
                                <td>
                                    {job.assigned_exec
                                        ? <span className="supervisor-queue__exec"><User size={12} />{job.assigned_exec.name}</span>
                                        : <span className="supervisor-queue__unassigned">Unassigned</span>
                                    }
                                </td>
                                <td>
                                    <span className="supervisor-queue__status-badge"
                                        style={{ background: `${statusColors[job.status]}22`, color: statusColors[job.status] }}>
                                        {job.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                    {job.status === 'REQUESTED' && (
                                        <button
                                            className="supervisor-queue__assign-btn"
                                            onClick={() => setAssignModalJob(job)}
                                        >
                                            Assign FE
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>}
                {!loading && filteredJobs.length === 0 && (
                    <div className="supervisor-empty">No jobs found matching your filters.</div>
                )}
            </div>

            {/* Job Detail Side Panel */}
            {selectedJob && (
                <div className="supervisor-job-detail-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="supervisor-job-detail-panel" onClick={e => e.stopPropagation()}>
                        <div className="supervisor-job-detail-panel__header">
                            <div>
                                <h3>{selectedJob.type}</h3>
                                <span className="supervisor-queue__status-badge"
                                    style={{ background: `${statusColors[selectedJob.status]}22`, color: statusColors[selectedJob.status] }}>
                                    {selectedJob.status.replace('_', ' ')}
                                </span>
                            </div>
                            <button onClick={() => setSelectedJob(null)}><X size={18} /></button>
                        </div>
                        <div className="supervisor-job-detail-panel__body">
                            <div className="supervisor-detail-row">
                                <span>Family</span><span>{selectedJob.family?.name || 'Unknown'}</span>
                            </div>
                            <div className="supervisor-detail-row">
                                <span>Address</span><span>{'Address unavailable'}</span>
                            </div>
                            <div className="supervisor-detail-row">
                                <span>Assigned To</span><span>{selectedJob.assigned_exec?.name || 'Unassigned'}</span>
                            </div>
                            <div className="supervisor-detail-row">
                                <span>Priority</span>
                                <span style={{ color: priorityColors[selectedJob.priority] }}>
                                    {selectedJob.priority.charAt(0).toUpperCase() + selectedJob.priority.slice(1)}
                                </span>
                            </div>
                            <div className="supervisor-detail-row">
                                <span>Requested</span><span>{formatDate(selectedJob.requested_at)}</span>
                            </div>
                            <div className="supervisor-detail-section">
                                <span>Description</span>
                                <p>{selectedJob.description}</p>
                            </div>
                            {selectedJob.notes && (
                                <div className="supervisor-detail-section">
                                    <span>Notes</span>
                                    <p>{selectedJob.notes}</p>
                                </div>
                            )}
                            {selectedJob.status === 'REQUESTED' && (
                                <button className="supervisor-assign-btn-full" onClick={() => { setSelectedJob(null); setAssignModalJob(selectedJob); }}>
                                    Assign Field Executive
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Assign FE Modal */}
            {assignModalJob && (
                <div className="supervisor-modal-overlay" onClick={() => setAssignModalJob(null)}>
                    <div className="supervisor-modal" onClick={e => e.stopPropagation()}>
                        <div className="supervisor-modal__header">
                            <h3>Assign Field Executive</h3>
                            <button onClick={() => setAssignModalJob(null)}><X size={18} /></button>
                        </div>
                        <p className="supervisor-modal__subtitle">Job: <strong>{assignModalJob.type}</strong> for {assignModalJob.family?.name}</p>
                        <div className="supervisor-modal__fe-list">
                            {freeExecutives.length > 0 ? freeExecutives.map(fe => (
                                <div
                                    key={fe.id}
                                    className={`supervisor-fe-option ${selectedFE?.id === fe.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedFE(fe)}
                                >
                                    <div className="supervisor-fe-option__avatar">{fe.profile?.name?.split(' ').map((n: string) => n[0]).join('') || 'FE'}</div>
                                    <div>
                                        <div className="supervisor-fe-option__name">{fe.profile?.name}</div>
                                        <div className="supervisor-fe-option__meta">{fe.region} · ⭐ {fe.rating} · {fe.jobs_completed} jobs done</div>
                                    </div>
                                    {selectedFE?.id === fe.id && <Check size={18} className="supervisor-fe-option__check" />}
                                </div>
                            )) : (
                                <div className="supervisor-empty">No free executives available in this region.</div>
                            )}
                        </div>
                        <div className="supervisor-modal__actions">
                            <button className="btn-secondary" onClick={() => setAssignModalJob(null)} disabled={isAssigning}>Cancel</button>
                            <button className="btn-primary" onClick={handleAssign} disabled={!selectedFE || isAssigning}>
                                {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
