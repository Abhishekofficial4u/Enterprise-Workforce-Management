import React, { useState } from 'react';
import { createEmployee } from '../api/employeeService';
import '../../../components/shared.css';

const AddEmployeeModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        department: 'Engineering',
        designation: '',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [createdCreds, setCreatedCreds] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await createEmployee({
                ...formData,
                salary: Number(formData.salary)
            });
            // Show the credentials to the admin instead of closing immediately
            setCreatedCreds({
                email: formData.email,
                password: res.tempPassword
            });
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while creating the employee.');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Employee</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                {error && <div className="alert-error" style={{ marginBottom: 15 }}>⚠️ {error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" className="form-input" required
                               value={formData.name} onChange={handleChange} />
                    </div>
                    
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Email Address</label>
                            <input type="email" name="email" className="form-input" required
                                   value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Mobile Number</label>
                            <input type="tel" name="mobile" className="form-input" required pattern="\d{10}" title="10 digit mobile number"
                                   value={formData.mobile} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Department</label>
                            <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                                <option value="Engineering">Engineering</option>
                                <option value="HR">HR</option>
                                <option value="Finance">Finance</option>
                                <option value="Marketing">Marketing</option>
                                <option value="IT">IT</option>
                                <option value="Operations">Operations</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Designation / Role</label>
                            <input type="text" name="designation" className="form-input" required
                                   value={formData.designation} onChange={handleChange} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Joining Date</label>
                            <input type="date" name="joiningDate" className="form-input" required
                                   value={formData.joiningDate} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Salary (Annual)</label>
                            <input type="number" name="salary" className="form-input" required min="0"
                                   value={formData.salary} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Add Employee'}
                        </button>
                    </div>
                </form>

                {createdCreds && (
                    <div style={{ marginTop: 20, padding: 15, background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: 8 }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: 10 }}>✅ Employee Created!</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                            An email has been sent to the employee. However, you can also copy their temporary credentials below:
                        </p>
                        <div style={{ fontFamily: 'monospace', fontSize: 14, background: '#111', padding: 10, borderRadius: 5 }}>
                            <div><strong>Email:</strong> {createdCreds.email}</div>
                            <div><strong>Password:</strong> {createdCreds.password}</div>
                        </div>
                        <button className="btn-primary" style={{ width: '100%', marginTop: 15 }} onClick={onSuccess}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddEmployeeModal;
