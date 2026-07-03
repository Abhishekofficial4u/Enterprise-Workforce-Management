import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getAllAttendance, getMyAttendance } from './api/attendanceService';
import '../../components/shared.css';

const today = new Date();
const getDayLabel = offset => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
};

const getDateStr = offset => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return d.toISOString().split('T')[0];
};

const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const Attendance = () => {
    const role = localStorage.getItem('userRole') || 'EMPLOYEE';
    const isAdmin = role === 'HR_MANAGER' || role === 'SUPER_ADMIN';

    const [activeDate, setActiveDate] = useState(0);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAttendance = async () => {
            setLoading(true);
            try {
                if (isAdmin) {
                    const res = await getAllAttendance(getDateStr(activeDate));
                    setAttendanceList(res.data || []);
                } else {
                    const res = await getMyAttendance();
                    setAttendanceList(res.data || []);
                }
                setError('');
            } catch(err) {
                setError(err.response?.data?.message || 'Error loading attendance');
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [activeDate, isAdmin]);

    const summary = {
        present:  attendanceList.filter(e => e.status === 'Present').length,
        absent:   attendanceList.filter(e => e.status === 'Absent').length,
        late:     attendanceList.filter(e => e.status === 'Late').length,
        onLeave:  attendanceList.filter(e => e.status === 'Leave').length,
    };

    const avatarColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

    return (
        <DashboardLayout title="Attendance">
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>{isAdmin ? 'Attendance Tracker' : 'My Attendance History'}</h1>
                        <p>{isAdmin ? 'Daily clock-in/clock-out records for all employees' : 'Your recent clock-in and clock-out logs'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-secondary">📋 Request Correction</button>
                        <button className="btn-primary">📥 Export Report</button>
                    </div>
                </div>

                {/* Date Selector (Admin Only) */}
                {isAdmin && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                        {[0,1,2,3,4].map(offset => (
                            <button
                                key={offset}
                                onClick={() => setActiveDate(offset)}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: 8,
                                    border: `1px solid ${activeDate === offset ? 'var(--primary)' : 'var(--border)'}`,
                                    background: activeDate === offset ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                                    color: activeDate === offset ? 'var(--primary-light)' : 'var(--text-secondary)',
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                {offset === 0 ? 'Today' : getDayLabel(offset)}
                            </button>
                        ))}
                    </div>
                )}

                {/* Summary Cards (Admin Only) */}
                {isAdmin && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
                        {[
                            { label: 'Present',  value: summary.present,  color: '#10b981', icon: '✅' },
                            { label: 'Absent',   value: summary.absent,   color: '#ef4444', icon: '❌' },
                            { label: 'Late',     value: summary.late,     color: '#f59e0b', icon: '⏰' },
                            { label: 'On Leave', value: summary.onLeave,  color: '#0ea5e9', icon: '🌴' },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 12, padding: '18px 20px',
                                borderLeft: `4px solid ${s.color}`,
                                display: 'flex', alignItems: 'center', gap: 14
                            }}>
                                <div style={{ fontSize: 26 }}>{s.icon}</div>
                                <div>
                                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {error && <div className="alert-error" style={{marginBottom: 20}}>⚠️ {error}</div>}

                {/* Table */}
                <div className="data-table-wrap">
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                            Loading attendance records...
                        </div>
                    ) : (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {isAdmin && <th>Employee</th>}
                                        {isAdmin ? <th>Department</th> : <th>Date</th>}
                                        <th>Clock In</th>
                                        <th>Clock Out</th>
                                        <th>Working Hours</th>
                                        <th>Overtime</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.length === 0 ? (
                                        <tr>
                                            <td colSpan={isAdmin ? "7" : "6"} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    ) : attendanceList.map((e, i) => (
                                        <tr key={e._id || e.employeeId}>
                                            {isAdmin && (
                                                <td>
                                                    <div className="emp-cell">
                                                        <div className="emp-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                                                            {e.name ? e.name.split(' ').map(w => w[0]).join('') : 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="emp-name">{e.name}</div>
                                                            <div className="emp-id">{e.employeeId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                            {isAdmin ? <td>{e.department}</td> : <td style={{fontWeight:500, color: 'var(--text-primary)'}}>{e.date}</td>}
                                            <td style={{ fontFamily: 'monospace', fontSize: 13.5, color: e.clockIn ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                {formatTime(e.clockIn)}
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 13.5, color: e.clockOut ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                                {formatTime(e.clockOut)}
                                            </td>
                                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {e.workingHours ? `${e.workingHours}h` : '-'}
                                            </td>
                                            <td style={{ color: e.overtime ? '#34d399' : 'var(--text-muted)' }}>
                                                {e.overtime ? `${e.overtime}h` : '-'}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${e.status.toLowerCase()}`}>
                                                    {e.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="table-footer">
                                <span className="table-info">
                                    {attendanceList.length} records {isAdmin && `• ${getDayLabel(activeDate)}`}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Attendance;
