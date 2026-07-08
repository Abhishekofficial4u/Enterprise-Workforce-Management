import React, { useState, useEffect } from 'react';
import { getMyGoals, createGoal, updateGoalProgress } from '../api/performanceService';
import { Target, Calendar, CheckCircle } from 'lucide-react';
import '../../components/shared.css';

const Goals = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await getMyGoals();
            setGoals(res.data || []);
        } catch (error) {
            console.error('Failed to load goals', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createGoal({ title, description, targetDate });
            setTitle('');
            setDescription('');
            setTargetDate('');
            fetchGoals();
        } catch (error) {
            alert('Failed to create goal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateProgress = async (id, currentProgress) => {
        const newProgress = prompt('Enter new progress (0-100):', currentProgress);
        if (newProgress === null) return;
        const num = parseInt(newProgress, 10);
        if (isNaN(num) || num < 0 || num > 100) return alert('Invalid progress');

        let status = 'In Progress';
        if (num === 100) status = 'Completed';
        if (num === 0) status = 'Not Started';

        try {
            await updateGoalProgress(id, { progress: num, status });
            fetchGoals();
        } catch (error) {
            alert('Failed to update progress');
        }
    };

    return (
        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
            <div className="card">
                <div className="card-header">
                    <span className="card-title">My Goals & KPIs</span>
                </div>
                {loading ? (
                    <div style={{ padding: 24, color: 'var(--text-muted)' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginTop: 16 }}>
                        {goals.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)' }}>No goals set yet.</div>
                        ) : (
                            goals.map(goal => (
                                <div key={goal._id} className="ewm-card" style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{goal.title}</h3>
                                        <span className={`status-badge ${goal.status === 'Completed' ? 'approved' : 'pending'}`}>
                                            {goal.status}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 16px 0', minHeight: 40 }}>
                                        {goal.description}
                                    </p>
                                    
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{goal.progress}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${goal.progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                            <Calendar size={14} /> 
                                            {new Date(goal.targetDate).toLocaleDateString()}
                                        </div>
                                        <button className="ewm-btn-secondary" onClick={() => handleUpdateProgress(goal._id, goal.progress)} style={{ padding: '4px 12px', fontSize: 12 }}>
                                            Update
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="card">
                <div className="card-header">
                    <span className="card-title">Set New Goal</span>
                </div>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                    <div className="form-field">
                        <label>Goal Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g., Increase sales by 10%" />
                    </div>
                    <div className="form-field">
                        <label>Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Details about this goal..." />
                    </div>
                    <div className="form-field">
                        <label>Target Date</label>
                        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
                        {submitting ? 'Creating...' : 'Create Goal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Goals;
