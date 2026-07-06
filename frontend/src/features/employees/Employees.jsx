import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import AddEmployeeModal from './components/AddEmployeeModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import ViewEmployeeModal from './components/ViewEmployeeModal';
import { getEmployees, archiveEmployee } from './api/employeeService';
import '../../components/shared.css';

const avatarColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];
const depts = ['All', 'Engineering', 'HR', 'Finance', 'Marketing', 'IT', 'Operations'];

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [activeDept, setActiveDept] = useState('All');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // New states for View/Edit
    const [viewEmployee, setViewEmployee] = useState(null);
    const [editEmployee, setEditEmployee] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            setEmployees(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filtered = employees.filter(e => {
        const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) ||
                            e.employeeId?.toLowerCase().includes(search.toLowerCase());
        const matchDept = activeDept === 'All' || e.department === activeDept;
        return matchSearch && matchDept;
    });

    const getInitials = name => name ? name.split(' ').map(w => w[0]).join('') : '?';
    const getColor  = i => avatarColors[i % avatarColors.length];
    const formatDate = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleArchive = async (emp) => {
        if (window.confirm(`Are you sure you want to archive ${emp.name}? This will revoke their access.`)) {
            try {
                await archiveEmployee(emp._id);
                fetchEmployees(); // Refresh list
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to archive employee');
            }
        }
    };

    const handleExport = () => {
        if (!employees || employees.length === 0) return;
        
        const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status', 'Joining Date'];
        const csvRows = employees.map(emp => {
            return [
                emp.employeeId,
                `"${emp.name}"`,
                emp.email,
                emp.department,
                `"${emp.designation}"`,
                emp.status || 'Active',
                emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : ''
            ].join(',');
        });
        
        const csvData = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    // Dynamic stats
    const stats = [
        { label: 'Total',      value: employees.length, color: '#6366f1' },
        { label: 'Active',     value: employees.filter(e => e.status === 'Active').length, color: '#10b981' },
        { label: 'Probation',  value: employees.filter(e => e.status === 'Probation').length, color: '#f59e0b' },
        { label: 'Archived',   value: employees.filter(e => e.status === 'Archived').length, color: '#ef4444' },
    ];

    return (
        <DashboardLayout title="Employees">
            <div>
                {/* Header */}
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Employee Directory</h1>
                        <p>{employees.length} total employees across all departments</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-secondary" onClick={handleExport}>⬇️ Export</button>
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                            ➕ Add Employee
                        </button>
                    </div>
                </div>

                {/* Stats mini row */}
                <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
                    {stats.map(s => (
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

                {/* Error & Loading States */}
                {error && <div className="alert-error" style={{marginBottom: 20}}>⚠️ {error}</div>}
                
                {/* Table */}
                <div className="data-table-wrap">
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                            Loading directory...
                        </div>
                    ) : (
                        <>
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
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                                                No employees found.
                                            </td>
                                        </tr>
                                    ) : filtered.map((emp, i) => (
                                        <tr key={emp._id}>
                                            <td>
                                                <div className="emp-cell">
                                                    <div className="emp-avatar" style={{ background: getColor(i) }}>
                                                        {getInitials(emp.name)}
                                                    </div>
                                                    <div>
                                                        <div className="emp-name">{emp.name}</div>
                                                        <div className="emp-id">{emp.employeeId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{emp.department}</td>
                                            <td>{emp.designation}</td>
                                            <td>
                                                <span className={`badge badge-${(emp.status || 'Active').toLowerCase()}`}>
                                                    {emp.status === 'Active' ? '●' : '◌'} {emp.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>{formatDate(emp.joiningDate)}</td>
                                            <td>
                                                <div className="action-btns">
                                                    <div className="icon-btn" title="View" onClick={() => setViewEmployee(emp)}>👁️</div>
                                                    <div className="icon-btn" title="Edit" onClick={() => setEditEmployee(emp)}>✏️</div>
                                                    <div className="icon-btn" title="Archive" onClick={() => handleArchive(emp)}>🗃️</div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="table-footer">
                                <span className="table-info">Showing {filtered.length} of {employees.length} employees</span>
                                <div className="pagination">
                                    {[1].map(n => (
                                        <button key={n} className={`page-btn ${n === 1 ? 'active' : ''}`}>{n}</button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddEmployeeModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchEmployees();
                    }}
                />
            )}
            {viewEmployee && (
                <ViewEmployeeModal
                    employee={viewEmployee}
                    onClose={() => setViewEmployee(null)}
                />
            )}
            {editEmployee && (
                <EditEmployeeModal
                    employee={editEmployee}
                    onClose={() => setEditEmployee(null)}
                    onSuccess={() => {
                        setEditEmployee(null);
                        fetchEmployees();
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default Employees;
