import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../features/employees/api/employeeService';
import { getMyNotifications, markAsRead, markAllAsRead } from '../features/notifications/api/notificationService';
import { 
    LayoutDashboard, Users, Target, Award, 
    CalendarCheck, Palmtree, CircleDollarSign, 
    FolderKanban, Ticket, Laptop2, 
    Bot, LineChart, Bell, Settings, LogOut, Key
} from 'lucide-react';
import './DashboardLayout.css';

const navItems = [
    { section: 'Overview', allowedRoles: ['ALL'], items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    ]},
    { section: 'HR Management', allowedRoles: ['HR_MANAGER', 'SUPER_ADMIN'], items: [
        { label: 'Employees', icon: Users, path: '/dashboard/employees' },
        { label: 'Recruitment', icon: Target, path: '/dashboard/recruitment' },
        { label: 'Performance', icon: Award, path: '/dashboard/performance' },
    ]},
    { section: 'Operations', allowedRoles: ['ALL'], items: [
        { label: 'Attendance', icon: CalendarCheck, path: '/dashboard/attendance' },
        { label: 'Leave', icon: Palmtree, path: '/dashboard/leave' },
        { label: 'Payroll', icon: CircleDollarSign, path: '/dashboard/payroll' },
    ]},
    { section: 'Workspace', allowedRoles: ['ALL'], items: [
        { label: 'Projects', icon: FolderKanban, path: '/dashboard/projects' },
        { label: 'Help Desk', icon: Ticket, path: '/dashboard/helpdesk' },
        { label: 'Assets', icon: Laptop2, path: '/dashboard/assets', overrideRoles: ['IT_ADMIN', 'SUPER_ADMIN'] },
    ]},
    { section: 'Intelligence', allowedRoles: ['ALL'], items: [
        { label: 'AI Assistant', icon: Bot, path: '/dashboard/ai-assistant' },
        { label: 'Reports', icon: LineChart, path: '/dashboard/reports', overrideRoles: ['SUPER_ADMIN', 'HR_MANAGER'] },
        { label: 'Credentials Vault', icon: Key, path: '/dashboard/vault', overrideRoles: ['SUPER_ADMIN'] },
    ]},
];

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('userRole') || 'EMPLOYEE';
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
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markAsRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            fetchNotifications();
            setShowNotifications(false);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const roleLabel = role.replace('_', ' ');
    const displayName = userProfile?.name || roleLabel;
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    
    const avatarContent = userProfile?.profilePhoto ? (
        <img src={userProfile.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : initials;

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <img src="/logo.png" alt="EWM Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    <div>
                        <div className="sidebar-brand-name">EWM</div>
                        <div className="sidebar-brand-sub">Workforce Platform</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.filter(section => 
                        section.allowedRoles.includes('ALL') || section.allowedRoles.includes(role)
                    ).map(section => (
                        <div key={section.section}>
                            <div className="nav-section-label">{section.section}</div>
                            {section.items.filter(item => 
                                !item.overrideRoles || item.overrideRoles.includes(role)
                            ).map(item => {
                                const IconComp = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/dashboard'}
                                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    >
                                        <span className="nav-icon"><IconComp size={18} /></span>
                                        {item.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-profile-mini">
                        <div className="user-avatar" style={{ overflow: 'hidden' }}>{avatarContent}</div>
                        <div className="user-info-mini">
                            <div className="user-name-mini">{displayName}</div>
                            <div className="user-role-mini">{userProfile?.designation || 'Authenticated User'}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Top Bar */}
                <div className="dashboard-topbar">
                    <div className="topbar-title">{title}</div>
                    <div className="topbar-actions">
                        <div className="topbar-badge" title="Notifications" onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer', position: 'relative' }}>
                            <Bell size={18} />
                            {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
                            
                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h4>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllAsRead} className="mark-all-btn">Mark all read</button>
                                        )}
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="no-notifications">No new notifications</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif._id} 
                                                    className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                                                >
                                                    <div className="notif-content">
                                                        <strong>{notif.title}</strong>
                                                        <p>{notif.message}</p>
                                                        <span className="notif-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {!notif.isRead && (
                                                        <button 
                                                            className="mark-read-icon" 
                                                            onClick={(e) => handleMarkAsRead(notif._id, e)}
                                                            title="Mark as read"
                                                        >
                                                            ✓
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="topbar-badge" onClick={toggleTheme} title="Toggle Theme" style={{ cursor: 'pointer' }}>
                            {theme === 'dark' ? '☀️' : '🌙'}
                        </div>
                        <div className="topbar-badge" title="Settings">
                            <Settings size={18} />
                        </div>
                        <div className="user-avatar" style={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => navigate('/dashboard/profile')} title="My Profile">
                            {avatarContent}
                        </div>
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
