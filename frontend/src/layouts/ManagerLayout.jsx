import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../features/employees/api/employeeService';
import { getMyNotifications, markAsRead, markAllAsRead } from '../features/notifications/api/notificationService';
import { 
    LayoutDashboard, Users, Target, Rocket, 
    CalendarCheck, Bell, LogOut, ArrowLeftRight, Briefcase, Network, CalendarDays
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import './ManagerLayout.css';

const managerNavItems = [
    { section: 'Team Management', items: [
        { label: 'Manager Dashboard', icon: LayoutDashboard, path: '/manager/dashboard' },
        { label: 'My Team', icon: Users, path: '/manager/dashboard/employees' },
        { label: 'Organization Chart', icon: Network, path: '/manager/dashboard/org-chart' },
    ]},
    { section: 'Operations', items: [
        { label: 'Projects & Tasks', icon: Rocket, path: '/manager/dashboard/projects' },
        { label: 'Team Attendance', icon: CalendarCheck, path: '/manager/dashboard/attendance' },
        { label: 'Leave Approvals', icon: CalendarCheck, path: '/manager/dashboard/leave' },
        { label: 'Shift Scheduling', icon: CalendarDays, path: '/manager/dashboard/shifts' },
        { label: 'Performance', icon: Target, path: '/manager/dashboard/performance' },
    ]}
];

const ManagerLayout = ({ children, title = 'Manager Portal' }) => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'light');
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

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/');
    };

    const displayName = userProfile?.name || 'Team Manager';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const avatarContent = userProfile?.profilePhoto ? (
        <img src={userProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials;

    return (
        <div className="manager-layout">
            <aside className="manager-sidebar">
                <div className="manager-sidebar-brand">
                    <div className="manager-brand-icon"><Briefcase size={22} /></div>
                    <div>
                        <div className="manager-brand-name">Manager Workspace</div>
                        <div className="manager-brand-sub">EWM Portal</div>
                    </div>
                </div>

                <nav className="manager-sidebar-nav">
                    {managerNavItems.map(section => (
                        <div key={section.section}>
                            <div className="manager-nav-section-label">{section.section}</div>
                            {section.items.map(item => {
                                const IconComp = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} end={item.path === '/manager/dashboard'} className={({ isActive }) => `manager-nav-item ${isActive ? 'active' : ''}`}>
                                        <span className="manager-nav-icon"><IconComp size={18} /></span>
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="manager-sidebar-footer">
                    <div className="manager-user-profile-mini">
                        <div className="manager-user-avatar">{avatarContent}</div>
                        <div className="manager-user-info-mini">
                            <div className="manager-user-name-mini">{displayName}</div>
                            <div className="manager-user-role-mini">TEAM_LEAD</div>
                        </div>
                    </div>
                    <button className="manager-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="manager-main">
                <div className="manager-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div className="manager-topbar-title">{title}</div>
                        <GlobalSearch />
                    </div>
                    <div className="manager-topbar-actions">
                        <button className="switch-portal-btn manager-btn" onClick={() => navigate('/portal')} title="Switch Portal">
                            <ArrowLeftRight size={16} /> Switch Portal
                        </button>
                        <div className="manager-topbar-badge" onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="manager-badge-dot">{unreadCount}</span>}
                        </div>
                        <div className="manager-user-avatar" onClick={() => navigate('/manager/dashboard/profile')}>
                            {avatarContent}
                        </div>
                    </div>
                </div>

                <div className="manager-content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default ManagerLayout;
