import React, { useState, useEffect } from 'react';
import { getMyLearning, updateEnrollmentStatus } from '../../hr/api/trainingService';

const LearningPortal = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMyLearning = async () => {
        setLoading(true);
        try {
            const res = await getMyLearning();
            setEnrollments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyLearning();
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await updateEnrollmentStatus(id, newStatus);
            fetchMyLearning();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '24px' }}>Loading Learning Portal...</div>;

    const pending = enrollments.filter(e => e.status !== 'Completed');
    const completed = enrollments.filter(e => e.status === 'Completed');

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
            <h1 style={{ margin: '0 0 24px', fontSize: '24px' }}>My Learning & Development</h1>

            {/* Pending Courses */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '16px' }}>Current Training</h2>
                {pending.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#1e293b', borderRadius: '8px', color: '#94a3b8' }}>
                        You have no pending training. Great job!
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {pending.map(enr => (
                            <div key={enr._id} style={{ background: '#1e293b', border: '1px solid #3b82f6', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px' }}>{enr.trainingProgram.title}</h3>
                                    {enr.trainingProgram.isMandatory && <span style={{ fontSize: '10px', padding: '2px 6px', background: '#ef444420', color: '#fca5a5', borderRadius: '12px' }}>Required</span>}
                                </div>
                                <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '13px', flex: 1 }}>{enr.trainingProgram.description}</p>
                                
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>{enr.trainingProgram.type}</span>
                                    <span style={{ fontSize: '11px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>{enr.trainingProgram.durationMinutes} mins</span>
                                </div>

                                <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', color: enr.status === 'In Progress' ? '#fbbf24' : '#94a3b8' }}>{enr.status}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {enr.trainingProgram.resourceLink && (
                                            <a href={enr.trainingProgram.resourceLink} target="_blank" rel="noreferrer" style={{ background: '#3b82f620', color: '#60a5fa', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>View Material</a>
                                        )}
                                        {enr.status === 'Assigned' && (
                                            <button onClick={() => handleUpdateStatus(enr._id, 'In Progress')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Start</button>
                                        )}
                                        {enr.status === 'In Progress' && (
                                            <button onClick={() => handleUpdateStatus(enr._id, 'Completed')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Mark Complete</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Courses */}
            <div>
                <h2 style={{ fontSize: '18px', color: '#e2e8f0', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '16px' }}>Completed Certifications</h2>
                {completed.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', background: '#1e293b', borderRadius: '8px', color: '#94a3b8' }}>
                        You haven't completed any training yet.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                        {completed.map(enr => (
                            <div key={enr._id} style={{ background: '#10b98110', border: '1px solid #10b98130', borderRadius: '8px', padding: '16px' }}>
                                <h4 style={{ margin: '0 0 8px', color: '#34d399', fontSize: '15px' }}>🏆 {enr.trainingProgram.title}</h4>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Completed on {new Date(enr.completedAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LearningPortal;
