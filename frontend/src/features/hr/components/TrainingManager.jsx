import React, { useState, useEffect } from 'react';
import { getTrainingPrograms, createTrainingProgram, deleteTrainingProgram, enrollEmployee, getProgramEnrollments } from '../api/trainingService';
import { getEmployees } from '../../employees/api/employeeService';

const TrainingManager = () => {
    const [programs, setPrograms] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ title: '', description: '', type: 'Video', provider: 'Internal', durationMinutes: 60, isMandatory: false, resourceLink: '' });
    
    // Enrollment Modal state
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [selectedEmployeeToEnroll, setSelectedEmployeeToEnroll] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [progRes, empRes] = await Promise.all([
                getTrainingPrograms(),
                getEmployees()
            ]);
            setPrograms(progRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTrainingProgram(formData);
            setFormData({ title: '', description: '', type: 'Video', provider: 'Internal', durationMinutes: 60, isMandatory: false, resourceLink: '' });
            setShowForm(false);
            fetchData();
        } catch (error) {
            alert('Failed to create program');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this training program and all its enrollments?')) return;
        try {
            await deleteTrainingProgram(id);
            fetchData();
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const openEnrollmentModal = async (program) => {
        setSelectedProgram(program);
        try {
            const res = await getProgramEnrollments(program._id);
            setEnrollments(res.data);
        } catch (error) {
            alert('Failed to fetch enrollments');
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        if (!selectedEmployeeToEnroll) return alert('Select an employee');
        try {
            await enrollEmployee(selectedEmployeeToEnroll, selectedProgram._id);
            alert('Enrolled successfully!');
            // Refresh enrollments
            const res = await getProgramEnrollments(selectedProgram._id);
            setEnrollments(res.data);
            setSelectedEmployeeToEnroll('');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to enroll');
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '24px' }}>Loading L&D Module...</div>;

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ margin: 0, fontSize: '24px' }}>Learning & Development (L&D)</h1>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancel' : '+ New Training Program'}
                </button>
            </div>

            {/* Create Program Form */}
            {showForm && (
                <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Course Title</label>
                            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Description</label>
                            <textarea required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Type</label>
                            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                                <option value="Video">Video Training</option>
                                <option value="Document">Documentation</option>
                                <option value="Seminar">Live Seminar</option>
                                <option value="External Certification">External Certification</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Provider</label>
                            <input value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} placeholder="e.g. Internal, Udemy, Coursera" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Duration (Minutes)</label>
                            <input type="number" required value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: e.target.value})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Mandatory Compliance?</label>
                            <select value={formData.isMandatory} onChange={e => setFormData({...formData, isMandatory: e.target.value === 'true'})} style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                                <option value="false">No (Optional)</option>
                                <option value="true">Yes (Mandatory)</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Resource Link</label>
                            <input value={formData.resourceLink} onChange={e => setFormData({...formData, resourceLink: e.target.value})} placeholder="https://" style={{ width: '100%', padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }} />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Create Program</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Programs List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {programs.map(prog => (
                    <div key={prog._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>{prog.title}</h3>
                            {prog.isMandatory && <span style={{ fontSize: '11px', padding: '2px 8px', background: '#ef444420', color: '#fca5a5', borderRadius: '12px', fontWeight: 'bold' }}>Mandatory</span>}
                        </div>
                        <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '14px', flex: 1 }}>{prog.description}</p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>🛠️ {prog.type}</span>
                            <span style={{ fontSize: '12px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>⏱️ {prog.durationMinutes} mins</span>
                            <span style={{ fontSize: '12px', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>🏢 {prog.provider}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155', paddingTop: '16px' }}>
                            <button onClick={() => openEnrollmentModal(prog)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Manage Enrollments</button>
                            <button onClick={() => handleDelete(prog._id)} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Enrollment Modal (Simplified as an overlay) */}
            {selectedProgram && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Enrollments: {selectedProgram.title}</h2>
                            <button onClick={() => setSelectedProgram(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>
                        
                        <form onSubmit={handleEnroll} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <select required value={selectedEmployeeToEnroll} onChange={e => setSelectedEmployeeToEnroll(e.target.value)} style={{ flex: 1, padding: '10px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}>
                                <option value="">-- Select Employee --</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                                ))}
                            </select>
                            <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' }}>Enroll</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {enrollments.map(enr => (
                                <div key={enr._id} style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ display: 'block' }}>{enr.employee.name}</strong>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{enr.employee.designation}</span>
                                    </div>
                                    <div>
                                        <span style={{ 
                                            fontSize: '12px', padding: '4px 8px', borderRadius: '12px',
                                            background: enr.status === 'Completed' ? '#10b98120' : (enr.status === 'In Progress' ? '#f59e0b20' : '#64748b20'),
                                            color: enr.status === 'Completed' ? '#34d399' : (enr.status === 'In Progress' ? '#fbbf24' : '#94a3b8')
                                        }}>
                                            {enr.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {enrollments.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No employees enrolled yet.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingManager;
