import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

const attendanceData = [
    { day: 'Mon', present: 87, absent: 13 },
    { day: 'Tue', present: 91, absent: 9  },
    { day: 'Wed', present: 78, absent: 22 },
    { day: 'Thu', present: 95, absent: 5  },
    { day: 'Fri', present: 83, absent: 17 },
    { day: 'Sat', present: 60, absent: 40 },
];

const recentActivity = [
    { color: 'green',  text: 'Rahul Sharma clocked in',            sub: 'Attendance • Engineering',   time: '2 min ago' },
    { color: 'indigo', text: 'New employee profile created',        sub: 'HR • Marketing Dept',        time: '15 min ago' },
    { color: 'amber',  text: 'Leave request pending review',        sub: 'Leave • Priya Mehta',        time: '32 min ago' },
    { color: 'sky',    text: 'Payroll processing started',          sub: 'Finance • June 2026',        time: '1 hr ago' },
    { color: 'red',    text: 'Support ticket raised #TKT-1082',     sub: 'Help Desk • IT',             time: '2 hr ago' },
];

const modules = [
    { icon: '🔐', label: 'Auth & Security',  status: 'live', path: '/dashboard/vault' },
    { icon: '👥', label: 'HR Management',    status: 'live', path: '/dashboard/employees' },
    { icon: '📅', label: 'Time & Attendance',status: 'live', path: '/dashboard/attendance' },
    { icon: '💰', label: 'Payroll & Leave',  status: 'live', path: '/dashboard/payroll' },
    { icon: '🎯', label: 'ATS Recruitment',  status: 'live', path: '/dashboard/recruitment' },
    { icon: '🏆', label: 'Performance',      status: 'live', path: '/dashboard/performance' },
    { icon: '🚀', label: 'Projects Kanban',  status: 'live', path: '/dashboard/projects' },
    { icon: '🎫', label: 'Help Desk',        status: 'live', path: '/dashboard/helpdesk' },
    { icon: '💻', label: 'Asset Management', status: 'live', path: '/dashboard/assets' },
    { icon: '📈', label: 'Reports',          status: 'live', path: '/dashboard/reports' },
    { icon: '🤖', label: 'AI Assistant',     status: 'coming' },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', padding: '10px 14px', borderRadius: 8 }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label}</p>
                <p style={{ color: '#818cf8', fontSize: 14, fontWeight: 600 }}>Present: {payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') || 'EMPLOYEE';
    const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const [todayAttendance, setTodayAttendance] = useState(null);
    const [attLoading, setAttLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        import('../../employees/api/employeeService').then(({ getMyProfile }) => {
            getMyProfile().then(res => setUserProfile(res.data)).catch(() => {});
        });
        if (role === 'EMPLOYEE') {
            import('../../attendance/api/attendanceService').then(({ getMyAttendance }) => {
                getMyAttendance().then(res => {
                    const todayStr = new Date().toISOString().split('T')[0];
                    const record = res.data?.find(a => a.date === todayStr);
                    if (record) setTodayAttendance(record);
                }).catch(console.error);
            });
        }
    }, [role]);

    const handleClock = async () => {
        if (todayAttendance?.clockOut) return;
        setAttLoading(true);
        try {
            const { clockIn, clockOut } = await import('../../attendance/api/attendanceService');
            if (todayAttendance && !todayAttendance.clockOut) {
                const res = await clockOut();
                setTodayAttendance(res.data);
                alert('Clocked out successfully!');
            } else if (!todayAttendance) {
                const res = await clockIn();
                setTodayAttendance(res.data);
                alert('Clocked in successfully!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error clocking in/out');
        } finally {
            setAttLoading(false);
        }
    };

    let statCards = [];
    let quickActions = [];

    if (role === 'SUPER_ADMIN' || role === 'HR_MANAGER') {
        statCards = [
            { label: 'Total Employees', value: '248', icon: '👥', color: 'indigo', change: '↑ 12 this month', upDown: 'up' },
            { label: 'Present Today',   value: '211', icon: '✅', color: 'green',  change: '85% attendance rate', upDown: 'up' },
            { label: 'Leave Requests',  value: '14',  icon: '📋', color: 'amber',  change: '↓ 3 vs last week',    upDown: 'down' },
            { label: 'Open Tickets',    value: '7',   icon: '🎫', color: 'red',    change: '2 critical',           upDown: 'down' },
        ];
        quickActions = [
            { icon: '➕', label: 'Add Employee' },
            { icon: '📋', label: 'Review Leave', onClick: () => navigate('/dashboard/leave') },
            { icon: '💰', label: 'Run Payroll', onClick: () => navigate('/dashboard/payroll') },
            { icon: '🎯', label: 'Post Job', onClick: () => navigate('/dashboard/recruitment') },
            { icon: '📊', label: 'Reports', onClick: () => navigate('/dashboard/reports') },
            { icon: '🤖', label: 'AI Chat', onClick: () => navigate('/dashboard/ai-assistant') },
        ];
    } else {
        const totalLeave = userProfile?.leaveBalance ? 
            (userProfile.leaveBalance.casual || 0) + (userProfile.leaveBalance.sick || 0) + (userProfile.leaveBalance.earned || 0) 
            : 0;

        statCards = [
            { label: 'My Leave Balance', value: totalLeave.toString(), icon: '🌴', color: 'indigo', change: 'Available days', upDown: 'up' },
            { label: 'Hours This Week',  value: '36', icon: '⏱️', color: 'green',  change: '4 hours remaining', upDown: 'up' },
            { label: 'Pending Approvals',value: '1',  icon: '📋', color: 'amber',  change: 'Sick Leave',    upDown: 'down' },
            { label: 'My Tickets',       value: '0',  icon: '🎫', color: 'red',    change: 'All resolved',  upDown: 'up' },
        ];
        quickActions = [
            { 
                icon: '⏱️', 
                label: attLoading ? 'Wait...' : (todayAttendance ? (todayAttendance.clockOut ? 'Clocked Out' : 'Clock Out') : 'Clock In'),
                onClick: handleClock,
                disabled: !!todayAttendance?.clockOut || attLoading
            },
            { icon: '📋', label: 'Apply Leave', onClick: () => navigate('/dashboard/leave') },
            { icon: '💰', label: 'Payslips', onClick: () => navigate('/dashboard/payroll') },
            { icon: '🎫', label: 'IT Help', onClick: () => navigate('/dashboard/helpdesk') },
        ];
    }

    return (
        <DashboardLayout title="Dashboard">
            <div className="dashboard-home">

                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h2>Good day, {userProfile?.name || role.replace('_', ' ')} 👋</h2>
                        <p>Here's your workforce overview for today. Everything looks on track.</p>
                    </div>
                    <div className="welcome-date">{now}</div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {statCards.map(card => (
                        <div key={card.label} className={`stat-card ${card.color}`}>
                            <div className="stat-header">
                                <span className="stat-label">{card.label}</span>
                                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                            </div>
                            <div className="stat-value">{card.value}</div>
                            <div className="stat-change">
                                <span className={card.upDown}>{card.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Middle Row: Chart + Quick Actions */}
                <div className="middle-row">
                    {/* Attendance Chart */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Weekly Attendance Trend</span>
                            <span className="card-badge">This Week</span>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={attendanceData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={2.5}
                                    fill="url(#colorPresent)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Quick Actions</span>
                        </div>
                        <div className="quick-actions">
                            {quickActions.map(a => (
                                <button key={a.label} className="quick-action-btn" onClick={a.onClick} disabled={a.disabled} style={{ opacity: a.disabled ? 0.5 : 1, cursor: a.disabled ? 'not-allowed' : 'pointer' }}>
                                    <span className="qa-icon">{a.icon}</span>
                                    <span className="qa-label">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Activity + Modules Status */}
                <div className="bottom-row">
                    {/* Recent Activity */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Recent Activity</span>
                            <span className="card-badge">Live</span>
                        </div>
                        <div className="activity-list">
                            {recentActivity.map((a, i) => (
                                <div key={i} className="activity-item">
                                    <div className={`activity-dot ${a.color}`}></div>
                                    <div className="activity-text">
                                        <strong>{a.text}</strong>
                                        <span>{a.sub}</span>
                                    </div>
                                    <span className="activity-time">{a.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Module Status */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Module Status</span>
                        </div>
                        <div className="module-pills">
                            {modules.map(m => (
                                <div key={m.label} className="module-pill" onClick={() => m.status === 'live' && navigate(m.path || '#')} style={{ cursor: m.status === 'live' ? 'pointer' : 'default' }}>
                                    <span className="module-pill-icon">{m.icon}</span>
                                    <span className="module-pill-label">{m.label}</span>
                                    <span className={`pill-status ${m.status}`}>
                                        {m.status === 'live' ? '● Live' : '◌ Coming'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default DashboardHome;
