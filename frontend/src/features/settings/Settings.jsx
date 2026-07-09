import React, { useState, useEffect } from 'react';
import { getSettings, updateSettings } from './api/settingsService';
import { Save, Building2, Briefcase, Calculator } from 'lucide-react';
import '../../components/shared.css';

const Settings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await getSettings();
            setSettings(res.data);
        } catch (err) {
            setError('Failed to load settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section, field, value) => {
        if (section) {
            setSettings(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: Number(value)
                }
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateSettings(settings);
            setSuccess('Settings saved successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading Settings...</div>;
    if (!settings) return null;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
            <div className="page-header" style={{ marginBottom: '24px' }}>
                <div className="page-header-left">
                    <h1>System Settings</h1>
                    <p>Manage global configurations and company policies</p>
                </div>
            </div>

            {error && <div className="alert-error" style={{marginBottom: 20}}>⚠️ {error}</div>}
            {success && <div className="alert-success" style={{marginBottom: 20, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)'}}>✅ {success}</div>}

            <form onSubmit={handleSave}>
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
                        <Building2 size={20} /> Company Profile
                    </h3>
                    <div className="form-group">
                        <label>Company Name</label>
                        <input 
                            type="text" 
                            className="ewm-input" 
                            value={settings.companyName} 
                            onChange={(e) => handleChange(null, 'companyName', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
                        <Briefcase size={20} /> Leave Policies (Default Allowances)
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Casual Leave (Days)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="ewm-input" 
                                value={settings.leaveBalances?.casual} 
                                onChange={(e) => handleChange('leaveBalances', 'casual', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sick Leave (Days)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="ewm-input" 
                                value={settings.leaveBalances?.sick} 
                                onChange={(e) => handleChange('leaveBalances', 'sick', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Earned Leave (Days)</label>
                            <input 
                                type="number" 
                                min="0"
                                className="ewm-input" 
                                value={settings.leaveBalances?.earned} 
                                onChange={(e) => handleChange('leaveBalances', 'earned', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 20px 0', fontSize: '18px', color: 'var(--text-primary)' }}>
                        <Calculator size={20} /> Payroll & Time Tracking
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label>Base Working Hours / Day</label>
                            <input 
                                type="number" 
                                min="1" max="24"
                                className="ewm-input" 
                                value={settings.payroll?.baseWorkingHoursPerDay} 
                                onChange={(e) => handleChange('payroll', 'baseWorkingHoursPerDay', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Overtime Multiplier</label>
                            <input 
                                type="number" 
                                min="1" step="0.1"
                                className="ewm-input" 
                                value={settings.payroll?.overtimeMultiplier} 
                                onChange={(e) => handleChange('payroll', 'overtimeMultiplier', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Base Tax Rate (%)</label>
                            <input 
                                type="number" 
                                min="0" max="100"
                                className="ewm-input" 
                                value={settings.payroll?.taxRatePercentage} 
                                onChange={(e) => handleChange('payroll', 'taxRatePercentage', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}>
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings;
