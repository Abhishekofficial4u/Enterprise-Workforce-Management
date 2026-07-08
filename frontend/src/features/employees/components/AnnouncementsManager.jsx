import React, { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../auth/api/announcementService';

const AnnouncementsManager = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', type: 'News', priority: 'Normal' });

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await getAnnouncements();
            setAnnouncements(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createAnnouncement(formData);
            setFormData({ title: '', content: '', type: 'News', priority: 'Normal' });
            setShowForm(false);
            fetchAnnouncements();
        } catch (error) {
            alert('Failed to post announcement');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            fetchAnnouncements();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '24px' }}>Loading...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Company Announcements</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancel' : '+ New Post'}
                </button>
            </div>

            {showForm && (
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Title</label>
                            <input 
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                                >
                                    <option value="News">News</option>
                                    <option value="Event">Event</option>
                                    <option value="Holiday">Holiday</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Priority</label>
                                <select 
                                    value={formData.priority}
                                    onChange={e => setFormData({...formData, priority: e.target.value})}
                                    style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                                >
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Content</label>
                            <textarea 
                                required
                                rows={4}
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
                            />
                        </div>
                        <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Post Announcement
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: '16px' }}>
                {announcements.map(ann => (
                    <div key={ann._id} style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0 }}>{ann.title}</h3>
                                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#334155' }}>{ann.type}</span>
                                {ann.priority === 'High' && <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#ef444440', color: '#fca5a5' }}>High Priority</span>}
                            </div>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{ann.content}</p>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                Posted {new Date(ann.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(ann._id)}
                            style={{ background: '#ef444420', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Delete
                        </button>
                    </div>
                ))}
                {announcements.length === 0 && <p style={{ color: '#94a3b8' }}>No announcements found.</p>}
            </div>
        </div>
    );
};

export default AnnouncementsManager;
