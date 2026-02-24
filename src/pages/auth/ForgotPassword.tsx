import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Info } from 'lucide-react';

export function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call delay
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1200);
    };

    if (isSent) {
        return (
            <div className="auth-page" style={{ textAlign: 'center', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <CheckCircle size={32} />
                </div>
                <h2>Check your email</h2>
                <p className="auth-subtitle" style={{ maxWidth: '80%' }}>
                    We've sent a password reset link to your email address. Please check your inbox.
                </p>
                <Link to="/auth/login" className="auth-btn-primary" style={{ textDecoration: 'none', width: '100%' }}>
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <Link to="/auth/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-color)', opacity: 0.6, textDecoration: 'none', fontSize: '0.85rem', marginBottom: '2rem', width: 'fit-content' }}>
                <ArrowLeft size={16} /> Back to login
            </Link>

            <h2>Forgot Password?</h2>
            <p className="auth-subtitle">No worries, we'll send you reset instructions.</p>

            <form className="auth-form" onSubmit={handleReset}>
                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-with-icon">
                        <Mail className="input-icon" size={18} />
                        <input type="email" id="email" placeholder="name@company.com" required />
                    </div>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading} style={{ marginTop: '1rem' }}>
                    {isLoading ? 'Sending instructions...' : 'Reset Password'}
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
                </div>
            </div>
        </div>
    );
}
