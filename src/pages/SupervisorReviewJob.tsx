import { useState } from 'react';
import { CheckCircle2, RotateCcw, X, ZoomIn } from 'lucide-react';
import jobData from '../data/jobOrderData.json';
import './SupervisorReviewJob.css';

type Job = typeof jobData.jobs[0];
type Photo = { id: string; url: string; caption: string };

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function PhotoGallery({ photos, label }: { photos: Photo[]; label: string }) {
    const [lightbox, setLightbox] = useState<Photo | null>(null);

    if (photos.length === 0) {
        return (
            <div className="supervisor-gallery">
                <h4 className="supervisor-gallery__label">{label}</h4>
                <div className="supervisor-gallery__empty">No photos uploaded</div>
            </div>
        );
    }

    return (
        <div className="supervisor-gallery">
            <h4 className="supervisor-gallery__label">{label} ({photos.length})</h4>
            <div className="supervisor-gallery__grid">
                {photos.map(p => (
                    <div key={p.id} className="supervisor-gallery__thumb" onClick={() => setLightbox(p)}>
                        <img src={p.url} alt={p.caption} />
                        <div className="supervisor-gallery__thumb-overlay">
                            <ZoomIn size={18} />
                        </div>
                        <span className="supervisor-gallery__caption">{p.caption}</span>
                    </div>
                ))}
            </div>
            {lightbox && (
                <div className="supervisor-lightbox" onClick={() => setLightbox(null)}>
                    <div className="supervisor-lightbox__content" onClick={e => e.stopPropagation()}>
                        <button className="supervisor-lightbox__close" onClick={() => setLightbox(null)}><X size={20} /></button>
                        <img src={lightbox.url} alt={lightbox.caption} />
                        <p>{lightbox.caption}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export function SupervisorReviewJob() {
    const [jobs, setJobs] = useState<Job[]>(jobData.jobs.filter(j => j.status === 'DONE' || j.status === 'COMPLETED'));
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [feedbackText, setFeedbackText] = useState('');

    const reviewJobs = jobs;

    if (reviewJobs.length === 0) {
        return (
            <div className="supervisor-review-empty">
                <CheckCircle2 size={48} />
                <h3>All caught up!</h3>
                <p>No jobs are awaiting your review right now.</p>
            </div>
        );
    }

    const selectedJob = reviewJobs[selectedIdx];

    const handleComplete = () => {
        setJobs(prev => prev.map((j, i) =>
            i === selectedIdx ? { ...j, status: 'COMPLETED' } : j
        ));
        if (selectedIdx > 0 && selectedIdx >= jobs.filter(j => j.status === 'DONE').length - 1) {
            setSelectedIdx(prev => prev - 1);
        }
        setFeedbackText('');
    };

    const handleRework = () => {
        setJobs(prev => prev.map((j, i) =>
            i === selectedIdx ? { ...j, status: 'IN_PROGRESS' } : j
        ));
        setFeedbackText('');
    };

    return (
        <div className="supervisor-review">
            <div className="supervisor-review__sidebar">
                <h3 className="supervisor-review__sidebar-title">Review Queue ({reviewJobs.length})</h3>
                <div className="supervisor-review__job-list">
                    {reviewJobs.map((job, idx) => (
                        <div
                            key={job.id}
                            className={`supervisor-review__job-item ${idx === selectedIdx ? 'active' : ''} ${job.status === 'COMPLETED' ? 'completed' : ''}`}
                            onClick={() => setSelectedIdx(idx)}
                        >
                            <div>
                                <span className="supervisor-review__job-type">{job.type}</span>
                                <span className="supervisor-review__job-family">{job.familyName}</span>
                            </div>
                            <span className={`supervisor-review__job-badge ${job.status === 'COMPLETED' ? 'done' : 'pending'}`}>
                                {job.status === 'COMPLETED' ? '✓ Done' : 'Review'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="supervisor-review__main">
                {/* Job Header */}
                <div className="supervisor-review__header">
                    <div>
                        <h2>{selectedJob.type}</h2>
                        <p>{selectedJob.familyName} · {selectedJob.familyAddress}</p>
                    </div>
                    <div className="supervisor-review__header-meta">
                        <span>FE: {selectedJob.assignedExecName}</span>
                        <span>Requested: {formatDate(selectedJob.requestedAt)}</span>
                    </div>
                </div>

                {/* Description + Notes */}
                <div className="supervisor-review__info-cards">
                    <div className="supervisor-review__info-card">
                        <h4>Job Description</h4>
                        <p>{selectedJob.description}</p>
                    </div>
                    {selectedJob.notes && (
                        <div className="supervisor-review__info-card">
                            <h4>Field Executive Notes</h4>
                            <p>{selectedJob.notes}</p>
                        </div>
                    )}
                </div>

                {/* Photo Evidence */}
                <div className="supervisor-review__photos">
                    <PhotoGallery photos={selectedJob.beforePhotos as Photo[]} label="📷 Before Photos" />
                    <PhotoGallery photos={selectedJob.afterPhotos as Photo[]} label="✅ After Photos" />
                </div>

                {/* Supervisor Feedback + Actions */}
                {selectedJob.status === 'DONE' && (
                    <div className="supervisor-review__actions">
                        <textarea
                            className="supervisor-review__feedback"
                            placeholder="Add a review note (optional)..."
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            rows={3}
                        />
                        <div className="supervisor-review__action-btns">
                            <button className="supervisor-review__rework-btn" onClick={handleRework}>
                                <RotateCcw size={16} /> Send for Rework
                            </button>
                            <button className="supervisor-review__complete-btn" onClick={handleComplete}>
                                <CheckCircle2 size={16} /> Mark as COMPLETED
                            </button>
                        </div>
                    </div>
                )}
                {selectedJob.status === 'COMPLETED' && (
                    <div className="supervisor-review__completed-banner">
                        <CheckCircle2 size={20} />
                        <span>This job has been marked as <strong>COMPLETED</strong>.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
