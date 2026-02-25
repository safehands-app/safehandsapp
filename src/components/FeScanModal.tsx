import { useState } from 'react';
import { X, MapPin, CheckCircle, Navigation, ShieldAlert, Camera } from 'lucide-react';
import './FeScanModal.css';

interface FeScanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FeScanModal({ isOpen, onClose }: FeScanModalProps) {
    const [status, setStatus] = useState<'idle' | 'checking-in' | 'success'>('idle');

    if (!isOpen) return null;

    const handleCheckIn = () => {
        setStatus('checking-in');
        // Simulate API check-in
        setTimeout(() => {
            setStatus('success');
            // Auto close after success
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 1500);
        }, 1200);
    };

    return (
        <div className="fe-scan-overlay" onClick={onClose}>
            <div className="fe-scan-modal" onClick={e => e.stopPropagation()}>
                <button className="fe-scan-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {status === 'success' ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: '#10b981' }}>
                            <CheckCircle size={64} />
                        </div>
                        <h2>Checked In Successfully!</h2>
                        <p style={{ opacity: 0.7 }}>Location verified via GPS. Log updated.</p>
                    </div>
                ) : (
                    <>
                        <div className="fe-scan-header">
                            <div className="fe-scan-icon-wrapper">
                                <MapPin size={32} />
                            </div>
                            <h3>Location Check-In</h3>
                            <p>Verify your presence at the current site.</p>
                        </div>

                        <div className="fe-scan-location">
                            <Navigation size={24} style={{ opacity: 0.5 }} />
                            <div className="fe-scan-loc-details">
                                <strong>Chen Residence</strong>
                                <span>88 Riverside Ave, Suite 4B</span>
                            </div>
                        </div>

                        <div className="fe-scan-input-group">
                            <label>Quick Notes (Optional)</label>
                            <textarea placeholder="e.g. Arrived on site, gate was locked initially..."></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="fe-scan-action-btn fe-scan-btn-primary" onClick={handleCheckIn} disabled={status === 'checking-in'}>
                                {status === 'checking-in' ? 'Verifying Coordinates...' : 'Submit Arrival Check-In'}
                                {status !== 'checking-in' && <CheckCircle size={20} />}
                            </button>

                            {/* Quick Camera attach mock */}
                            <button className="fe-scan-action-btn" style={{ width: 'auto', backgroundColor: 'rgba(128,128,128,0.1)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
                                <Camera size={20} />
                            </button>
                        </div>

                        <button className="fe-scan-action-btn fe-scan-btn-sos" onClick={onClose}>
                            <ShieldAlert size={20} />
                            Trigger Emergency SOS
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
