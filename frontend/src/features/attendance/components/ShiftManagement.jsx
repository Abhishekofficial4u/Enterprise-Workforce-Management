import React, { useState, useEffect } from 'react';
import { getShifts, createShift, deleteShift } from '../api/shiftService';
import { getEmployees } from '../../employees/api/employeeService';

const ShiftManagement = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    
    // Simple mock of employees for the dropdown. In a real app, this comes from an API.
    const [newShift, setNewShift] = useState({
        employeeId: '',
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        role: 'General',
        notes: ''
    });

    const fetchAllShifts = async () => {
        try {
            setLoading(true);
            const data = await getShifts();
            setShifts(data);
        } catch (error) {
            console.error('Error fetching shifts', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await getEmployees();
            setEmployees(res.data || []);
        } catch (error) {
            console.error('Error fetching employees', error);
        }
    };

    useEffect(() => {
        fetchAllShifts();
        fetchEmployees();
    }, []);

    const handleCreateShift = async (e) => {
        e.preventDefault();
        try {
            await createShift(newShift);
            setShowModal(false);
            setNewShift({ ...newShift, employeeId: '', notes: '' });
            fetchAllShifts();
        } catch (error) {
            alert('Error creating shift: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this shift?')) return;
        try {
            await deleteShift(id);
            fetchAllShifts();
        } catch (error) {
            alert('Error deleting shift');
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Shift Scheduling</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage employee work schedules and coverage.</p>
                </div>
                <button className="ewm-btn" onClick={() => setShowModal(true)}>+ Assign Shift</button>
            </div>

            {loading ? (
                <div>Loading shifts...</div>
            ) : (
                <div className="ewm-card" style={{ padding: 24 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Date</th>
                                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Employee</th>
                                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Time</th>
                                <th style={{ padding: '12px 0', color: 'var(--text-muted)' }}>Role</th>
                                <th style={{ padding: '12px 0', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.map(shift => (
                                <tr key={shift._id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px 0', fontWeight: 500 }}>
                                        {new Date(shift.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ 
                                            width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', 
                                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold'
                                        }}>
                                            {shift.employeeId?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{shift.employeeId?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{shift.employeeId?.department}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 0' }}>
                                        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '4px 8px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
                                            {shift.startTime} - {shift.endTime}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 0', color: 'var(--text-secondary)' }}>{shift.role}</td>
                                    <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                        <button className="ewm-btn-secondary" style={{ padding: '4px 8px', fontSize: 12, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(shift._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {shifts.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No shifts scheduled yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="ewm-card" style={{ width: 400, padding: 24 }}>
                        <h2 style={{ marginTop: 0, marginBottom: 20 }}>Assign Shift</h2>
                        <form onSubmit={handleCreateShift} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Employee</label>
                                <select 
                                    required 
                                    value={newShift.employeeId} 
                                    onChange={e => setNewShift({...newShift, employeeId: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Date</label>
                                <input 
                                    type="date" required 
                                    value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Start Time</label>
                                    <input 
                                        type="time" required 
                                        value={newShift.startTime} onChange={e => setNewShift({...newShift, startTime: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>End Time</label>
                                    <input 
                                        type="time" required 
                                        value={newShift.endTime} onChange={e => setNewShift({...newShift, endTime: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Role</label>
                                <input 
                                    type="text" required 
                                    value={newShift.role} onChange={e => setNewShift({...newShift, role: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                                <button type="button" className="ewm-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="ewm-btn">Save Shift</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftManagement;
