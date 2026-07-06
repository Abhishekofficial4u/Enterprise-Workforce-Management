import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../api/authService';
import './Login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const [resetLink, setResetLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await forgotPassword(email);
            setStatus('success');
            setMessage('A password reset link has been sent to your email.');
            if (res.resetUrl) {
                setResetLink(res.resetUrl);
            }
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error sending password reset email');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-placeholder"></div>
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive a reset link</p>
                </div>
                
                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="alert-success" style={{ marginBottom: 20 }}>✅ {message}</div>
                        {resetLink && (
                            <div style={{ marginBottom: 20, padding: 15, background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: 8 }}>
                                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                                    (Fallback for blocked emails on Render free tier):
                                </p>
                                <a href={resetLink} style={{ wordBreak: 'break-all', color: 'var(--primary)', fontWeight: 500 }}>
                                    {resetLink}
                                </a>
                            </div>
                        )}
                        <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        {status === 'error' && <div className="alert-error" style={{ marginBottom: 15 }}>⚠️ {message}</div>}
                        
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input 
                                type="email" 
                                className="form-input" 
                                placeholder="you@company.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                
                {status !== 'success' && (
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
