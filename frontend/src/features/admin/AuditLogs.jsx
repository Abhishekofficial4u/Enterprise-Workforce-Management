import React, { useState, useEffect } from 'react';
import { getAuditLogs } from './api/auditService';
import '../../components/shared.css';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({ action: '', resource: '' });

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await getAuditLogs(page, 50, filters);
            setLogs(res.data);
            setTotalPages(res.pages);
        } catch (error) {
            console.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(1);
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Audit & Compliance Logs</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Track system activity and data mutations.</p>
            </div>

            <div className="ewm-card" style={{ padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Action Type</label>
                        <input 
                            type="text" 
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            placeholder="e.g. LOGIN, UPDATE_EMPLOYEE"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>Resource</label>
                        <input 
                            type="text" 
                            name="resource"
                            value={filters.resource}
                            onChange={handleFilterChange}
                            placeholder="e.g. USERS, EMPLOYEES"
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)' }}
                        />
                    </div>
                </div>
            </div>

            <div className="ewm-card">
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading logs...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Timestamp</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>User</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Action</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Resource</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>Details</th>
                                <th style={{ padding: '16px', color: 'var(--text-muted)' }}>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '16px', fontWeight: 500 }}>{log.user?.name || 'System'}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{log.resource}</td>
                                    <td style={{ padding: '16px', fontSize: 13, color: 'var(--text-muted)', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: 13 }}>{log.ipAddress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                    <button 
                        className="ewm-btn-secondary" 
                        disabled={page === 1} 
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </button>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
                    <button 
                        className="ewm-btn-secondary" 
                        disabled={page >= totalPages} 
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
