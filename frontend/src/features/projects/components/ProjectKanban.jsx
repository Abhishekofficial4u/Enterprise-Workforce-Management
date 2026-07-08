import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateTask, createTask, updateProject, deleteProject } from '../api/projectService';
import { getEmployees } from '../../employees/api/employeeService';
import TaskModal from './TaskModal';
import './ProjectKanban.css';

const columns = ['To Do', 'In Progress', 'Review', 'Done'];

const ProjectKanban = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [selectedTask, setSelectedTask] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    
    // Edit Project state
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [projectFormData, setProjectFormData] = useState({});
    
    // Drag & Drop state
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    const fetchProjectData = async () => {
        try {
            setLoading(true);
            const res = await getProject(id);
            setProject(res.data.project);
            setTasks(res.data.tasks);
        } catch (error) {
            console.error('Error fetching project data:', error);
            alert('Failed to load project');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
        getEmployees().then(res => setEmployees(res.data)).catch(console.error);
    }, [id]);

    const handleDragStart = (e, taskId) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", e.target.parentNode);
        e.dataTransfer.setDragImage(e.target, 20, 20);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        if (!draggedTaskId) return;

        const task = tasks.find(t => t._id === draggedTaskId);
        if (task.status === newStatus) return; // No change

        // Optimistic UI update
        setTasks(prev => prev.map(t => t._id === draggedTaskId ? { ...t, status: newStatus } : t));

        try {
            await updateTask(draggedTaskId, { status: newStatus });
        } catch (error) {
            console.error('Error updating task status:', error);
            // Revert on error
            fetchProjectData();
        }
        setDraggedTaskId(null);
    };

    const openNewTaskModal = () => {
        setSelectedTask(null);
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleTaskSaved = () => {
        setIsTaskModalOpen(false);
        fetchProjectData();
    };

    // Project Edit Handlers
    const openEditProjectModal = () => {
        setProjectFormData({
            name: project.name,
            description: project.description || '',
            client: project.client || '',
            status: project.status,
            priority: project.priority,
            manager: project.manager?._id || '',
            teamMembers: project.teamMembers?.map(m => m._id) || []
        });
        setIsEditProjectModalOpen(true);
    };

    const handleProjectChange = (e) => {
        const { name, value } = e.target;
        setProjectFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProjectTeamChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setProjectFormData(prev => ({ ...prev, teamMembers: value }));
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProject(project._id, projectFormData);
            setIsEditProjectModalOpen(false);
            fetchProjectData();
        } catch (error) {
            console.error('Error updating project:', error);
            alert('Failed to update project');
        }
    };

    const handleProjectDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project? All tasks will be permanently removed.')) {
            try {
                await deleteProject(project._id);
                navigate('/dashboard/projects');
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Failed to delete project');
            }
        }
    };

    if (loading) {
        return <><div className="loading">Loading board...</div></>;
    }

    if (!project) {
        return <><div className="error">Project not found</div></>;
    }

    return (
        <>
            <div className="kanban-container">
                <div className="kanban-header">
                    <div>
                        <h2>{project.name}</h2>
                        <p className="kanban-desc">{project.description}</p>
                    </div>
                    <div className="kanban-actions">
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard/projects')}>Back to Projects</button>
                        <button className="btn btn-secondary" onClick={openEditProjectModal}>⚙️ Edit Project</button>
                        <button className="btn btn-primary" onClick={openNewTaskModal}>+ Add Task</button>
                    </div>
                </div>

                <div className="kanban-board">
                    {columns.map(status => (
                        <div 
                            key={status} 
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, status)}
                        >
                            <div className="kanban-column-header">
                                <h3>{status}</h3>
                                <span className="task-count">
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>
                            
                            <div className="kanban-task-list">
                                {tasks.filter(t => t.status === status).map(task => (
                                    <div 
                                        key={task._id} 
                                        className="kanban-card"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task._id)}
                                        onClick={() => openEditTaskModal(task)}
                                    >
                                        <div className="task-priority-bar" data-priority={task.priority.toLowerCase()}></div>
                                        <h4>{task.title}</h4>
                                        <p className="task-brief">{task.description}</p>
                                        <div className="task-footer">
                                            <div className="task-assignee">
                                                {task.assignee ? task.assignee.name : 'Unassigned'}
                                            </div>
                                            {task.totalTimeLogged > 0 && (
                                                <div className="task-time-badge">
                                                    ⏱️ {task.totalTimeLogged}h
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isTaskModalOpen && (
                <TaskModal 
                    task={selectedTask} 
                    projectId={project._id}
                    teamMembers={[project.manager, ...(project.teamMembers || [])]}
                    onClose={() => setIsTaskModalOpen(false)} 
                    onSave={handleTaskSaved} 
                />
            )}

            {/* Edit Project Modal */}
            {isEditProjectModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container project-modal">
                        <div className="modal-header">
                            <h2>Edit Project Details</h2>
                            <button className="close-btn" onClick={() => setIsEditProjectModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleProjectSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Project Name *</label>
                                <input type="text" name="name" value={projectFormData.name || ''} onChange={handleProjectChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={projectFormData.description || ''} onChange={handleProjectChange} rows="3" />
                            </div>
                            <div className="form-group">
                                <label>Client Name (Optional)</label>
                                <input type="text" name="client" value={projectFormData.client || ''} onChange={handleProjectChange} />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select name="status" value={projectFormData.status} onChange={handleProjectChange}>
                                        <option value="Planning">Planning</option>
                                        <option value="Active">Active</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select name="priority" value={projectFormData.priority} onChange={handleProjectChange}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Project Manager *</label>
                                <select name="manager" value={projectFormData.manager} onChange={handleProjectChange} required>
                                    <option value="">Select Manager</option>
                                    {employees.filter(emp => emp.status !== 'Archived').map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Team Members (Hold Ctrl/Cmd to select multiple)</label>
                                <select name="teamMembers" multiple value={projectFormData.teamMembers} onChange={handleProjectTeamChange} style={{ height: '100px' }}>
                                    {employees.filter(emp => emp.status !== 'Archived').map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                                <button type="button" className="btn" onClick={handleProjectDelete} style={{ background: '#f87171', color: 'white' }}>Delete Project</button>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditProjectModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectKanban;
