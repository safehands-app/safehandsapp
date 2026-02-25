import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import './NotificationDropdown.css';

interface Notification {
    id: string;
    title: string;
    time: string;
    type: 'alert' | 'success' | 'info';
    read: boolean;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications?: Notification[];
    role?: string;
}

export function NotificationDropdown({ isOpen, onClose, notifications = [] }: NotificationDropdownProps) {
    if (!isOpen) return null;

    return (
        <>
            <div className="notification-overlay" onClick={onClose}></div>
            <div className="notification-dropdown">
                <div className="notif-header">
                    <h3>Notifications</h3>
                    <span className="notif-badge">{notifications.filter(n => !n.read).length} New</span>
                </div>

                <div className="notif-list">
                    {notifications.length === 0 ? (
                        <div className="notif-empty">No new notifications.</div>
                    ) : (
                        notifications.map(notif => (
                            <div key={notif.id} className={`notif-item ${notif.read ? 'read' : 'unread'}`}>
                                <div className={`notif-icon ${notif.type}`}>
                                    {notif.type === 'alert' && <AlertCircle size={16} />}
                                    {notif.type === 'success' && <CheckCircle size={16} />}
                                    {notif.type === 'info' && <Info size={16} />}
                                </div>
                                <div className="notif-content">
                                    <p>{notif.title}</p>
                                    <span>{notif.time}</span>
                                </div>
                                {!notif.read && <div className="notif-dot"></div>}
                            </div>
                        ))
                    )}
                </div>

                <div className="notif-footer">
                    <button className="notif-mark-read">Mark all as read</button>
                </div>
            </div>
        </>
    );
}
