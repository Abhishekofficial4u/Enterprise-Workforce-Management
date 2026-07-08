import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
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
            <div className="ewm-card" style={{ padding: '10px 14px' }}>
                <p style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>{label || payload[0].name}</p>
                <p style={{ color: '#818cf8', fontSize: 14, fontWeight: 600 }}>{payload[0].name === 'present' ? 'Present: ' : ''}{payload[0].value}{payload[0].name === 'present' ? '%' : ''}</p>
            </div>
        );
    }
    return null;
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const [todayAttendance, setTodayAttendance] = useState(null);
    const [attLoading, setAttLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    // Real Data State for Admins
    const [realStats, setRealStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        leaveRequests: 0,
        openTickets: 0,
        departmentStats: []
    });

    const userRolesStr = localStorage.getItem('userRoles');
    const userRoles = userRolesStr ? JSON.parse(userRolesStr) : [];
    
    // Determine primary role for display logic
    let role = localStorage.getItem('userRole') || 'EMPLOYEE';
    if (userRoles.includes('SUPER_ADMIN')) role = 'SUPER_ADMIN';
    else if (userRoles.includes('HR_MANAGER')) role = 'HR_MANAGER';
    else if (userRoles.includes('FINANCE')) role = 'FINANCE';
    else if (userRoles.includes('MANAGER') || userRoles.includes('TEAM_LEAD')) role = 'MANAGER';

    useEffect(() => {
        import('../../employees/api/employeeService').then(({ getMyProfile }) => {
            getMyProfile().then(res => setUserProfile(res.data)).catch(() => {});
        });
        import('../api/announcementService').then(({ getAnnouncements }) => {
            getAnnouncements().then(res => setAnnouncements(res.data)).catch(() => {});
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
        if (role === 'SUPER_ADMIN' || role === 'HR_MANAGER') {
            const fetchRealStats = async () => {
                try {
                    const { getEmployees } = await import('../../employees/api/employeeService');
                    const { getAllAttendance } = await import('../../attendance/api/attendanceService');
                    const { getAllLeaves } = await import('../../payroll/api/leaveService');
                    const { getAllTickets } = await import('../../helpdesk/api/helpdeskService');

                    const [empRes, attRes, leaveRes, tktRes] = await Promise.all([
                        getEmployees(),
                        getAllAttendance(new Date().toISOString().split('T')[0]),
                        getAllLeaves(),
                        getAllTickets()
                    ]);

                    const employees = empRes.data || [];
                    const deptCounts = {};
                    employees.forEach(emp => {
                        const dept = emp.department || 'Unassigned';
                        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
                    });
                    
                    const departmentStats = Object.keys(deptCounts).map(dept => ({
                        name: dept,
                        value: deptCounts[dept]
                    }));

                    setRealStats({
                        totalEmployees: employees.length,
                        presentToday: attRes.data.filter(a => a.clockIn).length,
                        leaveRequests: leaveRes.data.filter(l => l.status === 'Pending').length,
                        openTickets: tktRes.data.filter(t => t.status === 'Open').length,
                        departmentStats
                    });
                } catch (e) {
                    console.error('Failed to fetch real stats', e);
                }
            };
            fetchRealStats();
        }
    }, [role]);

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    (error) => {
                        reject(new Error("Location access denied. You must allow location to clock in/out."));
                    }
                );
            }
        });
    };

    const handleClock = async () => {
        if (todayAttendance?.clockOut) return;
        setAttLoading(true);
        try {
            const location = await getCurrentLocation();
            
            const { clockIn, clockOut } = await import('../../attendance/api/attendanceService');
            if (todayAttendance && !todayAttendance.clockOut) {
                const res = await clockOut(location);
                setTodayAttendance(res.data);
                alert('Clocked out successfully!');
            } else if (!todayAttendance) {
                const res = await clockIn(location);
                setTodayAttendance(res.data);
                alert('Clocked in successfully!');
            }
        } catch (err) {
            alert(err.message || err.response?.data?.message || 'Error clocking in/out');
        } finally {
            setAttLoading(false);
        }
    };

    let statCards = [];
    let quickActions = [];

    if (role === 'SUPER_ADMIN') {
        const attRate = realStats.totalEmployees > 0 
            ? Math.round((realStats.presentToday / realStats.totalEmployees) * 100) 
            : 0;
            
        statCards = [
            { label: 'Total Workforce', value: realStats.totalEmployees.toString(), icon: '👥', color: 'indigo', change: 'Live from DB', upDown: 'up' },
            { label: 'System Active Users', value: realStats.presentToday.toString(), icon: '✅', color: 'green',  change: `${attRate}% online rate`, upDown: 'up' },
            { label: 'Pending Leaves',  value: realStats.leaveRequests.toString(),  icon: '📋', color: 'amber',  change: 'Awaiting approval',    upDown: 'down' },
            { label: 'Open IT Tickets',    value: realStats.openTickets.toString(),   icon: '🎫', color: 'red',    change: 'Needs attention',           upDown: 'down' },
            { label: 'Server Status',    value: '99.9%',   icon: '⚡', color: 'emerald',    change: 'All systems operational',           upDown: 'up' },
            { label: 'Storage Used',    value: '42%',   icon: '💾', color: 'sky',    change: '256GB / 500GB',           upDown: 'up' },
        ];
        quickActions = [
            { icon: '➕', label: 'New User', onClick: () => navigate('/admin/dashboard/employees') },
            { icon: '🔐', label: 'Vault', onClick: () => navigate('/admin/dashboard/vault') },
            { icon: '📋', label: 'Review Leave', onClick: () => navigate('/admin/dashboard/leave') },
            { icon: '🎫', label: 'Help Desk', onClick: () => navigate('/admin/dashboard/helpdesk') },
            { icon: '📊', label: 'Sys Reports', onClick: () => navigate('/admin/dashboard/reports') },
            { icon: '🤖', label: 'AI Settings', onClick: () => navigate('/admin/dashboard/ai-assistant') },
        ];
    } else if (role === 'HR_MANAGER') {
        const attRate = realStats.totalEmployees > 0 ? Math.round((realStats.presentToday / realStats.totalEmployees) * 100) : 0;
        statCards = [
            { label: 'Headcount', value: realStats.totalEmployees.toString(), icon: '👥', color: 'indigo', change: 'Total employees', upDown: 'up' },
            { label: 'Attendance Rate', value: `${attRate}%`, icon: '📈', color: 'green',  change: 'Across all deps', upDown: 'up' },
            { label: 'Pending Leaves',  value: realStats.leaveRequests.toString(),  icon: '📋', color: 'amber',  change: 'Needs approval',    upDown: 'down' },
            { label: 'Open Requisitions', value: '4', icon: '🎯', color: 'rose', change: 'Hiring pipeline', upDown: 'up' }
        ];
        quickActions = [
            { icon: '➕', label: 'Add Employee', onClick: () => navigate('/hr/dashboard/employees') },
            { icon: '📢', label: 'News/Events', onClick: () => navigate('/hr/dashboard/announcements') },
            { icon: '🎓', label: 'Training', onClick: () => navigate('/hr/dashboard/training') },
            { icon: '🎯', label: 'Post Job', onClick: () => navigate('/hr/dashboard/recruitment') },
        ];
    } else if (role === 'FINANCE') {
        statCards = [
            { label: 'Est. Payroll (Mo)', value: '$124,500', icon: '💰', color: 'emerald', change: 'This month', upDown: 'up' },
            { label: 'Pending Expenses', value: '12', icon: '🧾', color: 'amber',  change: 'Awaiting payout', upDown: 'down' },
            { label: 'Tax Deductions',  value: '$28,400',  icon: '🏛️', color: 'indigo',  change: 'Processed',    upDown: 'up' },
            { label: 'Discrepancies', value: '0', icon: '✅', color: 'green', change: 'All cleared', upDown: 'up' }
        ];
        quickActions = [
            { icon: '💰', label: 'Run Payroll', onClick: () => navigate('/finance/dashboard/payroll') },
            { icon: '🧾', label: 'Expenses', onClick: () => navigate('/finance/dashboard/reports') },
            { icon: '📊', label: 'Fin Reports', onClick: () => navigate('/finance/dashboard/reports') },
        ];
    } else if (role === 'MANAGER' || role === 'TEAM_LEAD') {
        statCards = [
            { label: 'My Team Size', value: '8', icon: '👥', color: 'indigo', change: 'Direct reports', upDown: 'up' },
            { label: 'Team Present Today', value: '7', icon: '✅', color: 'green',  change: '1 on leave', upDown: 'up' },
            { label: 'Pending Approvals',  value: '3',  icon: '📋', color: 'amber',  change: 'Leaves & Timesheets',    upDown: 'down' },
            { label: 'Active Projects', value: '5', icon: '🚀', color: 'sky', change: 'On track', upDown: 'up' }
        ];
        quickActions = [
            { icon: '👥', label: 'View Team', onClick: () => navigate('/manager/dashboard/employees') },
            { icon: '📋', label: 'Approve Leaves', onClick: () => navigate('/manager/dashboard/leave') },
            { icon: '🚀', label: 'Projects', onClick: () => navigate('/manager/dashboard/projects') },
            { icon: '🏆', label: 'Review Team', onClick: () => navigate('/manager/dashboard/performance') },
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
            { icon: '📋', label: 'Apply Leave', onClick: () => navigate('/employee/dashboard/leave') },
            { icon: '💰', label: 'Payslips', onClick: () => navigate('/employee/dashboard/payroll') },
            { icon: '🎫', label: 'IT Help', onClick: () => navigate('/employee/dashboard/helpdesk') },
            { icon: '🎓', label: 'My Learning', onClick: () => navigate('/employee/dashboard/learning') },
        ];
    }

    return (
        <>
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
                                <RechartsTooltip content={<CustomTooltip />} />
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

                {/* Optional Department Analytics for Admin/HR */}
                {(role === 'SUPER_ADMIN' || role === 'HR_MANAGER') && realStats.departmentStats?.length > 0 && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">Department Distribution</span>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie 
                                    data={realStats.departmentStats} 
                                    dataKey="value" 
                                    nameKey="name" 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                >
                                    {realStats.departmentStats.map((entry, index) => {
                                        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Announcements / Bulletin Board */}
                {announcements.length > 0 && (
                    <div className="card" style={{ marginBottom: 24 }}>
                        <div className="card-header">
                            <span className="card-title">Company Bulletin Board</span>
                            <span className="card-badge">Latest Updates</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
                            {announcements.map(ann => (
                                <div key={ann._id} style={{ padding: '16px', border: '1px solid #1e293b', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '15px' }}>{ann.title}</h4>
                                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: ann.type === 'Work Anniversary' ? '#10b98120' : '#6366f120', color: ann.type === 'Work Anniversary' ? '#34d399' : '#818cf8' }}>
                                            {ann.type}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: '1.4' }}>{ann.content}</p>
                                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
        </>
    );
};

export default DashboardHome;
