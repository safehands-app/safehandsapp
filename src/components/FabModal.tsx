import { X, AlertCircle, Calendar, FileText } from 'lucide-react';
import './FabModal.css';

interface FabModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FabModal({ isOpen, onClose }: FabModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fab-modal-overlay" onClick={onClose}>
            <div className="fab-modal-content" onClick={e => e.stopPropagation()}>
                <div className="fab-modal-header">
                    <h3>Quick Actions</h3>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="fab-action-grid">
                    <button className="fab-action-btn emergency">
                        <AlertCircle size={28} />
                        <span>Request Emergency Assistance</span>
                    </button>
                    <button className="fab-action-btn">
                        <Calendar size={28} />
                        <span>Schedule New Visit</span>
                    </button>
                    <button className="fab-action-btn">
                        <FileText size={28} />
                        <span>File Service Report</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
