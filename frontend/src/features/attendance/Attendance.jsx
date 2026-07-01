import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import '../../components/shared.css';

const today = new Date();
const getDayLabel = offset => {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
};

const mockAttendance = [
    { id: 'EMP001', name: 'Rahul Sharma',  dept: 'Engineering', clockIn: '09:02', clockOut: '18:10', hours: '9h 08m', status: 'Present',  overtime: '1h 08m' },
    { id: 'EMP002', name: 'Priya Mehta',   dept: 'HR',          clockIn: '09:45', clockOut: '18:00', hours: '8h 15m', status: 'Late',     overtime: '-' },
    { id: 'EMP003', name: 'Amit Verma',    dept: 'Finance',     clockIn: '-',     clockOut: '-',     hours: '-',     status: 'Absent',   overtime: '-' },
    { id: 'EMP004', name: 'Sneha Patil',   dept: 'Marketing',   clockIn: '08:55', clockOut: '17:55', hours: '9h 00m', status: 'Present',  overtime: '-' },
    { id: 'EMP005', name: 'Karan Singh',   dept: 'Engineering', clockIn: '-',     clockOut: '-',     hours: '-',     status: 'Leave',    overtime: '-' },
    { id: 'EMP006', name: 'Anita Joshi',   dept: 'Operations',  clockIn: '09:10', clockOut: '18:30', hours: '9h 20m', status: 'Present',  overtime: '1h 20m' },
    { id: 'EMP007', name: 'Rohan Gupta',   dept: 'IT',          clockIn: '10:00', clockOut: '19:05', hours: '9h 05m', status: 'Late',     overtime: '1h 05m' },
    { id: 'EMP008', name: 'Divya Nair',    dept: 'Engineering', clockIn: '09:00', clockOut: '18:00', hours: '9h 00m', status: 'Present',  overtime: '-' },
];

const Attendance = () => {
    const [activeDate, setActiveDate] = useState(0);

    const summary = {
        present:  mockAttendance.filter(e => e.status === 'Present').length,
        absent:   mockAttendance.filter(e => e.status === 'Absent').length,
        late:     mockAttendance.filter(e => e.status === 'Late').length,
        onLeave:  mockAttendance.filter(e => e.status === 'Leave').length,
    };

    const avatarColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];

    return (
        <DashboardLayout title="Attendance">
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Attendance Tracker</h1>
                        <p>Daily clock-in/clock-out records for all employees</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-secondary">📋 Request Correction</button>
                        <button className="btn-primary">📥 Export Report</button>
                    </div>
                </div>

                {/* Date Selector */}
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

                {/* Summary Cards */}
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

                {/* Table */}
                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Clock In</th>
                                <th>Clock Out</th>
                                <th>Working Hours</th>
                                <th>Overtime</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockAttendance.map((e, i) => (
                                <tr key={e.id}>
                                    <td>
                                        <div className="emp-cell">
                                            <div className="emp-avatar" style={{ background: avatarColors[i % avatarColors.length] }}>
                                                {e.name.split(' ').map(w => w[0]).join('')}
                                            </div>
                                            <div>
                                                <div className="emp-name">{e.name}</div>
                                                <div className="emp-id">{e.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{e.dept}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 13.5, color: e.clockIn !== '-' ? 'var(--text-primary)' : 'var(--text-muted)' }}>{e.clockIn}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 13.5, color: e.clockOut !== '-' ? 'var(--text-primary)' : 'var(--text-muted)' }}>{e.clockOut}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.hours}</td>
                                    <td style={{ color: e.overtime !== '-' ? '#34d399' : 'var(--text-muted)' }}>{e.overtime}</td>
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
                        <span className="table-info">{mockAttendance.length} employees • {today.toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Attendance;
