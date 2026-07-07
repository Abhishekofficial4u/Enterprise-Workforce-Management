import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../../components/shared.css';

const CredentialsVault = () => {
    const [adminPassword, setAdminPassword] = useState('');
    const [unlocked, setUnlocked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [vaultData, setVaultData] = useState([]);
    const navigate = useNavigate();

    const handleUnlock = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.post('https://enterprise-workforce-management.onrender.com/api/v1/auth/admin/credentials-vault', 
                { adminPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setVaultData(res.data.data);
            setUnlocked(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to unlock vault. Incorrect password?');
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to login as ${userEmail}? You will be logged out of your Admin session.`)) return;
        
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.post(`https://enterprise-workforce-management.onrender.com/api/v1/auth/admin/impersonate/${userId}`, 
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Overwrite local storage with the new token
            localStorage.setItem('userToken', res.data.token);
            localStorage.setItem('userRole', res.data.role);
            localStorage.setItem('userId', res.data.userId);

            // Redirect to dashboard, which will reload as the impersonated user
            window.location.href = '/dashboard';
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to impersonate user');
        }
    };

    if (!unlocked) {
        return (
            <DashboardLayout title="Admin Credentials Vault">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <div style={{ background: 'var(--bg-card)', padding: 40, borderRadius: 12, border: '1px solid var(--border)', maxWidth: 450, width: '100%', textAlign: 'center' }}>
                        <div style={{ fontSize: 40, marginBottom: 20 }}>🔐</div>
                        <h2>Secure Credentials Vault</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>
                            This area contains sensitive employee login information for demo purposes. Please enter your Super Admin password to unlock.
                        </p>

                        <form onSubmit={handleUnlock}>
                            <input 
                                type="password" 
                                placeholder="Enter Admin Password" 
                                required 
                                value={adminPassword}
                                onChange={e => setAdminPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, color: '#fff', marginBottom: 20 }}
                            />
                            {error && <div style={{ color: 'var(--danger)', marginBottom: 20, fontSize: 13 }}>{error}</div>}
                            <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Unlocking...' : 'Unlock Vault'}
                            </button>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Admin Credentials Vault">
            <div className="page-header">
                <div className="page-header-left">
                    <h1 style={{ color: 'var(--warning)' }}>🔓 Vault Unlocked</h1>
                    <p>Displaying all employee credentials for presentation purposes.</p>
                </div>
                <div>
                    <button className="btn-secondary" onClick={() => { setUnlocked(false); setAdminPassword(''); setVaultData([]); }}>
                        🔒 Lock Vault
                    </button>
                </div>
            </div>

            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Password</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vaultData.map(user => (
                            <tr key={user.id}>
                                <td style={{ fontWeight: 600 }}>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>
                                    <code style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4, color: 'var(--success)' }}>
                                        {user.password}
                                    </code>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => handleImpersonate(user.id, user.email)}
                                        style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                                    >
                                        Login As
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default CredentialsVault;
