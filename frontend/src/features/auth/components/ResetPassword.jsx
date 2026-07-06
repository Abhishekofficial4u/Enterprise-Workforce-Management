import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resetPassword } from '../api/authService';
import './Login.css';

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await resetPassword(token, password);
            localStorage.setItem('userToken', res.token);
            localStorage.setItem('userRole', res.role);
            localStorage.setItem('userId', res.userId);
            
            setStatus('success');
            setMessage('Password reset successfully! Redirecting...');
            
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error resetting password');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo-placeholder"></div>
                    <h2>Set New Password</h2>
                    <p>Enter your new password below</p>
                </div>
                
                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div className="alert-success" style={{ marginBottom: 20 }}>✅ {message}</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="login-form">
                        {status === 'error' && <div className="alert-error" style={{ marginBottom: 15 }}>⚠️ {message}</div>}
                        
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Min 6 characters" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="Type it again" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Saving...' : 'Reset Password'}
                        </button>
                    </form>
                )}
                
                {status !== 'success' && (
                    <div style={{ textAlign: 'center', marginTop: 20 }}>
                        <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>
                            Cancel
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
