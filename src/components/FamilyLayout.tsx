import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FileText, Calendar, User, Plus, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../context/AuthContext';
import './FamilyLayout.css';
import familyData from '../data/familyData.json';
import { FabModal } from './FabModal';
import { NotificationDropdown } from './NotificationDropdown';

// Sample notification data
const sampleNotifications = [
    { id: '1', title: 'Dad\'s daily walk completed successfully.', time: '10 mins ago', type: 'success' as const, read: false },
    { id: '2', title: 'Nurse Jenkins scheduled for tomorrow at 10 AM.', time: '2 hours ago', type: 'info' as const, read: false },
    { id: '3', title: 'Motion detected in living room while armed.', time: 'Yesterday', type: 'alert' as const, read: true }
];

export function FamilyLayout() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { user: localUser, logout } = useAuth();
    const { user, notifications } = familyData;

    // UI State
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`family-layout ${theme}`}>

            {/* Dynamic Header */}
            <header className="family-header">
                <div
                    className="header-greeting"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <div className="user-avatar">{localUser?.initials || user.initials}</div>
                    <div className="greeting-text">
                        <span>Good Morning,</span>
                        <h2>{localUser?.name || user.name}</h2>
                    </div>

                    {isProfileOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.5rem', minWidth: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50 }}>
                            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.6, borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                                Account Settings
                            </div>
                            <button
                                onClick={logout}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', color: '#ef4444', backgroundColor: 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', transition: 'background-color 0.2s' }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut size={16} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                    <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    <button className="icon-btn notification-btn" onClick={() => setIsNotifOpen(!isNotifOpen)} title="Notifications">
                        <Bell size={24} />
                        {notifications.unreadCount > 0 && (
                            <span className="badge">{notifications.unreadCount}</span>
                        )}
                    </button>

                    {/* Render Notification Dropdown relative to header actions */}
                    <NotificationDropdown
                        isOpen={isNotifOpen}
                        onClose={() => setIsNotifOpen(false)}
                        notifications={sampleNotifications}
                    />
                </div>
            </header>

            {/* Main SCROLLABLE Content */}
            <main className="family-content">
                <Outlet />
            </main>

            {/* Interactive FAB Modal Overlay */}
            <FabModal isOpen={isFabOpen} onClose={() => setIsFabOpen(false)} />

            {/* Mobile Bottom Navigation */}
            <nav className="bottom-nav">
                <Link to="/family" className={`nav-item ${location.pathname === '/family' ? 'active' : ''}`}>
                    <Home size={24} />
                    <span>Home</span>
                </Link>
                <Link to="/family/reports" className={`nav-item ${location.pathname === '/family/reports' ? 'active' : ''}`}>
                    <FileText size={24} />
                    <span>Reports</span>
                </Link>

                {/* Center FAB Wrapper */}
                <div className="fab-wrapper">
                    <button className="fab-button" onClick={() => setIsFabOpen(true)} title="Quick Actions">
                        <Plus size={32} />
                    </button>
                </div>

                <Link to="/family/schedule" className={`nav-item ${location.pathname === '/family/schedule' ? 'active' : ''}`}>
                    <Calendar size={24} />
                    <span>Schedule</span>
                </Link>
                <Link to="/family/members" className={`nav-item ${location.pathname === '/family/members' ? 'active' : ''}`}>
                    <User size={24} />
                    <span>Profile</span>
                </Link>
            </nav>

        </div>
    );
}
