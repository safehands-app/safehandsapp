import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Database, IndianRupee, ShieldAlert, FileText, Settings, Bell, RefreshCw, Search, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../context/AuthContext';
import './SuperAdminLayout.css';

const navItems = [
    { path: '/super-admin', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/super-admin/users', icon: <Users size={20} />, label: 'Global Users' },
    { path: '/super-admin/tenants', icon: <Database size={20} />, label: 'Tenants' },
    { path: '/super-admin/financials', icon: <IndianRupee size={20} />, label: 'Financials' },
    { path: '/super-admin/security', icon: <ShieldAlert size={20} />, label: 'Security Ops' },
    { path: '/super-admin/logs', icon: <FileText size={20} />, label: 'System Logs' },
    { path: '/super-admin/settings', icon: <Settings size={20} />, label: 'Settings' },
];

export function SuperAdminLayout() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { user: localUser, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`super-admin-layout ${theme}`}>

            {/* Persistent Sidebar (Left) */}
            <aside className={`sa-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sa-sidebar-header">
                    <h2>SafeHands</h2>
                    <span className="sa-badge">HQ</span>
                    {/* Close button for mobile sidebar */}
                    <button className="sa-mobile-close" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sa-sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`sa-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className="sa-nav-icon">{item.icon}</span>
                                    <span className="sa-nav-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sa-sidebar-footer">
                    <div className="sa-system-status">
                        <div className="sa-status-header">
                            <span>Global Health</span>
                            <span className="sa-status-value">99.9%</span>
                        </div>
                        <div className="sa-progress-bar">
                            <div className="sa-progress-fill" style={{ width: '99.9%' }}></div>
                        </div>
                    </div>
                    <button className="sa-support-btn">Contact Support</button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="sa-main-wrapper">

                {/* Top Header */}
                <header className="sa-top-header">
                    <div className="sa-mobile-menu">
                        <button className="sa-icon-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                    </div>
                    <div className="sa-header-search">
                        <Search size={20} className="search-icon" />
                        <input type="text" placeholder="Search tenants, regions, or logs..." />
                    </div>

                    <div className="sa-header-actions">
                        <button className="sa-icon-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="sa-icon-btn" title="Refresh Data">
                            <RefreshCw size={20} />
                        </button>
                        <button className="sa-icon-btn notification" title="Notifications">
                            <Bell size={20} />
                            <span className="sa-badge-dot"></span>
                        </button>
                        <div
                            className="sa-user-profile"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <div className="sa-avatar">AR</div>
                            <div className="sa-user-info">
                                <span className="sa-user-name">{localUser?.name || 'Alex Rivera'}</span>
                                <span className="sa-user-role">Global Admin</span>
                            </div>

                            {isProfileOpen && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '0.5rem', minWidth: '180px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50 }}>
                                    <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-color)', opacity: 0.6, borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                                        Account Settings
                                    </div>
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await logout();
                                            window.location.href = '/#/auth/login';
                                        }}
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
                    </div>
                </header>

                {/* Page Content */}
                <main className="sa-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
