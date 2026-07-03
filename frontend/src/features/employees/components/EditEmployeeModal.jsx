import React, { useState } from 'react';
import { updateEmployee } from '../api/employeeService';
import '../../../components/shared.css';

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        department: employee.department || 'Engineering',
        designation: employee.designation || '',
        salary: employee.salary || '',
        status: employee.status || 'Active'
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
            await updateEmployee(employee._id, {
                ...formData,
                salary: Number(formData.salary)
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while updating the employee.');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Employee: {employee.name}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                
                {error && <div className="alert-error" style={{ marginBottom: 15 }}>⚠️ {error}</div>}
                
                <form onSubmit={handleSubmit}>
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
                            <label>Salary (Annual)</label>
                            <input type="number" name="salary" className="form-input" required min="0"
                                   value={formData.salary} onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Status</label>
                            <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                                <option value="Active">Active</option>
                                <option value="Probation">Probation</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
