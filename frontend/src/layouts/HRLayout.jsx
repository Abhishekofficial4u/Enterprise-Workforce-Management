import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../features/employees/api/employeeService';
import { getMyNotifications, markAsRead, markAllAsRead } from '../features/notifications/api/notificationService';
import { 
    LayoutDashboard, Users, Target, Award, 
    CalendarCheck, Palmtree, LineChart, 
    Bell, Settings, LogOut, ArrowLeftRight, Briefcase, FileText,
    Megaphone, GraduationCap, Bot
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import NotificationsBadge from '../features/notifications/components/NotificationsBadge';
import './HRLayout.css';

const hrNavItems = [
    { section: 'HR Command Center', items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/hr/dashboard' },
    ]},
    { section: 'Core HR', items: [
        { label: 'Employee Directory', icon: Users, path: '/hr/dashboard/employees' },
        { label: 'Recruitment (ATS)', icon: Target, path: '/hr/dashboard/recruitment' },
        { label: 'Performance Reviews', icon: Award, path: '/hr/dashboard/performance' },
    ]},
    { section: 'Operations', items: [
        { label: 'Attendance Hub', icon: CalendarCheck, path: '/hr/dashboard/attendance' },
        { label: 'Leave Management', icon: Palmtree, path: '/hr/dashboard/leave' },
        { label: 'Payroll Management', icon: FileText, path: '/hr/dashboard/payroll' },
        { label: 'Announcements', icon: Megaphone, path: '/hr/dashboard/announcements' },
        { label: 'Training & Dev', icon: GraduationCap, path: '/hr/dashboard/training' },
    ]},
    { section: 'Analytics', items: [
        { label: 'HR Reports', icon: LineChart, path: '/hr/dashboard/reports' },
        { label: 'AI Assistant', icon: Bot, path: '/hr/dashboard/ai-assistant' },
    ]}
];

const HRLayout = ({ children, title = 'Human Resources' }) => {
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

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/');
    };

    const displayName = userProfile?.name || 'HR Manager';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const avatarContent = userProfile?.profilePhoto ? (
        <img src={userProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials;

    return (
        <div className="hr-layout">
            <aside className="hr-sidebar">
                <div className="hr-sidebar-brand">
                    <div className="hr-brand-icon">HR</div>
                    <div>
                        <div className="hr-brand-name">Human Resources</div>
                        <div className="hr-brand-sub">EWM Portal</div>
                    </div>
                </div>

                <nav className="hr-sidebar-nav">
                    {hrNavItems.map(section => (
                        <div key={section.section}>
                            <div className="hr-nav-section-label">{section.section}</div>
                            {section.items.map(item => {
                                const IconComp = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} end={item.path === '/hr/dashboard'} className={({ isActive }) => `hr-nav-item ${isActive ? 'active' : ''}`}>
                                        <span className="hr-nav-icon"><IconComp size={18} /></span>
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="hr-sidebar-footer">
                    <div className="hr-user-profile-mini">
                        <div className="hr-user-avatar">{avatarContent}</div>
                        <div className="hr-user-info-mini">
                            <div className="hr-user-name-mini">{displayName}</div>
                            <div className="hr-user-role-mini">HR_MANAGER</div>
                        </div>
                    </div>
                    <button className="hr-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="hr-main">
                <div className="hr-topbar glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div className="hr-topbar-title">{title}</div>
                        <GlobalSearch />
                    </div>
                    <div className="hr-topbar-actions">
                        <button className="switch-portal-btn hr-btn" onClick={() => navigate('/portal')} title="Switch Portal">
                            <ArrowLeftRight size={16} /> Switch Portal
                        </button>
                        <NotificationsBadge />
                        <div className="hr-user-avatar" onClick={() => navigate('/hr/dashboard/profile')}>
                            {avatarContent}
                        </div>
                    </div>
                </div>

                <div className="hr-content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default HRLayout;
