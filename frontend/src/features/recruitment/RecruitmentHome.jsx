import React, { useState, useEffect } from 'react';
import { getJobs, createJob } from './api/recruitmentService';
import JobsList from './components/JobsList';
import CandidatePipeline from './components/CandidatePipeline';
import './RecruitmentHome.css';

const RecruitmentHome = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNewJobModal, setShowNewJobModal] = useState(false);
    
    // Form state
    const [newJob, setNewJob] = useState({ title: '', department: '', location: '', description: '' });

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await getJobs();
            setJobs(data);
        } catch (error) {
            console.error('Failed to fetch jobs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await createJob(newJob);
            setShowNewJobModal(false);
            setNewJob({ title: '', department: '', location: '', description: '' });
            fetchJobs();
        } catch (error) {
            console.error('Failed to create job', error);
            alert('Failed to create job. Please try again.');
        }
    };

    if (loading) return <div className="loading-state">Loading recruitment data...</div>;

    const totalActiveJobs = jobs.filter(j => j.status === 'Open').length;
    const totalApplicants = jobs.reduce((acc, job) => acc + (job.applicantsCount || 0), 0);
    const avgApplicantsPerJob = jobs.length > 0 ? (totalApplicants / jobs.length).toFixed(1) : 0;

    return (
        <div className="recruitment-container" style={{ padding: '24px' }}>
            <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="page-header-left">
                    <h1>Applicant Tracking System</h1>
                    <p>Manage job postings, track candidates, and optimize your hiring pipeline.</p>
                </div>
                <div>
                    {!selectedJob ? (
                        <button className="btn-primary" onClick={() => setShowNewJobModal(true)}>
                            + Post New Job
                        </button>
                    ) : (
                        <button className="btn-secondary" onClick={() => setSelectedJob(null)}>
                            ← Back to Jobs
                        </button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            {!selectedJob && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Active Job Openings</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{totalActiveJobs}</div>
                    </div>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Total Applications</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{totalApplicants}</div>
                    </div>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Avg. Applicants / Job</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{avgApplicantsPerJob}</div>
                    </div>
                </div>
            )}

            <div className="recruitment-content">
                {selectedJob ? (
                    <CandidatePipeline job={selectedJob} />
                ) : (
                    <JobsList jobs={jobs} onSelectJob={setSelectedJob} />
                )}
            </div>

            {/* New Job Modal */}
            {showNewJobModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Post a New Job</h2>
                        <form onSubmit={handleCreateJob}>
                            <div className="form-group">
                                <label>Job Title</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Department</label>
                                    <select 
                                        required 
                                        value={newJob.department}
                                        onChange={(e) => setNewJob({...newJob, department: e.target.value})}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">HR</option>
                                        <option value="Finance">Finance</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={newJob.location}
                                        onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                                        placeholder="e.g. Remote, New York, etc."
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Job Description</label>
                                <textarea 
                                    required
                                    rows="4"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                                    placeholder="Briefly describe the responsibilities and requirements..."
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowNewJobModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Post Job</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruitmentHome;
