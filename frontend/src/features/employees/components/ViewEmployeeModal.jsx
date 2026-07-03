import React from 'react';
import '../../../components/shared.css';

const ViewEmployeeModal = ({ employee, onClose }) => {
    if (!employee) return null;

    const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>Employee Profile</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                <div style={{ display: 'flex', gap: '24px', padding: '16px 0' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '36px', color: 'white', fontWeight: 'bold'
                    }}>
                        {employee.name ? employee.name.split(' ').map(w => w[0]).join('') : '?'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>{employee.name}</h3>
                        <p style={{ margin: '0 0 16px 0', color: 'var(--text-muted)' }}>{employee.designation} • {employee.department}</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Employee ID</strong>
                                <span>{employee.employeeId}</span>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</strong>
                                <span className={`badge badge-${(employee.status || 'Active').toLowerCase()}`}>{employee.status || 'Active'}</span>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Email</strong>
                                <span>{employee.email}</span>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile</strong>
                                <span>{employee.mobile}</span>
                            </div>
                            <div>
                                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Joining Date</strong>
                                <span>{formatDate(employee.joiningDate)}</span>
                            </div>
                            {employee.salary !== undefined && (
                                <div>
                                    <strong style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>Salary (Annual)</strong>
                                    <span>${employee.salary.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewEmployeeModal;
