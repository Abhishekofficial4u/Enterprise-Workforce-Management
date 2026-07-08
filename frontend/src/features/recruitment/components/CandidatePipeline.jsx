import React, { useState, useEffect } from 'react';
import { getCandidates, createCandidate, updateCandidateStage } from '../api/recruitmentService';
import './CandidatePipeline.css';

const STAGES = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired', 'Rejected'];

const CandidatePipeline = ({ job }) => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCandidate, setNewCandidate] = useState({
        firstName: '', lastName: '', email: '', phone: '', resumeUrl: '', jobId: job._id
    });
    const [aiResult, setAiResult] = useState(null);
    const [analyzingId, setAnalyzingId] = useState(null);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const data = await getCandidates(job._id);
            setCandidates(data);
        } catch (error) {
            console.error('Error fetching candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
    }, [job._id]);

    const handleAddCandidate = async (e) => {
        e.preventDefault();
        try {
            await createCandidate(newCandidate);
            setShowAddModal(false);
            setNewCandidate({ firstName: '', lastName: '', email: '', phone: '', resumeUrl: '', jobId: job._id });
            fetchCandidates();
        } catch (error) {
            alert('Failed to add candidate.');
        }
    };

    const handleAIScreen = async (candidateId) => {
        try {
            setAnalyzingId(candidateId);
            const token = localStorage.getItem('userToken');
            const res = await fetch(`https://enterprise-workforce-management.onrender.com/api/v1/recruitment/candidates/${candidateId}/ai-screen`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setAiResult(result.data);
            } else {
                alert(result.message || 'AI Screening failed');
            }
        } catch (error) {
            alert('Error running AI screen');
        } finally {
            setAnalyzingId(null);
            fetchCandidates(); // refresh to show saved score if applicable
        }
    };

    const handleDragStart = (e, candidateId) => {
        e.dataTransfer.setData('candidateId', candidateId);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // allow drop
    };

    const handleDrop = async (e, targetStage) => {
        const candidateId = e.dataTransfer.getData('candidateId');
        const candidate = candidates.find(c => c._id === candidateId);
        
        if (candidate && candidate.stage !== targetStage) {
            // Optimistic UI update
            setCandidates(candidates.map(c => 
                c._id === candidateId ? { ...c, stage: targetStage } : c
            ));
            
            try {
                await updateCandidateStage(candidateId, targetStage);
            } catch (error) {
                // Revert on failure
                fetchCandidates();
                alert('Failed to update stage');
            }
        }
    };

    return (
        <div className="pipeline-container">
            <div className="pipeline-header">
                <div className="pipeline-title">
                    <h2>{job.title}</h2>
                    <span className="pipeline-meta">{job.department} • {job.location}</span>
                </div>
                <button className="ewm-btn" onClick={() => setShowAddModal(true)}>
                    + Add Candidate
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading candidates...</div>
            ) : (
                <div className="kanban-board">
                    {STAGES.map(stage => (
                        <div 
                            key={stage} 
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage)}
                        >
                            <div className="column-header">
                                <h3>{stage}</h3>
                                <span className="column-count">
                                    {candidates.filter(c => c.stage === stage).length}
                                </span>
                            </div>
                            
                            <div className="column-content">
                                {candidates
                                    .filter(c => c.stage === stage)
                                    .map(candidate => (
                                        <div 
                                            key={candidate._id} 
                                            className="kanban-card"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, candidate._id)}
                                        >
                                            <div className="candidate-name">
                                                {candidate.firstName} {candidate.lastName}
                                            </div>
                                            <div className="candidate-contact">
                                                ✉️ {candidate.email}
                                            </div>
                                            {candidate.resumeUrl && (
                                                <a 
                                                    href={candidate.resumeUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="resume-link"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📄 View Resume
                                                </a>
                                            )}
                                            
                                            {candidate.aiMatchScore !== undefined && (
                                                <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}>
                                                    ✨ AI Match: {candidate.aiMatchScore}%
                                                </div>
                                            )}

                                            <button 
                                                className="ewm-btn-secondary" 
                                                style={{ marginTop: 12, width: '100%', fontSize: 12, padding: '6px' }}
                                                onClick={() => handleAIScreen(candidate._id)}
                                                disabled={analyzingId === candidate._id}
                                            >
                                                {analyzingId === candidate._id ? 'Analyzing...' : '✨ AI Screen'}
                                            </button>
                                        </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Candidate Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add Candidate</h2>
                        <form onSubmit={handleAddCandidate}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input required type="text" value={newCandidate.firstName} onChange={e => setNewCandidate({...newCandidate, firstName: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input required type="text" value={newCandidate.lastName} onChange={e => setNewCandidate({...newCandidate, lastName: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input required type="email" value={newCandidate.email} onChange={e => setNewCandidate({...newCandidate, email: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="tel" value={newCandidate.phone} onChange={e => setNewCandidate({...newCandidate, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Resume URL</label>
                                <input type="url" placeholder="https://linkedin.com/in/..." value={newCandidate.resumeUrl} onChange={e => setNewCandidate({...newCandidate, resumeUrl: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Add Candidate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Result Modal */}
            {aiResult && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 500, padding: '32px' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginTop: 0 }}>
                            ✨ AI Candidate Screening
                        </h2>
                        
                        <div style={{ margin: '24px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                                <div style={{ 
                                    fontSize: 48, fontWeight: 800, 
                                    color: aiResult.matchScore > 75 ? 'var(--success)' : (aiResult.matchScore > 50 ? 'var(--warning)' : 'var(--danger)') 
                                }}>
                                    {aiResult.matchScore}%
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>Match Score</h3>
                                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Based on resume and job description</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <h4 style={{ color: 'var(--success)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 18 }}>💪</span> Top Strengths
                                    </h4>
                                    <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--text-secondary)' }}>
                                        {aiResult.strengths?.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
                                    </ul>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--danger)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ fontSize: 18 }}>⚠️</span> Missing Skills
                                    </h4>
                                    <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--text-secondary)' }}>
                                        {aiResult.missingSkills?.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Recommended Action:</h4>
                                <div style={{ fontSize: 16, fontWeight: 600, color: aiResult.matchScore >= 70 ? 'var(--success)' : (aiResult.matchScore < 40 ? 'var(--danger)' : 'var(--warning)') }}>
                                    {aiResult.matchScore >= 70 ? '✅ Fast-track to Interview' : (aiResult.matchScore < 40 ? '❌ Reject Application' : '⚠️ Review Manually')}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                            <button className="btn-secondary" onClick={() => setAiResult(null)}>Close Analysis</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidatePipeline;
