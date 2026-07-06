import React, { useState } from 'react';
import { updateTicket, addResponse } from '../api/helpdeskService';
import './TicketDetailsModal.css';

const TicketDetailsModal = ({ ticket, onClose, onSuccess, isAdmin }) => {
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Status update handling
    const handleStatusChange = async (newStatus) => {
        try {
            await updateTicket(ticket._id, { status: newStatus });
            onSuccess();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    // Add reply
    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setLoading(true);
        try {
            await addResponse(ticket._id, replyText);
            setReplyText('');
            onSuccess(); // refresh ticket data
        } catch (error) {
            alert('Failed to send reply');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Open': return 'var(--danger)';
            case 'In Progress': return 'var(--warning)';
            case 'Resolved': return 'var(--success)';
            case 'Closed': return 'var(--text-muted)';
            default: return 'var(--text-secondary)';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'Urgent': return 'var(--danger)';
            case 'High': return '#f97316';
            case 'Medium': return 'var(--warning)';
            case 'Low': return 'var(--success)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content ticket-modal">
                <button className="close-btn" onClick={onClose}>×</button>
                
                <div className="ticket-header">
                    <div className="ticket-title-row">
                        <h2>{ticket.subject}</h2>
                        <span className="ticket-id">{ticket.ticketId}</span>
                    </div>
                    <div className="ticket-meta">
                        <span className="badge" style={{ backgroundColor: `${getStatusColor(ticket.status)}20`, color: getStatusColor(ticket.status) }}>
                            {ticket.status}
                        </span>
                        <span className="badge" style={{ backgroundColor: `${getPriorityColor(ticket.priority)}20`, color: getPriorityColor(ticket.priority) }}>
                            {ticket.priority} Priority
                        </span>
                        <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                            {ticket.category}
                        </span>
                    </div>
                </div>

                <div className="ticket-body">
                    <div className="ticket-description-box">
                        <strong>Original Request:</strong>
                        <p>{ticket.description}</p>
                        <div className="request-meta">
                            By {ticket.employeeId?.name || 'Unknown'} on {new Date(ticket.createdAt).toLocaleString()}
                        </div>
                    </div>

                    <div className="ticket-thread">
                        <h3>Conversation Thread</h3>
                        <div className="thread-list">
                            {ticket.responses && ticket.responses.length > 0 ? (
                                ticket.responses.map(resp => (
                                    <div key={resp._id} className={`thread-item ${resp.sender._id === ticket.employeeId?._id ? 'user-reply' : 'admin-reply'}`}>
                                        <div className="thread-header">
                                            <strong>{resp.sender.name || 'Admin'}</strong>
                                            <span>{new Date(resp.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="thread-message">{resp.message}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-replies">No replies yet.</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSendReply} className="reply-form">
                        <textarea
                            placeholder="Type your reply here..."
                            rows="3"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            required
                        ></textarea>
                        <button type="submit" className="btn-primary" disabled={loading || ticket.status === 'Closed'}>
                            {loading ? 'Sending...' : 'Send Reply'}
                        </button>
                    </form>
                </div>

                {isAdmin && ticket.status !== 'Closed' && (
                    <div className="ticket-admin-actions">
                        <h4>Admin Actions</h4>
                        <div className="action-buttons">
                            {ticket.status === 'Open' && (
                                <button className="btn-secondary" onClick={() => handleStatusChange('In Progress')}>
                                    Mark In Progress
                                </button>
                            )}
                            {ticket.status !== 'Resolved' && (
                                <button className="btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleStatusChange('Resolved')}>
                                    Mark as Resolved
                                </button>
                            )}
                            <button className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleStatusChange('Closed')}>
                                Close Ticket
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetailsModal;
