import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Send } from 'lucide-react';
import './FieldExecutiveServiceReport.css';

const SERVICE_TAGS = [
    'Health Check',
    'Medication Administered',
    'Security Patrol',
    'Maintenance',
    'Meal Prep',
    'Transportation',
    'Incident Reported'
];

export function FieldExecutiveServiceReport() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
            setTimeout(() => {
                // Navigate back to history or dashboard
                navigate('/field-exec/visits');
            }, 1500);
        }, 1200);
    };

    if (isSuccess) {
        return (
            <div className="fe-report-container" style={{ alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
                <div style={{ color: '#10b981', marginBottom: '1rem' }}>
                    <CheckCircle size={64} />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Report Submitted!</h2>
                <p style={{ opacity: 0.7 }}>The visit log has been recorded successfully.</p>
            </div>
        );
    }

    return (
        <div className="fe-report-container">
            <div className="fe-report-top">
                <button className="fe-back-btn" onClick={() => navigate(-1)} type="button">
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
                    <FileText size={20} className="primary-text" />
                    Service Report
                </div>
            </div>

            <form className="fe-report-card" onSubmit={handleSubmit}>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px dashed var(--border-color)', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 600 }}>CLIENT</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Helen Chen (ID: {id || '101'})</div>
                </div>

                <div className="fe-time-grid">
                    <div className="fe-form-group">
                        <label>Time In</label>
                        <input type="time" defaultValue="09:00" required />
                    </div>
                    <div className="fe-form-group">
                        <label>Time Out</label>
                        <input type="time" defaultValue="10:30" required />
                    </div>
                </div>

                <div className="fe-form-group">
                    <label>Services Provided (Select all that apply)</label>
                    <div className="fe-tags-grid">
                        {SERVICE_TAGS.map(tag => (
                            <div
                                key={tag}
                                className={`fe-selectable-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                onClick={() => toggleTag(tag)}
                            >
                                {selectedTags.includes(tag) && <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />}
                                {tag}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="fe-form-group">
                    <label>Visit Notes</label>
                    <textarea
                        placeholder="Detailed observations or incidents during the visit..."
                        required
                    ></textarea>
                </div>

                <div className="fe-submit-area">
                    <button type="submit" className="fe-report-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : (
                            <>Submit Report <Send size={18} /></>
                        )}
                    </button>
                    <button type="button" onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', opacity: 0.6, fontSize: '0.9rem', cursor: 'pointer', padding: '0.5rem' }}>
                        Cancel & Save Draft
                    </button>
                </div>
            </form>
        </div>
    );
}
