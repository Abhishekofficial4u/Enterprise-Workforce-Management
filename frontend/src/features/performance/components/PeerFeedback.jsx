import React, { useState, useEffect } from 'react';
import { getEmployees } from '../../employees/api/employeeService';
import { submitFeedback } from '../api/performanceService';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import '../../../components/shared.css';

const PeerFeedback = () => {
    const [employees, setEmployees] = useState([]);
    const [targetEmployeeId, setTargetEmployeeId] = useState('');
    const [strengths, setStrengths] = useState('');
    const [areasForImprovement, setAreasForImprovement] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getEmployees().then(res => setEmployees(res.data || [])).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await submitFeedback({
                targetEmployeeId,
                strengths,
                areasForImprovement,
                additionalComments,
                isAnonymous
            });
            alert('Feedback submitted successfully! Thank you.');
            setTargetEmployeeId('');
            setStrengths('');
            setAreasForImprovement('');
            setAdditionalComments('');
            setIsAnonymous(true);
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: 12, borderRadius: 12 }}>
                    <MessageSquare size={24} />
                </div>
                <div>
                    <span className="card-title" style={{ margin: 0 }}>360° Peer Feedback</span>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
                        Help your colleagues grow by providing constructive, actionable feedback.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
                <div className="form-field">
                    <label>Select Colleague</label>
                    <select value={targetEmployeeId} onChange={(e) => setTargetEmployeeId(e.target.value)} required>
                        <option value="">-- Choose an employee --</option>
                        {employees.map(emp => (
                            <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label>What are their core strengths?</label>
                    <textarea 
                        value={strengths} 
                        onChange={(e) => setStrengths(e.target.value)} 
                        rows={3} 
                        required 
                        placeholder="What does this person do really well?"
                    />
                </div>

                <div className="form-field">
                    <label>Areas for Improvement</label>
                    <textarea 
                        value={areasForImprovement} 
                        onChange={(e) => setAreasForImprovement(e.target.value)} 
                        rows={3} 
                        required 
                        placeholder="Where can this person improve?"
                    />
                </div>

                <div className="form-field">
                    <label>Additional Comments (Optional)</label>
                    <textarea 
                        value={additionalComments} 
                        onChange={(e) => setAdditionalComments(e.target.value)} 
                        rows={2} 
                        placeholder="Any other feedback or notes?"
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                    <input 
                        type="checkbox" 
                        id="anonymous" 
                        checked={isAnonymous} 
                        onChange={(e) => setIsAnonymous(e.target.checked)} 
                        style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="anonymous" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <ShieldCheck size={18} color="var(--primary)" />
                        Keep my feedback anonymous to the employee
                    </label>
                </div>

                <button type="submit" className="btn-primary" disabled={submitting || !targetEmployeeId} style={{ alignSelf: 'flex-start', padding: '0 32px' }}>
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
            </form>
        </div>
    );
};

export default PeerFeedback;
