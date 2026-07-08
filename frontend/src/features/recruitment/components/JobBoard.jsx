import React, { useState, useEffect } from 'react';
import { getJobs, createCandidate } from '../api/recruitmentService';
import { Briefcase, MapPin, Building, Send } from 'lucide-react';
import '../../../components/shared.css';

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [applying, setApplying] = useState(false);
    
    // Application form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        skills: '',
        experience: ''
    });

    useEffect(() => {
        const fetchOpenJobs = async () => {
            try {
                const res = await getJobs();
                const openJobs = (res || []).filter(j => j.status === 'Open');
                setJobs(openJobs);
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOpenJobs();
    }, []);

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);
        try {
            await createCandidate({ ...formData, jobId: selectedJob._id });
            alert('Application submitted successfully! Our HR team will review it shortly.');
            setSelectedJob(null);
            setFormData({ firstName: '', lastName: '', email: '', phone: '', skills: '', experience: '' });
        } catch (error) {
            alert('Failed to submit application. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div style={{ padding: 24 }}>Loading available positions...</div>;

    return (
        <div style={{ display: 'flex', gap: 24, padding: 24, alignItems: 'flex-start' }}>
            
            {/* Job Listings */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2>Open Positions</h2>
                {jobs.length === 0 ? (
                    <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Briefcase size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                        <h3>No open positions right now</h3>
                        <p>Check back later for new opportunities!</p>
                    </div>
                ) : (
                    jobs.map(job => (
                        <div 
                            key={job._id} 
                            className="ewm-card hover-lift" 
                            style={{ 
                                padding: 24, cursor: 'pointer', 
                                borderLeft: selectedJob?._id === job._id ? '4px solid var(--primary)' : '4px solid transparent'
                            }}
                            onClick={() => setSelectedJob(job)}
                        >
                            <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{job.title}</h3>
                            <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Building size={14} /> {job.department}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {job.location}</span>
                            </div>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {job.description}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Application Form */}
            {selectedJob && (
                <div className="card" style={{ flex: 1, position: 'sticky', top: 24 }}>
                    <div className="card-header">
                        <span className="card-title">Apply: {selectedJob.title}</span>
                    </div>
                    <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div className="form-field" style={{ flex: 1 }}>
                                <label>First Name</label>
                                <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                            </div>
                            <div className="form-field" style={{ flex: 1 }}>
                                <label>Last Name</label>
                                <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <div className="form-field" style={{ flex: 1 }}>
                                <label>Email</label>
                                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="form-field" style={{ flex: 1 }}>
                                <label>Phone</label>
                                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Key Skills (for AI Screening)</label>
                            <textarea 
                                required rows={2} 
                                placeholder="React, Node.js, Project Management, etc."
                                value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} 
                            />
                        </div>

                        <div className="form-field">
                            <label>Brief Experience Summary (for AI Screening)</label>
                            <textarea 
                                required rows={4} 
                                placeholder="Describe your relevant experience matching the job description..."
                                value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} 
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                            <button type="button" className="btn-secondary" onClick={() => setSelectedJob(null)} disabled={applying}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={applying} style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}>
                                {applying ? 'Submitting...' : <><Send size={18} /> Submit Application</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default JobBoard;
