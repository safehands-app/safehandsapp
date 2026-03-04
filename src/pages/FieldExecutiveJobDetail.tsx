import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, Upload, X, ArrowLeft, MapPin, Clock, User, AlertTriangle } from 'lucide-react';
import jobData from '../data/jobOrderData.json';
import './FieldExecutiveJobDetail.css';

type Job = typeof jobData.jobs[0];
type UploadedFile = { id: string; url: string; name: string };

function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function FieldExecutiveJobDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const jobOriginal = jobData.jobs.find(j => j.id === id) || jobData.jobs[1];
    const [job, setJob] = useState<Job>({ ...jobOriginal });
    const [beforeFiles, setBeforeFiles] = useState<UploadedFile[]>([]);
    const [afterFiles, setAfterFiles] = useState<UploadedFile[]>([]);
    const [notes, setNotes] = useState(job.notes || '');
    const [showSuccess, setShowSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');

    const canMarkDone = afterFiles.length > 0 && job.status === 'IN_PROGRESS';

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const files = Array.from(e.target.files || []);
        const newUploads: UploadedFile[] = files.map(f => ({
            id: `u-${Date.now()}-${Math.random()}`,
            url: URL.createObjectURL(f),
            name: f.name,
        }));
        if (type === 'before') setBeforeFiles(prev => [...prev, ...newUploads]);
        else setAfterFiles(prev => [...prev, ...newUploads]);
    };

    const removeFile = (id: string, type: 'before' | 'after') => {
        if (type === 'before') setBeforeFiles(prev => prev.filter(f => f.id !== id));
        else setAfterFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleMarkDone = () => {
        setJob(prev => ({ ...prev, status: 'DONE' }));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    return (
        <div className="fe-job-detail">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fe-job-detail__toast">
                    <CheckCircle2 size={18} /> Job marked as DONE! Your supervisor has been notified.
                </div>
            )}

            {/* Header */}
            <div className="fe-job-detail__header">
                <button className="fe-job-detail__back" onClick={() => navigate('/field-exec')}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div className="fe-job-detail__header-info">
                    <h2>{job.type}</h2>
                    <span className={`fe-job-detail__status ${job.status.toLowerCase().replace('_', '-')}`}>
                        {job.status.replace('_', ' ')}
                    </span>
                </div>
                {job.priority === 'urgent' && (
                    <div className="fe-job-detail__urgent">
                        <AlertTriangle size={16} /> Urgent Job
                    </div>
                )}
            </div>

            {/* Job Info */}
            <div className="fe-job-detail__info-grid">
                <div className="fe-job-detail__info-card">
                    <User size={16} />
                    <div>
                        <span className="fe-job-detail__info-label">Client</span>
                        <span className="fe-job-detail__info-value">{job.familyName}</span>
                    </div>
                </div>
                <div className="fe-job-detail__info-card">
                    <MapPin size={16} />
                    <div>
                        <span className="fe-job-detail__info-label">Location</span>
                        <span className="fe-job-detail__info-value">{job.familyAddress}</span>
                    </div>
                </div>
                <div className="fe-job-detail__info-card">
                    <Clock size={16} />
                    <div>
                        <span className="fe-job-detail__info-label">Scheduled</span>
                        <span className="fe-job-detail__info-value">{formatDate(job.scheduledAt)}</span>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="fe-job-detail__section">
                <h3>Job Description</h3>
                <p>{job.description}</p>
            </div>

            {/* Photo Upload Tabs */}
            <div className="fe-job-detail__section fe-job-detail__upload-section">
                <div className="fe-job-detail__upload-tabs">
                    <button
                        className={`fe-job-detail__upload-tab ${activeTab === 'before' ? 'active' : ''}`}
                        onClick={() => setActiveTab('before')}
                    >
                        📷 Before Photos ({beforeFiles.length})
                    </button>
                    <button
                        className={`fe-job-detail__upload-tab ${activeTab === 'after' ? 'active' : ''}`}
                        onClick={() => setActiveTab('after')}
                    >
                        ✅ After Photos ({afterFiles.length})
                    </button>
                </div>

                {/* Upload Area */}
                <label className="fe-job-detail__dropzone">
                    <Camera size={28} />
                    <span>Tap to take a photo or select from gallery</span>
                    <small>JPG, PNG or MP4 · Max 10MB each</small>
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={e => handleFileUpload(e, activeTab)}
                        style={{ display: 'none' }}
                    />
                </label>

                {/* Uploaded Files Preview */}
                {(activeTab === 'before' ? beforeFiles : afterFiles).length > 0 && (
                    <div className="fe-job-detail__uploads-grid">
                        {(activeTab === 'before' ? beforeFiles : afterFiles).map(f => (
                            <div key={f.id} className="fe-job-detail__uploaded-item">
                                <img src={f.url} alt={f.name} />
                                <button
                                    className="fe-job-detail__remove-btn"
                                    onClick={() => removeFile(f.id, activeTab)}
                                    aria-label="Remove photo"
                                >
                                    <X size={12} />
                                </button>
                                <span className="fe-job-detail__uploaded-name">{f.name}</span>
                            </div>
                        ))}
                        <label className="fe-job-detail__add-more">
                            <Upload size={20} />
                            <span>Add more</span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                onChange={e => handleFileUpload(e, activeTab)}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                )}
            </div>

            {/* Notes Section */}
            <div className="fe-job-detail__section">
                <h3>Work Notes</h3>
                <textarea
                    className="fe-job-detail__notes"
                    placeholder="Describe the work done, materials used, or any issues encountered..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={4}
                    disabled={job.status === 'DONE' || job.status === 'COMPLETED'}
                />
            </div>

            {/* Mark as Done CTA */}
            {job.status === 'IN_PROGRESS' && (
                <div className="fe-job-detail__cta">
                    {!canMarkDone && (
                        <p className="fe-job-detail__cta-hint">
                            📸 Please upload at least one "After" photo before marking as done.
                        </p>
                    )}
                    <button
                        className="fe-job-detail__done-btn"
                        onClick={handleMarkDone}
                        disabled={!canMarkDone}
                    >
                        <CheckCircle2 size={20} /> Mark Job as DONE
                    </button>
                </div>
            )}

            {(job.status === 'DONE' || job.status === 'COMPLETED') && (
                <div className="fe-job-detail__submitted-banner">
                    <CheckCircle2 size={20} />
                    <div>
                        <strong>Work submitted for review</strong>
                        <span>Your supervisor will verify and mark this as Completed.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
