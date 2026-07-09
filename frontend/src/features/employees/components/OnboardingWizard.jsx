import React, { useState } from 'react';
import apiClient from '../../../api/apiClient';
import { CheckCircle, Circle, ArrowRight, ShieldCheck, FileText, User } from 'lucide-react';

const OnboardingWizard = ({ employee, onComplete }) => {
    const steps = [
        { id: 'profileComplete', label: 'Complete Profile Details', icon: User },
        { id: 'documentsUploaded', label: 'Upload Required Documents', icon: FileText },
        { id: 'policiesAcknowledged', label: 'Acknowledge Company Policies', icon: ShieldCheck }
    ];

    const currentOnboarding = employee?.onboarding || {
        isCompleted: false,
        steps: { profileComplete: false, documentsUploaded: false, policiesAcknowledged: false }
    };

    const [saving, setSaving] = useState(false);

    const handleStepComplete = async (stepId) => {
        setSaving(true);
        try {
            const payload = {
                onboarding: {
                    steps: {
                        [stepId]: true
                    }
                }
            };
            await apiClient.put('/hr/employees/me/onboarding', payload);
            
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to update onboarding step', error);
            alert('Error updating onboarding status');
        } finally {
            setSaving(false);
        }
    };

    if (currentOnboarding.isCompleted) {
        return null;
    }

    return (
        <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: 'var(--text-primary)' }}>Welcome to Enterprise! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please complete the following steps to finish your onboarding process.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {steps.map((step) => {
                    const isCompleted = currentOnboarding.steps[step.id];
                    const StepIcon = step.icon;
                    return (
                        <div key={step.id} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                            padding: '16px', background: isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg)', 
                            border: `1px solid ${isCompleted ? '#10b981' : 'var(--border)'}`, borderRadius: '8px' 
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ color: isCompleted ? '#10b981' : 'var(--text-muted)' }}>
                                    <StepIcon size={24} />
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 500, color: isCompleted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                    {step.label}
                                </div>
                            </div>
                            <div>
                                {isCompleted ? (
                                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 500 }}>
                                        <CheckCircle size={18} /> Completed
                                    </span>
                                ) : (
                                    <button 
                                        className="btn-primary" 
                                        onClick={() => handleStepComplete(step.id)} 
                                        disabled={saving}
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '13px' }}
                                    >
                                        Mark as Done <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OnboardingWizard;
