import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/authService';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await login(email, password);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Left Info Panel */}
            <div className="login-left">
                <div className="login-brand">
                    <img src="/logo.png" alt="EWM Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <span className="brand-name">EWM</span>
                </div>

                <div className="login-tagline">
                    <h1>Manage Your Workforce Intelligently</h1>
                    <p>
                        A centralized platform for HR, attendance, payroll, recruitment and AI-powered workforce insights.
                    </p>
                </div>

                <div className="login-features">
                    <div className="feature-chip">
                        <div className="chip-icon">🤖</div>
                        AI-Powered HR Operations Assistant
                    </div>
                    <div className="feature-chip">
                        <div className="chip-icon">📊</div>
                        Real-Time Analytics & Reporting
                    </div>
                    <div className="feature-chip">
                        <div className="chip-icon">🔐</div>
                        Role-Based Access Control (RBAC)
                    </div>
                    <div className="feature-chip">
                        <div className="chip-icon">⚡</div>
                        Automated Payroll & Attendance
                    </div>
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="login-right">
                <div className="login-form-container">
                    <button 
                        onClick={() => navigate('/')} 
                        style={{ 
                            background: 'none', border: 'none', color: 'var(--text-muted)', 
                            cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' 
                        }}
                    >
                        ← Back to Website
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

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
