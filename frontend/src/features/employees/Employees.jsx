import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../../components/shared.css';

const avatarColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

const mockEmployees = [
    { id: 'EMP001', name: 'Rahul Sharma',   dept: 'Engineering',  role: 'Software Engineer',    status: 'Active',    joined: '15 Jan 2025' },
    { id: 'EMP002', name: 'Priya Mehta',    dept: 'HR',           role: 'HR Manager',           status: 'Active',    joined: '02 Mar 2024' },
    { id: 'EMP003', name: 'Amit Verma',     dept: 'Finance',      role: 'Finance Executive',    status: 'Active',    joined: '10 Jun 2024' },
    { id: 'EMP004', name: 'Sneha Patil',    dept: 'Marketing',    role: 'Marketing Lead',       status: 'Probation', joined: '01 May 2026' },
    { id: 'EMP005', name: 'Karan Singh',    dept: 'Engineering',  role: 'Senior Developer',     status: 'Active',    joined: '20 Aug 2023' },
    { id: 'EMP006', name: 'Anita Joshi',    dept: 'Operations',   role: 'Operations Manager',   status: 'Active',    joined: '11 Nov 2022' },
    { id: 'EMP007', name: 'Rohan Gupta',    dept: 'IT',           role: 'IT Administrator',     status: 'Active',    joined: '03 Feb 2025' },
    { id: 'EMP008', name: 'Divya Nair',     dept: 'Engineering',  role: 'QA Engineer',          status: 'Probation', joined: '15 Jun 2026' },
];

const depts = ['All', 'Engineering', 'HR', 'Finance', 'Marketing', 'IT', 'Operations'];

const Employees = () => {
    const [search, setSearch] = useState('');
    const [activeDept, setActiveDept] = useState('All');

    const filtered = mockEmployees.filter(e => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
                            e.id.toLowerCase().includes(search.toLowerCase());
        const matchDept = activeDept === 'All' || e.dept === activeDept;
        return matchSearch && matchDept;
    });

    const getInitials = name => name.split(' ').map(w => w[0]).join('');
    const getColor  = i => avatarColors[i % avatarColors.length];

    return (
        <DashboardLayout title="Employees">
            <div>
                {/* Header */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Employee Directory</h1>
                        <p>{mockEmployees.length} total employees across all departments</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-secondary">⬇️ Export</button>
                        <button className="btn-primary">➕ Add Employee</button>
                    </div>
                </div>

                {/* Stats mini row */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                    {[
                        { label: 'Total',      value: 248, color: '#6366f1' },
                        { label: 'Active',     value: 230, color: '#10b981' },
                        { label: 'Probation',  value: 12,  color: '#f59e0b' },
                        { label: 'Archived',   value: 6,   color: '#ef4444' },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '14px 20px', flex: 1,
                            borderTop: `3px solid ${s.color}`
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search & Dept Filter */}
                <div className="search-filter-bar" style={{ flexWrap: 'wrap' }}>
                    <div className="search-input-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            className="search-input"
                            placeholder="Search by name or ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {depts.map(d => (
                        <button
                            key={d}
                            className={`filter-chip ${activeDept === d ? 'active' : ''}`}
                            onClick={() => setActiveDept(d)}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((emp, i) => (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="emp-cell">
                                            <div className="emp-avatar" style={{ background: getColor(i) }}>
                                                {getInitials(emp.name)}
                                            </div>
                                            <div>
                                                <div className="emp-name">{emp.name}</div>
                                                <div className="emp-id">{emp.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{emp.dept}</td>
                                    <td>{emp.role}</td>
                                    <td>
                                        <span className={`badge badge-${emp.status.toLowerCase()}`}>
                                            {emp.status === 'Active' ? '●' : '◌'} {emp.status}
                                        </span>
                                    </td>
                                    <td>{emp.joined}</td>
                                    <td>
                                        <div className="action-btns">
                                            <div className="icon-btn" title="View">👁️</div>
                                            <div className="icon-btn" title="Edit">✏️</div>
                                            <div className="icon-btn" title="Archive">🗃️</div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="table-footer">
                        <span className="table-info">Showing {filtered.length} of {mockEmployees.length} employees</span>
                        <div className="pagination">
                            {[1,2,3].map(n => (
                                <button key={n} className={`page-btn ${n === 1 ? 'active' : ''}`}>{n}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Employees;
