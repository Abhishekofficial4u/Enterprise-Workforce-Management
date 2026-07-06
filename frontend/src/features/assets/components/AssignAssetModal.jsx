import React, { useState, useEffect } from 'react';
import { updateAsset, deleteAsset } from '../api/assetService';
import { getEmployees } from '../../employees/api/employeeService';

const AssignAssetModal = ({ asset, onClose, onSuccess }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(asset.assignedTo?._id || '');
    const [status, setStatus] = useState(asset.status);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await getEmployees();
                setEmployees(res.data || []);
            } catch (err) {
                console.error("Failed to load employees", err);
            }
        };
        fetchEmployees();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { status };
            // If the user selected an employee, assign it
            // If empty, it means unassign (send null)
            payload.assignedTo = selectedEmployee || null;
            
            await updateAsset(asset._id, payload);
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update asset');
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to permanently delete ${asset.name} from inventory?`)) return;
        setLoading(true);
        try {
            await deleteAsset(asset._id);
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete asset');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 500 }}>
                <h2>Manage Asset</h2>
                <div style={{ marginBottom: 15, padding: 15, background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                    <strong>{asset.name}</strong> <br/>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{asset.assetTag} • {asset.category}</span>
                </div>
                
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-field">
                        <label>Asset Status</label>
                        <select 
                            value={status}
                            onChange={(e) => {
                                const newStatus = e.target.value;
                                setStatus(newStatus);
                                if (newStatus === 'Retired' || newStatus === 'Under Maintenance') {
                                    setSelectedEmployee('');
                                }
                            }}
                        >
                            <option>Available</option>
                            <option>Assigned</option>
                            <option>Under Maintenance</option>
                            <option>Retired</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label>Assigned Employee</label>
                        <select 
                            value={selectedEmployee}
                            onChange={(e) => {
                                setSelectedEmployee(e.target.value);
                                if (e.target.value) setStatus('Assigned');
                                else if (status === 'Assigned') setStatus('Available');
                            }}
                            disabled={status === 'Retired' || status === 'Under Maintenance'}
                        >
                            <option value="">-- Unassigned --</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.name} ({emp.employeeId})</option>
                            ))}
                        </select>
                        {(status === 'Retired' || status === 'Under Maintenance') && (
                            <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 4 }}>
                                Cannot assign while retired or under maintenance.
                            </div>
                        )}
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            {status === 'Retired' && (
                                <button type="button" className="btn-danger" onClick={handleDelete} disabled={loading} style={{ background: 'var(--danger)', color: 'white', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                    Delete Asset
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AssignAssetModal;
