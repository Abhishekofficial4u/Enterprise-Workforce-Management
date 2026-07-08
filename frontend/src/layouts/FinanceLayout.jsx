import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../features/employees/api/employeeService';
import { getMyNotifications, markAsRead, markAllAsRead } from '../features/notifications/api/notificationService';
import { 
    LayoutDashboard, Users, CircleDollarSign, 
    LineChart, Bell, LogOut, ArrowLeftRight, Landmark, CreditCard, Banknote, Briefcase, FileText
} from 'lucide-react';
import GlobalSearch from '../components/GlobalSearch';
import './FinanceLayout.css';

const financeNavItems = [
    { section: 'Finance Command', items: [
        { label: 'Overview', icon: LayoutDashboard, path: '/finance/dashboard' },
    ]},
    { section: 'Payroll Operations', items: [
        { label: 'Payroll & Salary', icon: CircleDollarSign, path: '/finance/dashboard/payroll' },
        { label: 'Staff Directory', icon: Users, path: '/finance/dashboard/employees' },
    ]},
    { section: 'Analytics', items: [
        { label: 'Financial Reports', icon: LineChart, path: '/finance/dashboard/reports' },
    ]}
];

const FinanceLayout = ({ children, title = 'Finance Department' }) => {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'dark');
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

    const displayName = userProfile?.name || 'Finance Lead';
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    const avatarContent = userProfile?.profilePhoto ? (
        <img src={userProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials;

    return (
        <div className="finance-layout">
            <aside className="finance-sidebar">
                <div className="finance-sidebar-brand">
                    <div className="finance-brand-icon"><Landmark size={24} /></div>
                    <div>
                        <div className="finance-brand-name">Finance</div>
                        <div className="finance-brand-sub">EWM Portal</div>
                    </div>
                </div>

                <nav className="finance-sidebar-nav">
                    {financeNavItems.map(section => (
                        <div key={section.section}>
                            <div className="finance-nav-section-label">{section.section}</div>
                            {section.items.map(item => {
                                const IconComp = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} end={item.path === '/finance/dashboard'} className={({ isActive }) => `finance-nav-item ${isActive ? 'active' : ''}`}>
                                        <span className="finance-nav-icon"><IconComp size={18} /></span>
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="finance-sidebar-footer">
                    <div className="finance-user-profile-mini">
                        <div className="finance-user-avatar">{avatarContent}</div>
                        <div className="finance-user-info-mini">
                            <div className="finance-user-name-mini">{displayName}</div>
                            <div className="finance-user-role-mini">FINANCE</div>
                        </div>
                    </div>
                    <button className="finance-logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <div className="finance-main">
                <div className="finance-topbar glass-panel">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div className="finance-topbar-title">{title}</div>
                        <GlobalSearch />
                    </div>
                    <div className="finance-topbar-actions">
                        <button className="switch-portal-btn finance-btn" onClick={() => navigate('/portal')} title="Switch Portal">
                            <ArrowLeftRight size={16} /> Switch Portal
                        </button>
                        <div className="finance-topbar-badge" onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="finance-badge-dot">{unreadCount}</span>}
                        </div>
                        <div className="finance-user-avatar" onClick={() => navigate('/finance/dashboard/profile')}>
                            {avatarContent}
                        </div>
                    </div>
                </div>

                <div className="finance-content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default FinanceLayout;
