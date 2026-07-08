import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../features/employees/api/employeeService';
import { getMyNotifications, markAsRead, markAllAsRead } from '../features/notifications/api/notificationService';
import { 
    LayoutDashboard, CalendarCheck, Palmtree, 
    CircleDollarSign, User, Ticket, Bell,    LogOut, ArrowLeftRight, CreditCard, Banknote, Users, Briefcase, FileText,
    GraduationCap
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import './EmployeeLayout.css';

const employeeNavItems = [
    { section: 'My Workspace', items: [
        { label: 'My Dashboard', icon: LayoutDashboard, path: '/employee/dashboard' },
        { label: 'My Profile', icon: User, path: '/employee/dashboard/profile' },
        { label: 'My Learning', icon: GraduationCap, path: '/employee/dashboard/learning' },
    ]},
    { section: 'Time & Pay', items: [
        { label: 'My Attendance', icon: CalendarCheck, path: '/employee/dashboard/attendance' },
        { label: 'My Leaves', icon: Palmtree, path: '/employee/dashboard/leave' },
        { label: 'My Payslips', icon: CircleDollarSign, path: '/employee/dashboard/payroll' },
    ]},
    { section: 'Support', items: [
        { label: 'IT Help Desk', icon: Ticket, path: '/employee/dashboard/helpdesk' },
    ]}
];

const EmployeeLayout = ({ children, title = 'Employee Self Service' }) => {
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

    const displayName = userProfile?.name || 'Employee';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const avatarContent = userProfile?.profilePhoto ? (
        <img src={userProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials;

    return (
        <div className="employee-layout">
            <aside className="employee-sidebar">
                <div className="employee-sidebar-brand">
                    <div className="employee-brand-icon">E</div>
                    <div>
                        <div className="employee-brand-name">Employee Portal</div>
                        <div className="employee-brand-sub">Self Service</div>
                    </div>
                </div>

                <nav className="employee-sidebar-nav">
                    {employeeNavItems.map(section => (
                        <div key={section.section}>
                            <div className="employee-nav-section-label">{section.section}</div>
                            {section.items.map(item => {
                                const IconComp = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} end={item.path === '/employee/dashboard'} className={({ isActive }) => `employee-nav-item ${isActive ? 'active' : ''}`}>
                                        <span className="employee-nav-icon"><IconComp size={18} /></span>
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="employee-sidebar-footer">
                    <div className="employee-user-profile-mini">
                        <div className="employee-user-avatar">{avatarContent}</div>
                        <div className="employee-user-info-mini">
                            <div className="employee-user-name-mini">{displayName}</div>
                            <div className="employee-user-role-mini">EMPLOYEE</div>
                        </div>
                    </div>
                    <button className="employee-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="employee-main">
                <div className="employee-topbar glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div className="employee-topbar-title">{title}</div>
                        <GlobalSearch />
                    </div>
                    <div className="employee-topbar-actions">
                        <button className="switch-portal-btn employee-btn" onClick={() => navigate('/portal')} title="Switch Portal">
                            <ArrowLeftRight size={16} /> Switch Portal
                        </button>
                        <div className="employee-topbar-badge" onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="employee-badge-dot">{unreadCount}</span>}
                        </div>
                        <div className="employee-user-avatar" onClick={() => navigate('/employee/dashboard/profile')}>
                            {avatarContent}
                        </div>
                    </div>
                </div>

                <div className="employee-content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default EmployeeLayout;
