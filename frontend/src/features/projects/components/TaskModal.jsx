import React, { useState } from 'react';
import { createTask, updateTask, deleteTask } from '../api/projectService';
import './ProjectKanban.css'; // Reuse styles

const TaskModal = ({ task, projectId, teamMembers, onClose, onSave }) => {
    const isEdit = !!task;

    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        assignee: task?.assignee?._id || task?.assignee || '',
        priority: task?.priority || 'Medium',
        status: task?.status || 'To Do',
        timeLogged: '' // Only for inputting new time
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateTask(task._id, formData);
            } else {
                await createTask(projectId, formData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(task._id);
                onSave();
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Task Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Assignee</label>
                            <select name="assignee" value={formData.assignee} onChange={handleChange}>
                                <option value="">Unassigned</option>
                                {teamMembers.filter(m => m).map(member => (
                                    <option key={member._id} value={member._id}>{member.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="form-row">
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Log Time (Hours)</label>
                                <input 
                                    type="number" 
                                    name="timeLogged" 
                                    min="0" 
                                    step="0.5" 
                                    value={formData.timeLogged} 
                                    onChange={handleChange} 
                                    placeholder={`Total logged: ${task.totalTimeLogged}h`}
                                />
                            </div>
                        </div>
                    )}

                    <div className="modal-actions" style={{ justifyContent: isEdit ? 'space-between' : 'flex-end' }}>
                        {isEdit && (
                            <button type="button" className="btn" onClick={handleDelete} style={{ background: '#f87171', color: 'white' }}>
                                Delete Task
                            </button>
                        )}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Save Task</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
