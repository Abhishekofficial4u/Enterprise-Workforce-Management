import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../../components/shared.css';

const mockLeaves = [
    { id: 'LV-001', name: 'Karan Singh',  dept: 'Engineering', type: 'Casual Leave',   from: '02 Jul 2026', to: '04 Jul 2026', days: 3, reason: 'Family event',       status: 'Pending'  },
    { id: 'LV-002', name: 'Priya Mehta',  dept: 'HR',          type: 'Sick Leave',     from: '01 Jul 2026', to: '01 Jul 2026', days: 1, reason: 'Fever',              status: 'Approved' },
    { id: 'LV-003', name: 'Divya Nair',   dept: 'Engineering', type: 'Earned Leave',   from: '10 Jul 2026', to: '15 Jul 2026', days: 6, reason: 'Vacation',          status: 'Pending'  },
    { id: 'LV-004', name: 'Amit Verma',   dept: 'Finance',     type: 'Casual Leave',   from: '28 Jun 2026', to: '28 Jun 2026', days: 1, reason: 'Personal work',     status: 'Rejected' },
    { id: 'LV-005', name: 'Sneha Patil',  dept: 'Marketing',   type: 'Work From Home', from: '05 Jul 2026', to: '07 Jul 2026', days: 3, reason: 'Home renovation',   status: 'Approved' },
];

const leaveBalance = [
    { type: 'Casual Leave',   used: 7,  total: 12 },
    { type: 'Sick Leave',     used: 2,  total: 10 },
    { type: 'Earned Leave',   used: 4,  total: 15 },
    { type: 'Work From Home', used: 5,  total: 12 },
];

const Leave = () => {
    const [activeTab, setActiveTab] = useState('all');

    const filtered = activeTab === 'all'
        ? mockLeaves
        : mockLeaves.filter(l => l.status.toLowerCase() === activeTab);

    return (
        <DashboardLayout title="Leave Management">
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Leave Management</h1>
                        <p>Track and manage employee leave requests and balances</p>
                    </div>
                    <button className="btn-primary">➕ Apply Leave</button>
                </div>

                {/* Leave Balance Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                    {leaveBalance.map(lb => {
                        const pct = Math.round((lb.used / lb.total) * 100);
                        return (
                            <div key={lb.type} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 12, padding: '18px 20px'
                            }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lb.type}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 10 }}>
                                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{lb.total - lb.used}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ {lb.total} left</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 10, background: pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#10b981' }} />
                                </div>
                                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 }}>{lb.used} used of {lb.total}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
                    {['all','pending','approved','rejected'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 18px', background: 'none', border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)',
                                fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                textTransform: 'capitalize', transition: 'all 0.15s'
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            <span style={{
                                marginLeft: 6, fontSize: 11, padding: '2px 7px', borderRadius: 20,
                                background: activeTab === tab ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                                color: activeTab === tab ? 'var(--primary-light)' : 'var(--text-muted)'
                            }}>
                                {tab === 'all' ? mockLeaves.length : mockLeaves.filter(l => l.status.toLowerCase() === tab).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Leave Type</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Days</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(l => (
                                <tr key={l.id}>
                                    <td>
                                        <div className="emp-name">{l.name}</div>
                                        <div className="emp-id">{l.dept}</div>
                                    </td>
                                    <td>{l.type}</td>
                                    <td>{l.from}</td>
                                    <td>{l.to}</td>
                                    <td><strong style={{ color: 'var(--text-primary)' }}>{l.days}</strong></td>
                                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                                    <td>
                                        <span className={`badge badge-${l.status.toLowerCase()}`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            {l.status === 'Pending' && <>
                                                <div className="icon-btn" title="Approve" style={{ color: '#34d399' }}>✅</div>
                                                <div className="icon-btn" title="Reject"  style={{ color: '#f87171' }}>❌</div>
                                            </>}
                                            <div className="icon-btn" title="View">👁️</div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">
                        <span className="table-info">Showing {filtered.length} leave requests</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Leave;
