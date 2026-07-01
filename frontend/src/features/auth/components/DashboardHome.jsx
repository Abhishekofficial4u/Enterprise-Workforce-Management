import React from 'react';
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

const statCards = [
    { label: 'Total Employees', value: '248', icon: '👥', color: 'indigo', change: '↑ 12 this month', upDown: 'up' },
    { label: 'Present Today',   value: '211', icon: '✅', color: 'green',  change: '85% attendance rate', upDown: 'up' },
    { label: 'Leave Requests',  value: '14',  icon: '📋', color: 'amber',  change: '↓ 3 vs last week',    upDown: 'down' },
    { label: 'Open Tickets',    value: '7',   icon: '🎫', color: 'red',    change: '2 critical',           upDown: 'down' },
];

const modules = [
    { icon: '🔐', label: 'Authentication',  status: 'live' },
    { icon: '👥', label: 'HR Management',   status: 'live' },
    { icon: '📅', label: 'Attendance',      status: 'coming' },
    { icon: '💰', label: 'Payroll',         status: 'coming' },
    { icon: '🤖', label: 'AI Assistant',    status: 'coming' },
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
    const role = localStorage.getItem('userRole') || 'EMPLOYEE';
    const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <DashboardLayout title="Dashboard">
            <div className="dashboard-home">

                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-text">
                        <h2>Good day, {role.replace('_', ' ')} 👋</h2>
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
                            {[
                                { icon: '➕', label: 'Add Employee' },
                                { icon: '📋', label: 'Apply Leave' },
                                { icon: '💰', label: 'Run Payroll' },
                                { icon: '🎯', label: 'Post Job' },
                                { icon: '📊', label: 'Reports' },
                                { icon: '🤖', label: 'AI Chat' },
                            ].map(a => (
                                <button key={a.label} className="quick-action-btn">
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
                                <div key={m.label} className="module-pill">
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
