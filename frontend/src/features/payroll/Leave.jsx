import React, { useState, useEffect } from 'react';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getMyLeaveBalance } from './api/leaveService';
import '../../components/shared.css';

const Leave = () => {
    const role = localStorage.getItem('userRole');
    const isAdmin = role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'MANAGER';

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [balances, setBalances] = useState({ casual: 0, sick: 0, earned: 0 });

    const [aiResult, setAiResult] = useState(null);
    const [analyzingId, setAnalyzingId] = useState(null);

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
                const balanceRes = await getMyLeaveBalance();
                setBalances(balanceRes.data);
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

    const handleAIPredict = async (leaveId) => {
        try {
            setAnalyzingId(leaveId);
            const token = localStorage.getItem('userToken');
            const res = await fetch(`https://enterprise-workforce-management.onrender.com/api/v1/time-payroll/leave/${leaveId}/ai-prediction`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setAiResult(result.data);
            } else {
                alert(result.message || 'AI Prediction failed');
            }
        } catch (error) {
            alert('Error running AI prediction');
        } finally {
            setAnalyzingId(null);
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
        <>
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>{isAdmin ? 'Leave Requests' : 'My Leaves'}</h1>
                        <p>{isAdmin ? 'Manage and approve organizational leave requests' : 'Apply and track your leave status'}</p>
                    </div>
                </div>

                {error && <div className="alert-error" style={{marginBottom: 20}}>⚠️ {error}</div>}

                {/* Leave Balances Section */}
                {!isAdmin && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Casual Leave</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px' }}>{balances.casual}</div>
                        </div>
                        <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Sick Leave</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px' }}>{balances.sick}</div>
                        </div>
                        <div className="card" style={{ padding: '24px', textAlign: 'center', background: 'rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Earned Leave</div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '8px' }}>{balances.earned}</div>
                        </div>
                    </div>
                )}

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
                                    <option disabled={balances.casual === 0}>Casual Leave</option>
                                    <option disabled={balances.sick === 0}>Sick Leave</option>
                                    <option disabled={balances.earned === 0}>Earned Leave</option>
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
                                        <th>Actions</th>
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
                                                <span className={`badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                            </td>
                                            <td>
                                                {leave.status === 'Pending' ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {isAdmin && (
                                                            <>
                                                                <button className="btn-primary" onClick={() => handleStatusUpdate(leave._id, 'Approved')} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--success)' }}>Approve</button>
                                                                <button className="btn-secondary" onClick={() => handleStatusUpdate(leave._id, 'Rejected')} style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--danger)', color: 'white', border: 'none' }}>Reject</button>
                                                            </>
                                                        )}
                                                        <button 
                                                            className="btn-secondary" 
                                                            onClick={() => handleAIPredict(leave._id)} 
                                                            style={{ padding: '4px 8px', fontSize: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)', border: '1px solid var(--primary)' }}
                                                            disabled={analyzingId === leave._id}
                                                        >
                                                            {analyzingId === leave._id ? '...' : '✨ Predict AI'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{isAdmin ? 'Reviewed' : '-'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Result Modal */}
            {aiResult && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="ewm-card" style={{ maxWidth: 500, padding: 32 }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginTop: 0 }}>
                            ✨ AI Leave Prediction
                        </h2>
                        
                        <div style={{ margin: '20px 0' }}>
                            <h3 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 16px 0', color: aiResult.probability > 70 ? 'var(--success)' : (aiResult.probability > 40 ? 'var(--warning)' : 'var(--danger)') }}>
                                {aiResult.probability}% Approval Probability
                            </h3>
                            
                            <h4 style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>AI Reasoning:</h4>
                            <p style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>{aiResult.reasoning}</p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="ewm-btn" onClick={() => setAiResult(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Leave;
