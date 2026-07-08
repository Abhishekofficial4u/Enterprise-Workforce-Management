import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, CircleDollarSign, Briefcase, UserCircle } from 'lucide-react';
import './RolePortal.css';

const portals = [
    {
        id: 'admin',
        title: 'System Admin',
        desc: 'Global settings, security, and full platform access.',
        icon: ShieldAlert,
        color: '#8b5cf6', // Deep purple
    },
    {
        id: 'hr',
        title: 'HR Management',
        desc: 'Recruitment, employee directory, and performance.',
        icon: Users,
        color: '#f97316', // Orange
    },
    {
        id: 'finance',
        title: 'Finance & Payroll',
        desc: 'Payroll processing, asset management, and reports.',
        icon: CircleDollarSign,
        color: '#10b981', // Emerald green
    },
    {
        id: 'manager',
        title: 'Team Manager',
        desc: 'Project tracking, team performance, and approvals.',
        icon: Briefcase,
        color: '#3b82f6', // Indigo/Blue
    },
    {
        id: 'employee',
        title: 'Employee Workspace',
        desc: 'Self-service profile, attendance, and leave requests.',
        icon: UserCircle,
        color: '#0ea5e9', // Sky blue
    }
];

const RolePortal = () => {
    const navigate = useNavigate();

    const handleSelectPortal = (portalId) => {
        navigate(`/login/${portalId}`);
    };

    return (
        <div className="portal-container">
            {/* Animated Background */}
            <div className="portal-bg-abstract">
                <div className="portal-orb orb-1"></div>
                <div className="portal-orb orb-2"></div>
                <div className="portal-orb orb-3"></div>
            </div>

            <div className="portal-content">
                <div className="portal-header">
                    <h1 className="portal-title">Select Your Workspace</h1>
                    <p className="portal-subtitle">Please select your designated portal to continue securely.</p>
                </div>

                <div className="portal-grid">
                    {portals.map((portal) => {
                        const Icon = portal.icon;
                        return (
                            <div 
                                key={portal.id} 
                                className="portal-card glass-panel"
                                onClick={() => handleSelectPortal(portal.id)}
                                style={{ '--hover-color': portal.color }}
                            >
                                <div className="portal-card-icon" style={{ backgroundColor: `${portal.color}20`, color: portal.color }}>
                                    <Icon size={32} />
                                </div>
                                <h3 className="portal-card-title">{portal.title}</h3>
                                <p className="portal-card-desc">{portal.desc}</p>
                                <div className="portal-card-arrow" style={{ color: portal.color }}>
                                    Enter Portal &rarr;
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                <button className="portal-back-btn" onClick={() => navigate('/')}>
                    &larr; Back to Website
                </button>
            </div>
        </div>
    );
};

export default RolePortal;
