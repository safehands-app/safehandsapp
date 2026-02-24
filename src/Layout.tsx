import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from './theme-provider';
import { Sun, Moon, Monitor, Menu, UserCircle, Bell, LayoutDashboard, Users, ShieldAlert, LogOut } from 'lucide-react';
import { useState } from 'react';
import './Layout.css'; // We will create this

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

// Temporary hardcoded navigation based on roles, later this would be dynamic based on the logged-in user's role
const superAdminNav: NavItem[] = [
    { label: 'Dashboard', path: '/super-admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Tenants', path: '/super-admin/tenants', icon: <Users size={20} /> },
    { label: 'System Logs', path: '/super-admin/logs', icon: <ShieldAlert size={20} /> },
];

const tenantAdminNav: NavItem[] = [
    { label: 'Dashboard', path: '/tenant-admin', icon: <LayoutDashboard size={20} /> },
    { label: 'Families', path: '/tenant-admin/families', icon: <Users size={20} /> },
    { label: 'Executives', path: '/tenant-admin/executives', icon: <Users size={20} /> },
];

const familyNav: NavItem[] = [
    { label: 'My Dashboard', path: '/family', icon: <LayoutDashboard size={20} /> },
    { label: 'Members', path: '/family/members', icon: <Users size={20} /> },
];

export function AppLayout() {
    const { theme, setTheme } = useTheme();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Determine current role based on path for prototyping
    let navItems: NavItem[] = [];
    let roleTitle = 'SafeHands';

    if (location.pathname.startsWith('/super-admin')) {
        navItems = superAdminNav;
        roleTitle = 'Super Admin';
    } else if (location.pathname.startsWith('/tenant-admin')) {
        navItems = tenantAdminNav;
        roleTitle = 'Tenant Admin';
    } else if (location.pathname.startsWith('/family')) {
        navItems = familyNav;
        roleTitle = 'Family Portal';
    }

    return (
        <div className="layout-container">
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>{isSidebarOpen ? roleTitle : 'SH'}</h2>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {isSidebarOpen && <span className="nav-label">{item.label}</span>}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-link logout">
                        <span className="nav-icon"><LogOut size={20} /></span>
                        {isSidebarOpen && <span className="nav-label">Switch Role</span>}
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-wrapper">
                {/* Top Header */}
                <header className="top-header">
                    <div className="header-left">
                        <button
                            className="icon-btn"
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            title="Toggle Sidebar"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="page-title">{navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}</h1>
                    </div>

                    <div className="header-right">
                        {/* Theme Toggle */}
                        <div className="theme-toggle">
                            <button
                                className={`icon-btn ${theme === 'light' ? 'active' : ''}`}
                                onClick={() => setTheme('light')}
                                title="Light Mode"
                            >
                                <Sun size={20} />
                            </button>
                            <button
                                className={`icon-btn ${theme === 'dark' ? 'active' : ''}`}
                                onClick={() => setTheme('dark')}
                                title="Dark Mode"
                            >
                                <Moon size={20} />
                            </button>
                            <button
                                className={`icon-btn ${theme === 'system' ? 'active' : ''}`}
                                onClick={() => setTheme('system')}
                                title="System Default"
                            >
                                <Monitor size={20} />
                            </button>
                        </div>

                        {/* Notifications & Profile */}
                        <button className="icon-btn" title="Notifications">
                            <Bell size={24} />
                        </button>
                        <div className="user-profile">
                            <UserCircle size={32} />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="main-content">
                    <Outlet /> {/* This is where nested routes render */}
                </main>
            </div>
        </div>
    );
}
