import React, { useState, useEffect, useRef } from 'react';
import { getMyProfile, updateMyProfile } from './api/employeeService';
import DocumentsManager from './components/DocumentsManager';
import '../../components/shared.css';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        profilePhoto: '',
        bio: '',
        skills: [] // Array of { name, level }
    });
    
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await getMyProfile();
                setProfile(res.data);
                setFormData({
                    name: res.data.name || '',
                    profilePhoto: res.data.profilePhoto || '',
                    bio: res.data.bio || '',
                    skills: res.data.skills || []
                });
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = () => {
        setFormData({
            ...formData,
            skills: [...formData.skills, { name: '', level: 'Intermediate' }]
        });
    };

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...formData.skills];
        newSkills[index][field] = value;
        setFormData({ ...formData, skills: newSkills });
    };

    const handleRemoveSkill = (index) => {
        const newSkills = formData.skills.filter((_, i) => i !== index);
        setFormData({ ...formData, skills: newSkills });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profilePhoto: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                name: formData.name,
                profilePhoto: formData.profilePhoto,
                bio: formData.bio,
                skills: formData.skills.filter(s => s.name.trim() !== '')
            };
            const res = await updateMyProfile(payload);
            setProfile(res.data);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
            </>
        );
    }

    if (!profile) {
        return (
            <>
                <div className="alert-error">Failed to load profile data.</div>
            </>
        );
    }

    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30 }}>
                
                {/* Left Column: Readonly Card */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 30, textAlign: 'center' }}>
                    <div 
                        style={{
                            width: 120, height: 120, borderRadius: '50%', background: 'var(--primary)',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 40, fontWeight: 'bold', margin: '0 auto 20px', overflow: 'hidden',
                            position: 'relative', cursor: 'pointer', border: '3px solid rgba(255,255,255,0.1)'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to change photo"
                    >
                        {formData.profilePhoto ? (
                            <img src={formData.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            initials
                        )}
                        <div style={{
                            position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.5)',
                            fontSize: 10, padding: '4px 0', textTransform: 'uppercase'
                        }}>Edit</div>
                    </div>
                    
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} style={{ display: 'none' }} />

                    <h2 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{profile.name}</h2>
                    <p style={{ margin: 0, color: 'var(--primary-light)', fontWeight: 500 }}>{profile.designation}</p>
                    <p style={{ margin: '5px 0 20px', color: 'var(--text-muted)', fontSize: 14 }}>{profile.department}</p>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'left', fontSize: 14, color: 'var(--text-secondary)' }}>
                        <div style={{ marginBottom: 12 }}><strong>Email:</strong><br/>{profile.email}</div>
                        <div style={{ marginBottom: 12 }}><strong>Mobile:</strong><br/>{profile.mobile}</div>
                        <div style={{ marginBottom: 12 }}><strong>Employee ID:</strong><br/>{profile.employeeId}</div>
                    </div>
                </div>

                {/* Right Column: Editable Forms */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 30 }}>
                    <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 15 }}>Professional Background</h3>
                    
                    {error && <div className="alert-error" style={{ marginBottom: 20 }}>{error}</div>}
                    {success && <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: 8, marginBottom: 20 }}>✅ {success}</div>}
                    
                    <form onSubmit={handleSave}>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>Full Name</label>
                            <input 
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: 12, borderRadius: 8 }}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: 8, color: 'var(--text-secondary)', fontSize: 14 }}>Professional Bio</label>
                            <textarea 
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Write a short bio about your professional experience..."
                                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: 12, borderRadius: 8, minHeight: 120, fontFamily: 'inherit', resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 30 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                                <label className="form-label" style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>Skill Matrix</label>
                                <button type="button" onClick={handleAddSkill} style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>+ Add Skill</button>
                            </div>
                            
                            {formData.skills.map((skill, index) => (
                                <div key={index} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                                    <input 
                                        type="text"
                                        value={skill.name}
                                        onChange={(e) => handleSkillChange(index, 'name', e.target.value)}
                                        placeholder="e.g. ReactJS"
                                        style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 8 }}
                                    />
                                    <select 
                                        value={skill.level}
                                        onChange={(e) => handleSkillChange(index, 'level', e.target.value)}
                                        style={{ width: 140, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 8 }}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                    <button 
                                        type="button"
                                        onClick={() => handleRemoveSkill(index)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 8px', fontSize: 16 }}
                                    >×</button>
                                </div>
                            ))}
                            {formData.skills.length === 0 && (
                                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', padding: 10, background: 'var(--bg)', borderRadius: 8, textAlign: 'center' }}>
                                    No skills added yet. Add skills to build your matrix!
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : '💾 Save Profile'}
                            </button>
                        </div>
                    </form>
                    
                    <DocumentsManager employeeId={profile._id} />
                </div>
            </div>
        </>
    );
};

export default Profile;
