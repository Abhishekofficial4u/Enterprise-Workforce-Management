import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { login } from '../api/authService';
import './Login.css';

const portalConfigs = {
    admin: { name: 'System Admin', theme: '#8b5cf6', requiredRole: 'SUPER_ADMIN' },
    hr: { name: 'HR Management', theme: '#f97316', requiredRole: 'HR_MANAGER' },
    finance: { name: 'Finance & Payroll', theme: '#10b981', requiredRole: 'FINANCE' },
    manager: { name: 'Team Manager', theme: '#3b82f6', requiredRole: 'MANAGER' },
    employee: { name: 'Employee Workspace', theme: '#0ea5e9', requiredRole: 'EMPLOYEE' }
};

const Login = () => {
    const { portalId } = useParams();
    const config = portalConfigs[portalId] || { name: 'Workforce OS', theme: '#4f46e5', requiredRole: null };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (portalId && !portalConfigs[portalId]) {
            navigate('/portal');
        }
    }, [portalId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            
            // Strict Role Enforcement
            if (config.requiredRole) {
                const userRoles = data.roles || [];
                // data.roles is an array of strings (e.g., ['SUPER_ADMIN', 'FINANCE'])
                
                const hasRole = userRoles.includes(config.requiredRole) || (config.requiredRole === 'SUPER_ADMIN' && userRoles.includes('SUPER_ADMIN'));

                // Exception: SUPER_ADMIN can bypass? For now, let's enforce strictly based on their assigned roles.
                if (!hasRole && !userRoles.includes('SUPER_ADMIN')) {
                    throw new Error("Unauthorized Portal. You do not have permissions for this workspace. Please go back to Portals and select your assigned workspace.");
                }
            }

            setSuccess(true);
            setTimeout(() => {
                if (portalId) navigate(`/${portalId}/dashboard`);
                else navigate('/dashboard');
            }, 800);
        } catch (err) {
            // Check if it's our custom error or an axios response error
            const errorMsg = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Info Panel */}
            <div className="login-left" style={{ '--primary': config.theme }}>
                <div className="login-brand">
                    <img src="/logo.png" alt="EWM Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <span className="brand-name">EWM</span>
                </div>

                <div className="login-tagline">
                    <h1 style={{ color: config.theme }}>{config.name} Portal</h1>
                    <p>
                        A centralized platform for HR, attendance, payroll, recruitment and AI-powered workforce insights.
                    </p>
                </div>

                <div className="login-features">
                    <div className="feature-chip" style={{ borderLeftColor: config.theme }}>
                        <div className="chip-icon">🤖</div>
                        AI-Powered HR Operations Assistant
                    </div>
                    <div className="feature-chip" style={{ borderLeftColor: config.theme }}>
                        <div className="chip-icon">📊</div>
                        Real-Time Analytics & Reporting
                    </div>
                    <div className="feature-chip" style={{ borderLeftColor: config.theme }}>
                        <div className="chip-icon">🔐</div>
                        Role-Based Access Control (RBAC)
                    </div>
                    <div className="feature-chip" style={{ borderLeftColor: config.theme }}>
                        <div className="chip-icon">⚡</div>
                        Automated Payroll & Attendance
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="login-right">
                <div className="login-form-container">
                    <button 
                        onClick={() => navigate('/portal')} 
                        style={{ 
                            background: 'none', border: 'none', color: 'var(--text-muted)', 
                            cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' 
                        }}
                    >
                        ← Back to Portals
                    </button>
                    <div className="login-form-header">
                        <h2>Welcome back 👋</h2>
                        <p>Sign in to access your workspace.</p>
                    </div>

                    {error && <div className="alert-error">⚠️ {error}</div>}
                    {success && <div className="alert-success">✅ Login successful! Redirecting...</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                            />
                        </div>
                        <div className="form-field" style={{ marginBottom: 10 }}>
                            <label>Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: 20 }}>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="login-submit-btn" style={{ background: config.theme }} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
