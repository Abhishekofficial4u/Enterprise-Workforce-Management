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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createEmployee({
                ...formData,
                salary: Number(formData.salary)
            });
            onSuccess(); // Triggers a re-fetch and closes modal
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
            </div>
        </div>
    );
};

export default AddEmployeeModal;
