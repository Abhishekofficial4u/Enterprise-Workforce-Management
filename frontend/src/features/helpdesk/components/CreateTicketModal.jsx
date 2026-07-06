import React, { useState } from 'react';
import { createTicket } from '../api/helpdeskService';

const CreateTicketModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        subject: '',
        category: 'IT',
        priority: 'Medium',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTicket(formData);
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create ticket');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 500 }}>
                <h2>Raise a Support Ticket</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-field">
                        <label>Subject</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Brief summary of the issue..."
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>IT</option>
                                <option>HR</option>
                                <option>Facilities</option>
                                <option>General</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select 
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Description</label>
                        <textarea 
                            rows="5"
                            required
                            placeholder="Please provide as much detail as possible..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateTicketModal;
