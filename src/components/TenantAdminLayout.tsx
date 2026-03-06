import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, FileSignature, Settings, Bell, Search, Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../context/AuthContext';
import './TenantAdminLayout.css';
import tenantData from '../data/tenantAdminData.json';

const navItems = [
    { path: '/tenant-admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tenant-admin/families', icon: <Users size={20} />, label: 'Manage Families' },
    { path: '/tenant-admin/executives', icon: <Briefcase size={20} />, label: 'Field Executives' },
    { path: '/tenant-admin/reports', icon: <FileSignature size={20} />, label: 'Service Reports' },
    { path: '/tenant-admin/settings', icon: <Settings size={20} />, label: 'Portal Settings' },
];

export function TenantAdminLayout() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { user: localUser, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // We use the JSON data to populate the tenant name
    const { overview } = tenantData;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`tenant-admin-layout ${theme}`}>

            {/* Persistent Sidebar (Left) */}
            <aside className={`ta-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="ta-sidebar-header">
                    <h2>SafeHands</h2>
                    <span className="ta-badge">Partner</span>
                    {/* Close button for mobile sidebar */}
                    <button className="ta-mobile-close" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="ta-sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`ta-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className="ta-nav-icon">{item.icon}</span>
                                    <span className="ta-nav-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="ta-sidebar-footer">
                    <div className="ta-system-status">
                        <div className="ta-status-header">
                            <span>SLA Status</span>
                            <span className="ta-status-value">100%</span>
                        </div>
                        <div className="ta-progress-bar">
                            <div className="ta-progress-fill" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="ta-main-wrapper">

                {/* Top Header */}
                <header className="ta-top-header">
                    <div className="ta-mobile-menu">
                        <button className="ta-icon-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="ta-header-search">
                        <Search size={20} className="search-icon" />
                        <input type="text" placeholder={`Search families in ${overview.tenantName}...`} />
                    </div>

                    <div className="ta-header-actions">
                        <button className="ta-icon-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button className="ta-icon-btn notification" title="Notifications">
                            <Bell size={20} />
                            <span className="ta-badge-dot"></span>
                        </button>
                        <div
                            className="ta-user-profile"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <div className="ta-avatar">TS</div>
                            <div className="ta-user-info">
                                <span className="ta-user-name">{localUser?.name || 'Tom Steele'}</span>
                                <span className="ta-user-role">Tenant Admin</span>
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
                <main className="ta-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
