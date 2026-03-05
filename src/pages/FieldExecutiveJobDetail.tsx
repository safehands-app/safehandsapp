import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, CheckCircle2, Upload, X, ArrowLeft, MapPin, Clock, User, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../hooks/useJobs';
import { uploadJobPhoto, updateJobStatus } from '../services/jobService';
import './FieldExecutiveJobDetail.css';


function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function FieldExecutiveJobDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { jobs, loading } = useJobs({ execId: user?.id || undefined, realtime: true });
    // Find the specific job from the fetched list
    const job = jobs.find(j => j.id === id);

    const [notes, setNotes] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'before' | 'after'>('before');

    // Update notes when job loads
    useEffect(() => {
        if (job?.notes && !notes) setNotes(job.notes);
    }, [job?.notes]);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading job details...</div>;
    if (!job) return <div style={{ padding: '2rem', textAlign: 'center' }}>Job not found or unauthorized.</div>;

    const beforeFiles = job.before_photos || [];
    const afterFiles = job.after_photos || [];

    const canMarkDone = afterFiles.length > 0 && job.status === 'IN_PROGRESS';

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setIsUploading(true);
        try {
            for (const file of files) {
                await uploadJobPhoto(job.id, type, file);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload some photos. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeFile = (fileId: string, photoType: 'before' | 'after') => {
        // In a real app we would call a delete photo service here.
        alert(`Photo deletion requires an API endpoint. Feature coming soon. (${fileId}, ${photoType})`);
    };

    const handleMarkDone = async () => {
        setIsSubmitting(true);
        try {
            await updateJobStatus(job.id, 'DONE', notes);
            setShowSuccess(true);
            setTimeout(() => { setShowSuccess(false); navigate('/field-exec'); }, 3000);
        } catch (err) {
            console.error('Failed to mark done:', err);
            alert('Failed to mark job as done. Try again.');
        } finally {
            setIsSubmitting(false);
        }
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
                        <span className="fe-job-detail__info-value">{job.family?.name || 'Unknown'}</span>
                    </div>
                </div>
                <div className="fe-job-detail__info-card">
                    <MapPin size={16} />
                    <div>
                        <span className="fe-job-detail__info-label">Location</span>
                        <span className="fe-job-detail__info-value">{'Address unavailable'}</span>
                    </div>
                </div>
                <div className="fe-job-detail__info-card">
                    <Clock size={16} />
                    <div>
                        <span className="fe-job-detail__info-label">Scheduled</span>
                        <span className="fe-job-detail__info-value">{formatDate(job.scheduled_at)}</span>
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
                {isUploading && <div style={{ textAlign: 'center', margin: '1rem', color: '#3b82f6' }}>Uploading photos...</div>}

                {/* Uploaded Files Preview */}
                {(activeTab === 'before' ? beforeFiles : afterFiles).length > 0 && (
                    <div className="fe-job-detail__uploads-grid">
                        {(activeTab === 'before' ? beforeFiles : afterFiles).map((f: any) => (
                            <div key={f.id} className="fe-job-detail__uploaded-item">
                                <img src={f.url} alt={f.caption || 'Upload'} />
                                <button
                                    className="fe-job-detail__remove-btn"
                                    onClick={() => removeFile(f.id, activeTab)}
                                    aria-label="Remove photo"
                                >
                                    <X size={12} />
                                </button>
                                <span className="fe-job-detail__uploaded-name">{f.caption || 'Photo'}</span>
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
                        disabled={!canMarkDone || isSubmitting}
                    >
                        <CheckCircle2 size={20} /> {isSubmitting ? 'Submitting...' : 'Mark Job as DONE'}
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
