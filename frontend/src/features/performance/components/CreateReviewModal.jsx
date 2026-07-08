import React, { useState, useEffect } from 'react';
import { createReview, generateAIDraft } from '../api/performanceService';
import { getEmployees } from '../../employees/api/employeeService';

const CreateReviewModal = ({ onClose, onSuccess }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    
    const [formData, setFormData] = useState({
        employeeId: '',
        reviewCycle: 'Q1',
        year: new Date().getFullYear(),
        kpis: {
            qualityOfWork: 3,
            communication: 3,
            punctuality: 3,
            teamwork: 3,
            initiative: 3
        },
        feedback: ''
    });

    useEffect(() => {
        getEmployees().then(res => setEmployees(res.data)).catch(console.error);
    }, []);

    const handleKpiChange = (kpi, value) => {
        setFormData(prev => ({
            ...prev,
            kpis: { ...prev.kpis, [kpi]: Number(value) }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createReview(formData);
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create review');
            setLoading(false);
        }
    };

    const handleAIDraft = async () => {
        if (!formData.employeeId) {
            alert('Please select an employee first to gather their goals and feedback.');
            return;
        }
        setGeneratingAI(true);
        try {
            const res = await generateAIDraft(formData.employeeId);
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    feedback: res.data.reviewText || ''
                }));
                // Optional: You could also auto-fill the recommended rating or KPIs here if they were provided in `res.data`.
            }
        } catch (error) {
            alert('Failed to generate AI draft.');
        } finally {
            setGeneratingAI(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 600 }}>
                <h2>Create Performance Review</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Employee</label>
                            <select 
                                required
                                value={formData.employeeId}
                                onChange={e => setFormData({...formData, employeeId: e.target.value})}
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Review Cycle</label>
                            <select 
                                value={formData.reviewCycle}
                                onChange={e => setFormData({...formData, reviewCycle: e.target.value})}
                            >
                                <option value="Q1">Q1</option>
                                <option value="Q2">Q2</option>
                                <option value="Q3">Q3</option>
                                <option value="Q4">Q4</option>
                                <option value="Annual">Annual</option>
                                <option value="Probation">Probation</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <input 
                                type="number" 
                                required
                                value={formData.year}
                                onChange={e => setFormData({...formData, year: e.target.value})}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 24, marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>KPI Scores (1-5)</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                        {Object.keys(formData.kpis).map(kpi => (
                            <div className="kpi-row" key={kpi}>
                                <label>
                                    <span style={{ textTransform: 'capitalize' }}>{kpi.replace(/([A-Z])/g, ' $1').trim()}</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{formData.kpis[kpi]}</span>
                                </label>
                                <input 
                                    type="range" 
                                    min="1" max="5" step="1"
                                    value={formData.kpis[kpi]}
                                    onChange={e => handleKpiChange(kpi, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="form-group" style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ margin: 0 }}>Manager Feedback</label>
                            <button 
                                type="button" 
                                onClick={handleAIDraft} 
                                disabled={generatingAI || !formData.employeeId}
                                style={{ 
                                    background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', 
                                    color: 'white', border: 'none', borderRadius: 16, 
                                    padding: '4px 12px', fontSize: 12, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}
                            >
                                ✨ {generatingAI ? 'Drafting...' : 'Draft with AI'}
                            </button>
                        </div>
                        <textarea 
                            required
                            rows="4"
                            placeholder="Provide qualitative feedback on the employee's performance..."
                            value={formData.feedback}
                            onChange={e => setFormData({...formData, feedback: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReviewModal;
