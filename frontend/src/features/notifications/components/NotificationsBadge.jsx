import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { getMyNotifications, markAsRead, markAllAsRead } from '../api/notificationService';
import { getSocket } from '../api/socketService';

const NotificationsBadge = () => {
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await getMyNotifications();
            if (res && res.data) {
                setNotifications(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const socket = getSocket();
        if (socket) {
            socket.on('newNotification', (data) => {
                setNotifications(prev => [data, ...prev]);
            });
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            if (socket) socket.off('newNotification');
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Bell size={20} color="var(--text-secondary)" />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'var(--danger)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        minWidth: '16px',
                        textAlign: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '320px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    marginTop: '8px',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px' }}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No notifications</div>
                        ) : (
                            notifications.map(n => (
                                <div key={n._id} 
                                    onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                                    style={{ 
                                        padding: '12px 16px', 
                                        borderBottom: '1px solid var(--border)',
                                        background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                                        cursor: n.isRead ? 'default' : 'pointer'
                                    }}>
                                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{n.title}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{n.message}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                        {new Date(n.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsBadge;
