import { useState } from 'react';
import jobData from '../data/jobOrderData.json';
import { CheckCircle2, Clock, Wrench, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import './FamilyJobTracker.css';

const STATUS_STEPS = ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'COMPLETED'];

const statusLabels: Record<string, string> = {
    REQUESTED: 'Requested',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    DONE: 'Done (Awaiting Sign-off)',
    COMPLETED: 'Completed',
};

const statusColors: Record<string, string> = {
    REQUESTED: '#f59e0b',
    ASSIGNED: '#3b82f6',
    IN_PROGRESS: '#8b5cf6',
    DONE: '#f97316',
    COMPLETED: '#22c55e',
};

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function JobStatusStepper({ status }: { status: string }) {
    const currentStep = STATUS_STEPS.indexOf(status);
    return (
        <div className="family-job-stepper">
            {STATUS_STEPS.map((step, idx) => {
                const passed = idx < currentStep;
                const active = idx === currentStep;
                return (
                    <div key={step} className="family-job-stepper__item">
                        <div className={`family-job-stepper__dot ${passed ? 'passed' : ''} ${active ? 'active' : ''}`}
                            style={active ? { borderColor: statusColors[status], background: `${statusColors[status]}22`, color: statusColors[status] } : {}}>
                            {passed ? <CheckCircle2 size={14} style={{ color: '#22c55e' }} /> : <span>{idx + 1}</span>}
                        </div>
                        <span className={`family-job-stepper__label ${active ? 'active' : ''} ${passed ? 'passed' : ''}`}>
                            {statusLabels[step]}
                        </span>
                        {idx < STATUS_STEPS.length - 1 && (
                            <div className={`family-job-stepper__line ${passed ? 'passed' : ''}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export function FamilyJobTracker() {
    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [filter, setFilter] = useState<'active' | 'all'>('active');

    const allJobs = jobData.jobs;
    const displayedJobs = filter === 'active'
        ? allJobs.filter(j => j.status !== 'COMPLETED')
        : allJobs;

    const activeCount = allJobs.filter(j => j.status !== 'COMPLETED').length;
    const completedCount = allJobs.filter(j => j.status === 'COMPLETED').length;

    return (
        <div className="family-job-tracker">
            <div className="family-job-tracker__header">
                <div>
                    <h2>My Service Requests</h2>
                    <p>{activeCount} active · {completedCount} completed</p>
                </div>
                <div className="family-job-tracker__tabs">
                    <button
                        className={`family-job-tracker__tab ${filter === 'active' ? 'active' : ''}`}
                        onClick={() => setFilter('active')}
                    >
                        Active ({activeCount})
                    </button>
                    <button
                        className={`family-job-tracker__tab ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Jobs
                    </button>
                </div>
            </div>

            {displayedJobs.length === 0 && (
                <div className="family-job-tracker__empty">
                    <CheckCircle2 size={40} />
                    <h3>All done!</h3>
                    <p>No active service requests. Request a new service using the + button.</p>
                </div>
            )}

            <div className="family-job-tracker__list">
                {displayedJobs.map(job => {
                    const isExpanded = expandedJob === job.id;
                    return (
                        <div key={job.id} className={`family-job-card ${isExpanded ? 'expanded' : ''}`}>
                            {/* Card Header */}
                            <div className="family-job-card__header" onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                                <div className="family-job-card__left">
                                    <div className="family-job-card__icon" style={{ background: `${statusColors[job.status]}18`, color: statusColors[job.status] }}>
                                        <Wrench size={18} />
                                    </div>
                                    <div>
                                        <h4 className="family-job-card__type">{job.type}</h4>
                                        <p className="family-job-card__meta">Requested {formatDate(job.requestedAt)}</p>
                                    </div>
                                </div>
                                <div className="family-job-card__right">
                                    <span className="family-job-card__status" style={{ background: `${statusColors[job.status]}18`, color: statusColors[job.status] }}>
                                        {statusLabels[job.status]}
                                    </span>
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="family-job-card__body">
                                    <JobStatusStepper status={job.status} />
                                    <div className="family-job-card__details">
                                        <div className="family-job-card__detail-row">
                                            <MapPin size={14} />
                                            <span>{job.familyAddress}</span>
                                        </div>
                                        {job.assignedExecName && (
                                            <div className="family-job-card__detail-row">
                                                <User size={14} />
                                                <span>Assigned to <strong>{job.assignedExecName}</strong></span>
                                            </div>
                                        )}
                                        {job.scheduledAt && (
                                            <div className="family-job-card__detail-row">
                                                <Clock size={14} />
                                                <span>Scheduled: {formatDate(job.scheduledAt)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="family-job-card__description">
                                        <span>Description</span>
                                        <p>{job.description}</p>
                                    </div>

                                    {/* Before/After Photos */}
                                    {(job.beforePhotos.length > 0 || job.afterPhotos.length > 0) && (
                                        <div className="family-job-card__photos">
                                            {job.beforePhotos.length > 0 && (
                                                <div className="family-job-card__photo-section">
                                                    <span>Before Photos</span>
                                                    <div className="family-job-card__photo-row">
                                                        {(job.beforePhotos as { id: string, url: string, caption: string }[]).map(p => (
                                                            <img key={p.id} src={p.url} alt={p.caption} title={p.caption} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {job.afterPhotos.length > 0 && (
                                                <div className="family-job-card__photo-section">
                                                    <span>After Photos</span>
                                                    <div className="family-job-card__photo-row">
                                                        {(job.afterPhotos as { id: string, url: string, caption: string }[]).map(p => (
                                                            <img key={p.id} src={p.url} alt={p.caption} title={p.caption} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {job.status === 'COMPLETED' && (
                                        <div className="family-job-card__completed-banner">
                                            <CheckCircle2 size={16} />
                                            <span>Job completed on {formatDate(job.completedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
