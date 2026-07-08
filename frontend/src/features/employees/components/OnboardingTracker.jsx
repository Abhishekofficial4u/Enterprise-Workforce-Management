import React, { useState, useEffect } from 'react';
import { getOnboardingTasks, updateOnboardingTask, generateStandardChecklist, createOnboardingTask, deleteOnboardingTask } from '../api/onboardingService';

const OnboardingTracker = ({ employeeId }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', category: 'HR & Documents' });

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await getOnboardingTasks(employeeId);
            setTasks(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) {
            fetchTasks();
        }
    }, [employeeId]);

    const handleGenerate = async () => {
        try {
            await generateStandardChecklist(employeeId);
            fetchTasks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to generate');
        }
    };

    const handleToggleStatus = async (task) => {
        const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
        try {
            await updateOnboardingTask(task._id, { status: newStatus });
            fetchTasks();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await createOnboardingTask(employeeId, formData);
            setFormData({ title: '', category: 'HR & Documents' });
            setShowForm(false);
            fetchTasks();
        } catch (error) {
            alert('Failed to add task');
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await deleteOnboardingTask(taskId);
            fetchTasks();
        } catch (error) {
            alert('Failed to delete task');
        }
    };

    if (loading) return <div style={{ color: '#fff' }}>Loading onboarding tasks...</div>;

    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

    return (
        <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', marginTop: '24px', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Onboarding Tracker</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {tasks.length === 0 && (
                        <button onClick={handleGenerate} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                            Generate Standard Checklist
                        </button>
                    )}
                    <button onClick={() => setShowForm(!showForm)} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        {showForm ? 'Cancel' : '+ Custom Task'}
                    </button>
                </div>
            </div>

            {tasks.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                        <span>Progress</span>
                        <span>{progress}% ({completedCount}/{tasks.length})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : '#6366f1', transition: 'width 0.3s ease' }}></div>
                    </div>
                </div>
            )}

            {showForm && (
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', background: '#0f172a', padding: '16px', borderRadius: '8px' }}>
                    <input 
                        required
                        placeholder="Task Title..."
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        style={{ flex: 1, padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                    />
                    <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        style={{ padding: '8px', background: '#1e293b', border: '1px solid #334155', color: '#fff', borderRadius: '4px' }}
                    >
                        <option value="HR & Documents">HR & Documents</option>
                        <option value="IT Setup">IT Setup</option>
                        <option value="Training">Training</option>
                        <option value="Welcome">Welcome</option>
                    </select>
                    <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
                </form>
            )}

            {tasks.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', border: '1px dashed #334155', borderRadius: '8px' }}>
                    No onboarding tasks yet. Generate a standard checklist to begin.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {tasks.map(task => (
                        <div key={task._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={task.status === 'Completed'}
                                    onChange={() => handleToggleStatus(task)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <div>
                                    <div style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? '#64748b' : '#f8fafc', fontSize: '15px', fontWeight: '500' }}>
                                        {task.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                                        <span style={{ background: '#334155', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{task.category}</span>
                                        {task.status === 'Completed' ? `Completed on ${new Date(task.completedAt).toLocaleDateString()}` : task.status}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(task._id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px' }} title="Delete Task">×</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OnboardingTracker;
