import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, FileText, Settings, Search, Bell, LogOut, Sun, Moon, Package, Menu, X } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../context/AuthContext';
import './VendorLayout.css';
import vendorData from '../data/vendorData.json';
import { NotificationDropdown } from './NotificationDropdown';

const navItems = [
    { path: '/vendor', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/vendor/tickets', icon: <FileText size={20} />, label: 'Service Tickets' },
    { path: '/vendor/assets', icon: <Package size={20} />, label: 'Asset Tracking' },
    { path: '/vendor/financials', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, label: 'Financials' },
    { path: '/vendor/settings', icon: <Settings size={20} />, label: 'Partner Settings' },
];

export function VendorLayout() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { user: localUser, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const { user } = vendorData;

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`vendor-portal-layout ${theme}`}>

            {/* Persistent Sidebar (Left) */}
            <aside className={`vp-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="vp-sidebar-header">
                    <Truck size={24} color="var(--primary-color)" style={{ marginRight: '8px' }} />
                    <h2>Vendor Portal</h2>
                    <button className="vp-mobile-close" onClick={toggleSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="vp-sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`vp-nav-link ${location.pathname === item.path || (item.path !== '/vendor' && location.pathname.startsWith(item.path)) ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span className="vp-nav-icon">{item.icon}</span>
                                    <span className="vp-nav-label">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="vp-sidebar-footer">
                    <div style={{ opacity: 0.6, fontSize: '0.8rem', textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(128,128,128,0.05)', borderRadius: '8px' }}>
                        SafeHands Verified Partner
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="vp-main-wrapper">

                {/* Top Header */}
                <header className="vp-top-header">
                    <div className="vp-mobile-menu">
                        <button className="vp-icon-btn" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="vp-header-search">
                        <Search size={20} className="search-icon" />
                        <input type="text" placeholder="Search POs, tickets..." />
                    </div>

                    <div className="vp-header-actions">
                        <button className="vp-icon-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div style={{ position: 'relative' }}>
                            <button className="vp-icon-btn notification" title="Notifications" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                                <Bell size={20} />
                                <span className="vp-badge-dot"></span>
                            </button>
                            <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
                        </div>

                        <div
                            className="vp-user-profile"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <div className="vp-avatar" style={{ backgroundColor: '#3b82f6' }}>{localUser?.initials || user.initials}</div>
                            <div className="vp-user-info">
                                <span className="vp-user-name">{localUser?.name || user.name}</span>
                                <span className="vp-user-role">{user.status}</span>
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
                <main className="vp-main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
