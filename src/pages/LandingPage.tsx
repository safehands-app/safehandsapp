import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, Users, ArrowRight, ShieldCheck, HeartPulse, Building2, Truck } from 'lucide-react';
import './LandingPage.css';

export function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing-page">
            <header className="lp-header">
                <div className="lp-logo">
                    <ShieldCheck className="lp-logo-icon" size={28} />
                    <span>SafeHands</span>
                </div>
                <nav className="lp-nav">
                    <a href="#features">Features</a>
                    <a href="#solutions">Solutions</a>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="lp-btn-primary">
                            Go to Dashboard <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <Link to="/auth/login" className="lp-btn-primary">
                            Sign In
                        </Link>
                    )}
                </nav>
            </header>

            <main>
                <section className="lp-hero">
                    <div className="lp-hero-content">
                        <div className="lp-badge">Transforming Remote Care</div>
                        <h1>Intelligent Care Management Platform</h1>
                        <p>
                            Connect families, caregivers, and medical professionals with real-time health monitoring, predictive security, and seamless field service dispatching.
                        </p>
                        <div className="lp-hero-actions">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="lp-btn-large">
                                    Open Dashboard <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/auth/login" className="lp-btn-large">
                                        Get Started Today
                                    </Link>
                                    <Link to="/auth/login" className="lp-btn-outline-large">
                                        Partner Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="lp-hero-visual">
                        <div className="lp-glass-card lp-card-1">
                            <Activity color="#00F2D1" size={32} />
                            <div>
                                <h4>Vitals Monitoring</h4>
                                <span>Real-time patient tracking</span>
                            </div>
                        </div>
                        <div className="lp-glass-card lp-card-2">
                            <Shield color="#3b82f6" size={32} />
                            <div>
                                <h4>Smart Security</h4>
                                <span>Automated emergency dispatch</span>
                            </div>
                        </div>
                        <div className="lp-glass-card lp-card-3">
                            <Users color="#8b5cf6" size={32} />
                            <div>
                                <h4>Family Access</h4>
                                <span>Unified portal for relatives</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="lp-features">
                    <div className="lp-section-header">
                        <h2>One Platform. Five Unified Portals.</h2>
                        <p>Designed specifically for the complex ecosystem of modern remote healthcare and property management.</p>
                    </div>
                    <div className="lp-features-grid">
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <HeartPulse size={24} />
                            </div>
                            <h3>Family Portal</h3>
                            <p>Mobile-first access for relatives to check in on loved ones, view vitals, and request emergency assistance instantly.</p>
                        </div>
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon" style={{ background: 'rgba(0, 242, 209, 0.1)', color: '#00F2D1' }}>
                                <Building2 size={24} />
                            </div>
                            <h3>Tenant Administration</h3>
                            <p>For care homes and housing authorities to manage hundreds of patients, assign nurses, and track SLA metrics.</p>
                        </div>
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                                <Truck size={24} />
                            </div>
                            <h3>Field Executive App</h3>
                            <p>Optimized routing and quick check-in tools for traveling nurses, security guards, and maintenance crews.</p>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="lp-footer">
                <div className="lp-footer-content">
                    <div className="lp-footer-brand">
                        <div className="lp-logo">
                            <ShieldCheck className="lp-logo-icon" size={24} />
                            <span>SafeHands</span>
                        </div>
                        <p>© 2026 SafeHands Inc. All rights reserved.</p>
                    </div>
                    <div className="lp-footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
