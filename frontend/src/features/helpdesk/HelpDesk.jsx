import React, { useState, useEffect } from 'react';
import { getMyTickets, getAllTickets } from './api/helpdeskService';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailsModal from './components/TicketDetailsModal';
import '../../components/shared.css';

const HelpDesk = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');

    const token = localStorage.getItem('userToken');
    let decoded = null;
    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            decoded = JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Failed to parse token');
        }
    }
    const userRole = decoded?.role || 'EMPLOYEE';
    const isAdmin = ['SUPER_ADMIN', 'IT_ADMIN', 'HR_MANAGER'].includes(userRole);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const res = isAdmin ? await getAllTickets() : await getMyTickets();
            setTickets(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredTickets = filterStatus === 'All' 
        ? tickets 
        : tickets.filter(t => t.status === filterStatus);

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
        <>
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Help Desk</h1>
                        <p>{isAdmin ? 'Manage employee IT and HR support tickets' : 'Submit and track your support tickets'}</p>
                    </div>
                    <div>
                        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                            ➕ Raise Ticket
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                {isAdmin && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                        <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--danger)' }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Open Tickets</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {tickets.filter(t => t.status === 'Open').length}
                            </div>
                        </div>
                        <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--warning)' }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>In Progress</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {tickets.filter(t => t.status === 'In Progress').length}
                            </div>
                        </div>
                        <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--success)' }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Resolved</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success)' }}>
                                {tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}
                            </div>
                        </div>
                        <div className="card" style={{ padding: 20, borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Total Tickets</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
                                {tickets.length}
                            </div>
                        </div>
                    </div>
                )}

                <div className="search-filter-bar">
                    {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                        <button
                            key={status}
                            className={`filter-chip ${filterStatus === status ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {error && <div className="alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

                <div className="data-table-wrap">
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                            Loading tickets...
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ticket ID</th>
                                    <th>Subject</th>
                                    {isAdmin && <th>Requested By</th>}
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                                            No tickets found.
                                        </td>
                                    </tr>
                                ) : filteredTickets.map(ticket => (
                                    <tr key={ticket._id} onClick={() => setSelectedTicket(ticket)} style={{ cursor: 'pointer' }} className="hover-row">
                                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{ticket.ticketId}</td>
                                        <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {ticket.subject}
                                        </td>
                                        {isAdmin && (
                                            <td>{ticket.employeeId?.name || 'Unknown'}</td>
                                        )}
                                        <td>{ticket.category}</td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: `${getPriorityColor(ticket.priority)}20`, color: getPriorityColor(ticket.priority) }}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: `${getStatusColor(ticket.status)}20`, color: getStatusColor(ticket.status) }}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <CreateTicketModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchTickets();
                    }}
                />
            )}

            {selectedTicket && (
                <TicketDetailsModal
                    ticket={selectedTicket}
                    isAdmin={isAdmin}
                    onClose={() => setSelectedTicket(null)}
                    onSuccess={() => {
                        fetchTickets();
                        setSelectedTicket(null);
                    }}
                />
            )}

        </>
    );
};

export default HelpDesk;
