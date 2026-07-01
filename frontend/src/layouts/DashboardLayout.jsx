import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';

const navItems = [
    { section: 'Overview', items: [
        { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    ]},
    { section: 'HR Management', items: [
        { label: 'Employees', icon: '👥', path: '/dashboard/employees' },
        { label: 'Recruitment', icon: '🎯', path: '/dashboard/recruitment' },
        { label: 'Performance', icon: '🏆', path: '/dashboard/performance' },
    ]},
    { section: 'Operations', items: [
        { label: 'Attendance', icon: '📅', path: '/dashboard/attendance' },
        { label: 'Leave', icon: '🌴', path: '/dashboard/leave' },
        { label: 'Payroll', icon: '💰', path: '/dashboard/payroll' },
    ]},
    { section: 'Workspace', items: [
        { label: 'Projects', icon: '🗂️', path: '/dashboard/projects' },
        { label: 'Help Desk', icon: '🎫', path: '/dashboard/helpdesk' },
        { label: 'Assets', icon: '💻', path: '/dashboard/assets' },
    ]},
    { section: 'Intelligence', items: [
        { label: 'AI Assistant', icon: '🤖', path: '/dashboard/ai-assistant' },
        { label: 'Reports', icon: '📈', path: '/dashboard/reports' },
    ]},
];

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') || 'EMPLOYEE';

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const roleLabel = role.replace('_', ' ');
    const initials = roleLabel.split(' ').map(w => w[0]).join('').toUpperCase();

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">🏢</div>
                    <div>
                        <div className="sidebar-brand-name">EnterpriseWFM</div>
                        <div className="sidebar-brand-sub">Workforce Platform</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(section => (
                        <div key={section.section}>
                            <div className="nav-section-label">{section.section}</div>
                            {section.items.map(item => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/dashboard'}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-mini">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info-mini">
                            <div className="user-name-mini">{roleLabel}</div>
                            <div className="user-role-mini">Authenticated User</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Top Bar */}
                <div className="dashboard-topbar">
                    <div className="topbar-title">{title}</div>
                    <div className="topbar-actions">
                        <div className="topbar-badge">
                            🔔
                            <span className="badge-dot"></span>
                        </div>
                        <div className="topbar-badge">⚙️</div>
                        <div className="user-avatar" style={{ cursor: 'pointer' }}>{initials}</div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="dashboard-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
