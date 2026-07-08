import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, createProject } from './api/projectService';
import { getEmployees } from '../employees/api/employeeService';
import './ProjectsHome.css';

const ProjectsHome = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        client: '',
        status: 'Planning',
        priority: 'Medium',
        manager: '',
        teamMembers: []
    });

    const userRole = localStorage.getItem('userRole');
    const canCreateProject = ['SUPER_ADMIN', 'ORG_ADMIN', 'HR_MANAGER', 'MANAGER'].includes(userRole);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [projRes, empRes] = await Promise.all([
                getProjects(),
                getEmployees()
            ]);
            setProjects(projRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            console.error('Error fetching projects/employees:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTeamMemberChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, teamMembers: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProject(formData);
            setIsCreateModalOpen(false);
            setFormData({
                name: '', description: '', client: '', status: 'Planning', priority: 'Medium', manager: '', teamMembers: []
            });
            fetchInitialData();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        }
    };

    return (
        <>
            <div className="projects-container">
                <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div className="page-header-left">
                        <h1>Project Management</h1>
                        <p>Track, manage, and deliver internal and client projects</p>
                    </div>
                    {canCreateProject && (
                        <div>
                            <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                                ➕ New Project
                            </button>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Total Projects</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {projects.length}
                        </div>
                    </div>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Planning</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {projects.filter(p => p.status === 'Planning').length}
                        </div>
                    </div>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Active</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>
                            {projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length}
                        </div>
                    </div>
                    <div className="card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Completed</div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                            {projects.filter(p => p.status === 'Completed').length}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading projects...</div>
                ) : (
                    <div className="projects-grid">
                        {projects.length === 0 ? (
                            <p className="no-data">No projects found. Create one to get started!</p>
                        ) : (
                            projects.map(project => (
                                <div key={project._id} className="project-card" onClick={() => navigate(`/dashboard/projects/${project._id}`)}>
                                    <div className="project-card-header">
                                        <h3>{project.name}</h3>
                                        <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="project-client">{project.client ? `Client: ${project.client}` : 'Internal Project'}</p>
                                    <p className="project-desc">{project.description}</p>
                                    
                                    <div className="project-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">Manager</span>
                                            <span className="meta-value">{project.manager?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Team Size</span>
                                            <span className="meta-value">{project.teamMembers?.length || 0} members</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Priority</span>
                                            <span className={`priority-indicator priority-${project.priority.toLowerCase()}`}>
                                                {project.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container project-modal">
                        <div className="modal-header">
                            <h2>Create New Project</h2>
                            <button className="close-btn" onClick={() => setIsCreateModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Project Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                            </div>
                            <div className="form-group">
                                <label>Client Name (Optional)</label>
                                <input type="text" name="client" value={formData.client} onChange={handleChange} />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="On Hold">On Hold</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select name="priority" value={formData.priority} onChange={handleChange}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Project Manager *</label>
                                <select name="manager" value={formData.manager} onChange={handleChange} required>
                                    <option value="">Select Manager</option>
                                    {employees.filter(emp => emp.status !== 'Archived').map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Team Members (Hold Ctrl/Cmd to select multiple)</label>
                                <select name="teamMembers" multiple value={formData.teamMembers} onChange={handleTeamMemberChange} style={{ height: '100px' }}>
                                    {employees.filter(emp => emp.status !== 'Archived').map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectsHome;
