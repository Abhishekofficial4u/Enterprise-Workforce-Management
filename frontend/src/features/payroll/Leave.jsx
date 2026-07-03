import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from './api/leaveService';
import '../../components/shared.css';

const Leave = () => {
    const role = localStorage.getItem('userRole');
    const isAdmin = role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'MANAGER';

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Apply Leave Form State
    const [leaveType, setLeaveType] = useState('Casual Leave');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const res = await getAllLeaves();
                setLeaves(res.data);
            } else {
                const res = await getMyLeaves();
                setLeaves(res.data);
            }
        } catch (err) {
            setError('Failed to load leave data.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);
        setError('');
        try {
            await applyLeave({ leaveType, startDate, endDate, reason });
            fetchData();
            setStartDate('');
            setEndDate('');
            setReason('');
            alert('Leave application submitted!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error applying for leave');
        } finally {
            setApplying(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateLeaveStatus(id, newStatus);
            fetchData();
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <DashboardLayout title="Leave Management">
            <div className="shared-container">
                {error && <div className="alert-error">{error}</div>}

                {/* Employee Request Form */}
                {!isAdmin && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <span className="card-title">Apply for Leave</span>
                        </div>
                        <form onSubmit={handleApply} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                            <div className="form-field" style={{ marginBottom: 0 }}>
                                <label>Leave Type</label>
                                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required>
                                    <option>Casual Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Earned Leave</option>
                                    <option>Maternity Leave</option>
                                    <option>Work From Home</option>
                                </select>
                            </div>
                            <div className="form-field" style={{ marginBottom: 0 }}>
                                <label>Start Date</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                            </div>
                            <div className="form-field" style={{ marginBottom: 0 }}>
                                <label>End Date</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                            </div>
                            <div className="form-field" style={{ gridColumn: 'span 3', marginBottom: 0 }}>
                                <label>Reason</label>
                                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required placeholder="Reason for leave..." />
                            </div>
                            <button type="submit" className="btn-primary" disabled={applying} style={{ gridColumn: 'span 3', justifySelf: 'start', padding: '10px 24px' }}>
                                {applying ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Leaves Table */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">{isAdmin ? 'All Leave Requests' : 'My Leave History'}</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
                    ) : leaves.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No leave records found.
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ marginTop: '16px' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {isAdmin && <th>Employee</th>}
                                        <th>Type</th>
                                        <th>Duration</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        {isAdmin && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map(leave => (
                                        <tr key={leave._id}>
                                            {isAdmin && (
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{leave.employeeId?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{leave.employeeId?.department}</div>
                                                </td>
                                            )}
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{leave.leaveType}</div>
                                            </td>
                                            <td>
                                                <div style={{ fontSize: '14px' }}>{new Date(leave.startDate).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>to {new Date(leave.endDate).toLocaleDateString()}</div>
                                            </td>
                                            <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={leave.reason}>
                                                {leave.reason}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    {leave.status === 'Pending' ? (
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button className="btn-primary" onClick={() => handleStatusUpdate(leave._id, 'Approved')} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--success)' }}>Approve</button>
                                                            <button className="btn-secondary" onClick={() => handleStatusUpdate(leave._id, 'Rejected')} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--danger)', color: 'white', border: 'none' }}>Reject</button>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reviewed</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Leave;
