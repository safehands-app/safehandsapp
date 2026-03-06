import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme-provider';
import {
    LayoutDashboard, ClipboardList, CheckSquare, Users,
    LogOut, Sun, Moon, ChevronDown, ShieldCheck, Bell
} from 'lucide-react';
import { useState } from 'react';
import './SupervisorLayout.css';

export function SupervisorLayout() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [regionOpen, setRegionOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('Mumbai North');

    const regions = ['Mumbai North', 'Mumbai South', 'Mumbai Central', 'Pune', 'Nashik'];

    const handleLogout = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await logout();
        window.location.href = '/#/auth/login';
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const navItems = [
        { path: '/supervisor', label: 'Dashboard', icon: <LayoutDashboard size={18} />, end: true },
        { path: '/supervisor/queue', label: 'Job Queue', icon: <ClipboardList size={18} /> },
        { path: '/supervisor/review', label: 'Review Jobs', icon: <CheckSquare size={18} /> },
        { path: '/supervisor/executives', label: 'Field Executives', icon: <Users size={18} /> },
    ];

    return (
        <div className="supervisor-shell">
            <aside className="supervisor-sidebar">
                <div className="supervisor-sidebar__brand">
                    <ShieldCheck size={24} className="supervisor-sidebar__brand-icon" />
                    <div>
                        <span className="supervisor-sidebar__brand-name">SafeHands</span>
                        <span className="supervisor-sidebar__brand-role">Supervisor Portal</span>
                    </div>
                </div>

                {/* Region Selector */}
                <div className="supervisor-region-selector" onClick={() => setRegionOpen(!regionOpen)}>
                    <span className="supervisor-region-selector__label">Region</span>
                    <div className="supervisor-region-selector__value">
                        <span>{selectedRegion}</span>
                        <ChevronDown size={14} className={regionOpen ? 'rotated' : ''} />
                    </div>
                    {regionOpen && (
                        <div className="supervisor-region-dropdown">
                            {regions.map(r => (
                                <div
                                    key={r}
                                    className={`supervisor-region-option ${r === selectedRegion ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setSelectedRegion(r); setRegionOpen(false); }}
                                >
                                    {r}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <nav className="supervisor-sidebar__nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `supervisor-nav-item ${isActive ? 'supervisor-nav-item--active' : ''}`
                            }
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="supervisor-sidebar__footer">
                    <button className="supervisor-sidebar__theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <div className="supervisor-sidebar__user">
                        <div className="supervisor-sidebar__avatar">{user?.initials || 'SV'}</div>
                        <div>
                            <div className="supervisor-sidebar__user-name">{user?.name}</div>
                            <div className="supervisor-sidebar__user-role">Supervisor</div>
                        </div>
                    </div>
                    <button className="supervisor-sidebar__logout" onClick={handleLogout} aria-label="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            <main className="supervisor-content">
                <header className="supervisor-header">
                    <div className="supervisor-header__title">
                        <h1>Supervisor Portal</h1>
                        <span className="supervisor-header__region-badge">{selectedRegion}</span>
                    </div>
                    <div className="supervisor-header__actions">
                        <button className="supervisor-header__notif-btn" aria-label="Notifications">
                            <Bell size={18} />
                            <span className="supervisor-header__notif-dot"></span>
                        </button>
                    </div>
                </header>
                <div className="supervisor-page">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
