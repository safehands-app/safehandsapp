import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError("Email is required");
            return;
        }

        setIsLoading(true);

        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            try {
                // Execute mock login with the entered email
                login(email);

                // Redirect to root, which will automatically route to the correct dashboard via ProtectedRoute
                navigate('/', { replace: true });
            } catch (err: any) {
                setError(err.message || "Failed to login");
            }
        }, 1000);
    };

    return (
        <div className="auth-page">
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Enter your credentials to access your portal</p>

            <form className="auth-form" onSubmit={handleLogin}>
                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 500 }}>{error}</div>}

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-with-icon">
                        <Mail className="input-icon" size={18} />
                        <input
                            type="email"
                            id="email"
                            placeholder="name@company.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-with-icon">
                        <Lock className="input-icon" size={18} />
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="auth-options">
                    <label className="remember-me">
                        <input type="checkbox" />
                        <span>Remember me</span>
                    </label>
                    <Link to="/auth/forgot-password" className="forgot-link">Forgot password?</Link>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            {/* Helper panel since we have no backend yet */}
            <div style={{ marginTop: '2rem', padding: '1.25rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '12px', fontSize: '0.85rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.75rem 0', color: '#3b82f6' }}>
                    <Info size={16} /> Beta Access Credentials
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', opacity: 0.8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Family Portal:</span> <strong>family@safehands.com</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Super Admin:</span> <strong>admin@safehands.com</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tenant Admin:</span> <strong>admin@oakridge.com</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Field Exec:</span> <strong>field@safehands.com</strong>
                    </div>
                    {/* New entry for Vendor Portal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b' }}>
                        <span>Vendor:</span> <strong>vendor@acme.com</strong>
                    </div>
                    {/* New entry for Supervisor Portal */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b5cf6' }}>
                        <span>Supervisor:</span> <strong>supervisor@safehands.com</strong>
                    </div>
                </div>
            </div>

            <div className="auth-divider">or continue with</div>

            <div className="social-auth">
                <button type="button" className="btn-social">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </button>
                <button type="button" className="btn-social">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-1.11 9-5.53 9-10.95z" />
                    </svg>
                    Facebook
                </button>
            </div>

            <div className="auth-switch">
                Don't have an account?
                <Link to="/auth/register">Sign up <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link>
            </div>
        </div>
    );
}
