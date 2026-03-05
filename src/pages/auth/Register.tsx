import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: `${firstName} ${lastName}`
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Optional: You can auto-login or redirect to login page. Let's redirect to login.
            alert('Registration successful! Please sign in.');
            navigate('/auth/login');
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to create account.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <h2>Create an account</h2>
            <p className="auth-subtitle">Join SafeHands to manage your care and security.</p>

            {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

            <form className="auth-form" onSubmit={handleRegister}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label htmlFor="firstName">First Name</label>
                        <div className="input-with-icon">
                            <User className="input-icon" size={18} />
                            <input type="text" id="firstName" name="firstName" placeholder="John" required />
                        </div>
                    </div>
                    <div className="input-group">
                        <label htmlFor="lastName">Last Name</label>
                        <div className="input-with-icon">
                            <User className="input-icon" size={18} />
                            <input type="text" id="lastName" name="lastName" placeholder="Doe" required />
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-with-icon">
                        <Mail className="input-icon" size={18} />
                        <input type="email" id="email" name="email" placeholder="name@company.com" required />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-with-icon">
                        <Lock className="input-icon" size={18} />
                        <input type="password" id="password" name="password" placeholder="Create a password" required minLength={6} />
                    </div>
                </div>

                <button type="submit" className="auth-btn-primary" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
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
                </div>
            </div>

            <div className="auth-switch" style={{ marginTop: '1.5rem' }}>
                Already have an account?
                <Link to="/auth/login">Sign in <ArrowRight size={14} style={{ verticalAlign: 'middle' }} /></Link>
            </div>
        </div>
    );
}
