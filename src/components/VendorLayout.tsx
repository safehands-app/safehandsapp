import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Truck, FileText, Settings, Search, Bell, LogOut, Sun, Moon, Package } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../context/AuthContext';
import './TenantAdminLayout.css'; // Reusing TenantAdminLayout CSS since Vendor is also a sidebar desktop view
import vendorData from '../data/vendorData.json';
import { NotificationDropdown } from './NotificationDropdown';

export function VendorLayout() {
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const { user: localUser, logout } = useAuth();
    const { user } = vendorData;

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`tenant-layout ${theme}`}>
            {/* Sidebar Reused from TenantAdmin */}
            <aside className="tenant-sidebar">
                <div className="tenant-sidebar-header">
                    <div className="tenant-logo">
                        <Truck size={24} color="var(--primary-color)" />
                        <h3>Vendor Portal</h3>
                    </div>
                </div>

                <nav className="tenant-nav">
                    <Link to="/vendor" className={`tenant-nav-item ${location.pathname === '/vendor' ? 'active' : ''}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/vendor/tickets" className={`tenant-nav-item ${location.pathname.includes('/tickets') ? 'active' : ''}`}>
                        <FileText size={20} /> Service Tickets
                    </Link>
                    <Link to="/vendor/assets" className={`tenant-nav-item ${location.pathname.includes('/assets') ? 'active' : ''}`}>
                        <Package size={20} /> Asset Tracking
                    </Link>
                    <Link to="/vendor/financials" className={`tenant-nav-item ${location.pathname.includes('/financials') ? 'active' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.75rem' }}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Financials
                    </Link>
                </nav>

                <div className="tenant-sidebar-footer">
                    <Link to="/vendor/settings" className={`tenant-nav-item ${location.pathname === '/vendor/settings' ? 'active' : ''}`}>
                        <Settings size={20} /> Partner Settings
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="tenant-main">
                {/* Header Reused from TenantAdmin */}
                <header className="tenant-header">
                    <div className="tenant-search">
                        <Search size={18} />
                        <input type="text" placeholder="Search POs, tickets..." />
                    </div>

                    <div className="tenant-header-actions">
                        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div style={{ position: 'relative' }}>
                            <button className="icon-btn" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                                <Bell size={20} />
                                <span className="notification-dot"></span>
                            </button>
                            <NotificationDropdown isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} role="vendor" />
                        </div>

                        <div className="tenant-profile" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                            <div className="tenant-avatar">{localUser?.initials || user.initials}</div>
                            <div className="tenant-user-info">
                                <span>{localUser?.name || user.name}</span>
                                <small>{user.status}</small>
                            </div>

                            {isProfileOpen && (
                                <div className="tenant-profile-dropdown">
                                    <button onClick={logout} className="logout-btn">
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="tenant-content-scroll">
                    <div className="tenant-content-padding">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
