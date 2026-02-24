import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../theme-provider';
import { Sun, Moon, Shield } from 'lucide-react';
import './AuthLayout.css';

export function AuthLayout() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div className={`auth-layout ${theme}`}>
            {/* Theme Toggle (Top Right) */}
            <div className="auth-theme-toggle">
                <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                </button>
            </div>

            <div className="auth-container">
                {/* Visual Side (Hidden on very small screens) */}
                <div className="auth-visual-side">
                    <div className="auth-brand">
                        <Shield size={48} className="brand-icon" />
                        <h1>SafeHands</h1>
                        <p>Next-Generation Health & Security Platform</p>
                    </div>
                    <div className="auth-illustration">
                        {/* Placeholder for an abstract shape or illustration */}
                        <div className="abstract-shape shape-1"></div>
                        <div className="abstract-shape shape-2"></div>
                        <div className="abstract-shape shape-3"></div>
                    </div>
                </div>

                {/* Form Side (Where nested routes render) */}
                <div className="auth-form-side">
                    <Outlet />

                    <div className="auth-footer">
                        &copy; {new Date().getFullYear()} SafeHands Inc. All rights reserved.
                        <div className="auth-footer-links">
                            <Link to="#">Terms of Service</Link>
                            <Link to="#">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
