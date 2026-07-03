import React from 'react';
import './JobsList.css';

const JobsList = ({ jobs, onSelectJob }) => {
    if (jobs.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No Jobs Posted</h3>
                <p>Post a new job to start recruiting candidates.</p>
            </div>
        );
    }

    return (
        <div className="jobs-grid">
            {jobs.map((job) => (
                <div key={job._id} className="job-card" onClick={() => onSelectJob(job)}>
                    <div className="job-card-header">
                        <h3>{job.title}</h3>
                        <span className={`status-badge status-${job.status.toLowerCase()}`}>
                            {job.status}
                        </span>
                    </div>
                    <div className="job-card-meta">
                        <span>🏢 {job.department}</span>
                        <span>📍 {job.location}</span>
                    </div>
                    <p className="job-card-desc">{job.description}</p>
                    <div className="job-card-footer">
                        <div className="applicants-count">
                            <strong>{job.applicantsCount}</strong> Candidates
                        </div>
                        <div className="job-date">
                            Posted {new Date(job.postedDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default JobsList;
