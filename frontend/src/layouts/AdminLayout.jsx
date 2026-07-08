import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../features/employees/api/employeeService';
import { getMyNotifications, markAsRead, markAllAsRead } from '../features/notifications/api/notificationService';
import { 
    LayoutDashboard, Users, Target, Award, 
    CalendarCheck, Palmtree, CircleDollarSign, 
    FolderKanban, Ticket, Laptop2, 
    Bot, LineChart, Bell, Settings, LogOut, Key, ArrowLeftRight, Network, CalendarDays, ShieldCheck
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import NotificationsBadge from '../features/notifications/components/NotificationsBadge';
import './AdminLayout.css';

import { usePermissions } from '../hooks/usePermissions';

const adminNavItems = [
    { section: 'Admin Overview', items: [
        { label: 'System Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ]},
    { section: 'Security & Access', items: [
        { label: 'Credentials Vault', icon: Key, path: '/admin/dashboard/vault' },
        { label: 'Audit Logs', icon: ShieldCheck, path: '/admin/dashboard/audit' },
        { label: 'Assets', icon: Laptop2, path: '/admin/dashboard/assets' },
        { label: 'System Help Desk', icon: Ticket, path: '/admin/dashboard/helpdesk' },
    ]},
    { section: 'Intelligence', items: [
        { label: 'AI Analytics', icon: Bot, path: '/admin/dashboard/ai-assistant' },
        { label: 'Global Reports', icon: LineChart, path: '/admin/dashboard/reports' },
    ]},
    { section: 'All Features (Unrestricted)', items: [
        { label: 'Employees', icon: Users, path: '/admin/dashboard/employees' },
        { label: 'Org Chart', icon: Network, path: '/admin/dashboard/org-chart' },
        { label: 'Recruitment', icon: Target, path: '/admin/dashboard/recruitment' },
        { label: 'Performance', icon: Award, path: '/admin/dashboard/performance' },
        { label: 'Attendance', icon: CalendarCheck, path: '/admin/dashboard/attendance' },
        { label: 'Leave', icon: Palmtree, path: '/admin/dashboard/leave' },
        { label: 'Shifts', icon: CalendarDays, path: '/admin/dashboard/shifts' },
        { label: 'Payroll', icon: CircleDollarSign, path: '/admin/dashboard/payroll' },
        { label: 'Projects', icon: FolderKanban, path: '/admin/dashboard/projects' },
    ]}
];

const AdminLayout = ({ children, title = 'System Admin' }) => {
    const navigate = useNavigate();
    const { hasAnyPermission } = usePermissions();
    const [userProfile, setUserProfile] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'dark');
    
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        getMyProfile().then(res => setUserProfile(res.data)).catch(() => {});
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await getMyNotifications();
            setNotifications(res.data || []);
            setUnreadCount(res.unreadCount || 0);
        } catch (error) {}
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markAsRead(id);
            fetchNotifications();
        } catch (error) {}
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            fetchNotifications();
            setShowNotifications(false);
        } catch (error) {}
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/');
    };

    const displayName = userProfile?.name || 'Super Admin';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const avatarContent = userProfile?.profilePhoto ? (
        <img src={userProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar glass-panel">
                <div className="admin-sidebar-brand">
                    <img src="/logo.png" alt="EWM Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <div>
                        <div className="admin-brand-name">EWM Admin</div>
                        <div className="admin-brand-sub">System Control</div>
                    </div>
                </div>

                <nav className="admin-sidebar-nav">
                    {adminNavItems.map(section => (
                        <div key={section.section}>
                            <div className="admin-nav-section-label">{section.section}</div>
                            {section.items.map(item => {
                                const IconComp = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} end={item.path === '/admin/dashboard'} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
                                        <span className="admin-nav-icon"><IconComp size={18} /></span>
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-profile-mini">
                        <div className="admin-user-avatar">{avatarContent}</div>
                        <div className="admin-user-info-mini">
                            <div className="admin-user-name-mini">{displayName}</div>
                            <div className="admin-user-role-mini">SUPER_ADMIN</div>
                        </div>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="admin-main">
                <div className="admin-topbar glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div className="admin-topbar-title">{title}</div>
                        <GlobalSearch />
                    </div>
                    <div className="admin-topbar-actions">
                        <button className="switch-portal-btn" onClick={() => navigate('/portal')} title="Switch Portal">
                            <ArrowLeftRight size={16} /> Switch Portal
                        </button>
                        <NotificationsBadge />
                        <div className="admin-topbar-badge" onClick={toggleTheme} title="Toggle Theme">
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </div>
                        <div className="admin-user-avatar" onClick={() => navigate('/admin/dashboard/profile')} title="My Profile">
                            {avatarContent}
                        </div>
                    </div>
                </div>

                <div className="admin-content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
