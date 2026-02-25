import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HeartPulse, Activity, Key, ShieldAlert, Phone } from 'lucide-react';
import './FieldExecutivePatientContext.css';

export function FieldExecutivePatientContext() {
    const navigate = useNavigate();

    return (
        <div className="fe-patient-container">
            <div className="fe-patient-top">
                <button className="fe-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                </button>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Patient Context</div>
            </div>

            {/* Profile Header */}
            <div className="fe-patient-header">
                <div className="fe-patient-avatar">HC</div>
                <div className="fe-patient-info">
                    <h2>Helen Chen</h2>
                    <div className="fe-patient-meta">
                        <span>82 yrs</span> • <span>Dementia Care</span>
                    </div>
                    <div className="fe-tag-container">
                        <span className="fe-condition-tag">Fall Risk</span>
                        <span className="fe-condition-tag safe">Allergies: None</span>
                    </div>
                </div>
            </div>

            {/* Vitals Glance */}
            <h3 style={{ fontSize: '1rem', marginTop: '0.5rem', marginBottom: '-0.5rem' }}>Current Vitals</h3>
            <div className="fe-context-grid">
                <div className="fe-context-card">
                    <div className="fe-context-card-header">
                        <HeartPulse size={16} color="#ef4444" /> Heart Rate
                    </div>
                    <div className="fe-context-value">72 <span style={{ fontSize: '1rem', opacity: 0.6 }}>bpm</span></div>
                    <div className="fe-context-subtext">Resting normally</div>
                </div>
                <div className="fe-context-card">
                    <div className="fe-context-card-header">
                        <Activity size={16} color="#3b82f6" /> Recent Activity
                    </div>
                    <div className="fe-context-value">Low</div>
                    <div className="fe-context-subtext" style={{ color: 'var(--text-color)', opacity: 0.6 }}>Last active 2 hrs ago</div>
                </div>
            </div>

            {/* Access & Security Notes */}
            <h3 style={{ fontSize: '1rem', marginTop: '0.5rem', marginBottom: '-0.5rem' }}>Access & Security</h3>
            <div className="fe-access-notes">
                <div className="fe-access-item">
                    <Key size={18} className="fe-access-icon" />
                    <div>
                        <strong>Lockbox Code:</strong> 4412<br />
                        <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>Located on the left side pipe near the front door.</span>
                    </div>
                </div>
                <div className="fe-access-item">
                    <ShieldAlert size={18} className="fe-access-icon" style={{ color: '#ef4444' }} />
                    <div>
                        <strong>Warning:</strong> Large indoor dog (Golden Retriever). Usually friendly but barks loudly.
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="fe-patient-actions">
                <button className="fe-scan-action-btn" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <Phone size={20} /> Call Family
                </button>
                <button className="fe-scan-action-btn fe-scan-btn-primary" onClick={() => navigate('/field-exec/report/101')}>
                    Log Report
                </button>
            </div>
        </div>
    );
}
