import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, MapPin, User, ShieldAlert, Navigation, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../context/AuthContext';
import { FeScanModal } from './FeScanModal';
import './FieldExecutiveLayout.css';
import fieldExecData from '../data/fieldExecData.json';

export function FieldExecutiveLayout() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { user: localUser, logout } = useAuth();
    const { user } = fieldExecData;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isScanOpen, setIsScanOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`field-exec-layout ${theme}`}>
            {/* Top Header */}
            <header className="fe-header">
                <div
                    className="fe-header-profile"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <div className="fe-avatar">{localUser?.initials || user.initials}</div>
                    <div className="fe-greeting">
                        <span>{user.status}</span>
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

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    </button>
                    {/* SOS Button integrated into header for mobile */}
                    <button className="icon-btn" style={{ color: '#ef4444' }} title="SOS Alert">
                        <ShieldAlert size={24} />
                    </button>
                </div>
            </header>

            {/* Scrollable Main Content */}
            <main className="fe-content">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="fe-bottom-nav">
                <Link to="/field-exec" className={`fe-nav-item ${location.pathname === '/field-exec' ? 'active' : ''}`}>
                    <Home size={24} />
                    <span>Home</span>
                </Link>
                <Link to="/field-exec/schedule" className={`fe-nav-item ${location.pathname === '/field-exec/schedule' ? 'active' : ''}`}>
                    <ClipboardList size={24} />
                    <span>Schedule</span>
                </Link>

                {/* Center FAB: Quick Scan / Maps */}
                <div className="fe-scan-wrapper">
                    <button className="fe-scan-button" title="Quick Check-In" onClick={() => setIsScanOpen(true)}>
                        <MapPin size={28} />
                    </button>
                </div>

                <Link to="/field-exec/visits" className={`fe-nav-item ${location.pathname === '/field-exec/visits' ? 'active' : ''}`}>
                    <Navigation size={24} />
                    <span>Visits</span>
                </Link>
                <Link to="/field-exec/profile" className={`fe-nav-item ${location.pathname === '/field-exec/profile' ? 'active' : ''}`}>
                    <User size={24} />
                    <span>Me</span>
                </Link>
            </nav>

            <FeScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
        </div>
    );
}
