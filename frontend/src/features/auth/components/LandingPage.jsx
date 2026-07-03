import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, 
    Users, 
    CalendarCheck, 
    FolderKanban, 
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('appTheme') || 'dark');

    // Ensure theme is applied on the landing page too
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    };

    return (
        <div className="landing-page">
            {/* Animated Glassmorphic Background Graphics */}
            <div className="bg-modern-abstract">
                <div className="bg-beam beam-1"></div>
                <div className="bg-beam beam-2"></div>
                <div className="bg-beam beam-3"></div>
                <div className="glass-pane pane-1"></div>
                <div className="glass-pane pane-2"></div>
                <div className="glass-pane pane-3"></div>
            </div>

            {/* Navbar */}
            <nav className="landing-navbar">
                <div className="landing-brand">
                    <div className="landing-brand-icon">W</div>
                    <div className="landing-brand-text">Workforce OS</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div onClick={toggleTheme} style={{ cursor: 'pointer', fontSize: '20px' }} title="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </div>
                    <button className="btn-large btn-primary-glow" onClick={() => navigate('/login')} style={{ padding: '8px 20px', fontSize: '14px' }}>
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-badge">
                        ✨ The Next Generation HR Platform
                    </div>
                    <h1 className="hero-title">
                        Manage your entire workforce in one unified workspace.
                    </h1>
                    <p className="hero-subtitle">
                        From payroll and attendance to project kanban boards and AI insights, Workforce OS gives you everything you need to scale your team efficiently.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-large btn-primary-glow" onClick={() => navigate('/login')}>
                            Get Started <ArrowRight size={20} />
                        </button>
                        <button className="btn-large btn-outline" onClick={() => navigate('/login')}>
                            View Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <Users size={24} />
                    </div>
                    <h3 className="feature-title">Core HR Management</h3>
                    <p className="feature-desc">
                        Manage employee directories, roles, and profiles with a unified dashboard. Easily onboard and offboard team members securely.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <FolderKanban size={24} />
                    </div>
                    <h3 className="feature-title">Project & Task Boards</h3>
                    <p className="feature-desc">
                        Organize projects using drag-and-drop Kanban boards. Track task progress, assign members, and log time natively.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <CalendarCheck size={24} />
                    </div>
                    <h3 className="feature-title">Automated Payroll & Leave</h3>
                    <p className="feature-desc">
                        Process bi-weekly payroll runs automatically based on tracked attendance, approved leaves, and project hours logged.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="feature-title">Advanced Analytics</h3>
                    <p className="feature-desc">
                        Generate real-time reports on labor costs, compliance metrics, and team performance to drive data-backed decisions.
                    </p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="feature-title">Enterprise Security</h3>
                    <p className="feature-desc">
                        Built with granular Role-Based Access Control (RBAC) ensuring employees only see what they need to see.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p>&copy; 2024 Workforce OS. Built for modern enterprises.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
