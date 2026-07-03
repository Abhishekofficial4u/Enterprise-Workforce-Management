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
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
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
        </div>
    );
};

export default CandidatePipeline;
