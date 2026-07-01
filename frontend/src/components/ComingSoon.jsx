import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

const ComingSoon = ({ title, icon, description }) => (
    <DashboardLayout title={title}>
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '65vh', gap: 16, textAlign: 'center'
        }}>
            <div style={{ fontSize: 64 }}>{icon}</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>{title}</h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 380, lineHeight: 1.6 }}>{description}</p>
            <div style={{
                marginTop: 8, padding: '8px 20px', borderRadius: 20,
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                color: 'var(--primary-light)', fontSize: 13, fontWeight: 600
            }}>
                🔨 In Development — Phase 2
            </div>
        </div>
    </DashboardLayout>
);

export default ComingSoon;
