import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { generatePayroll, getMyPayslips, getAllPayrolls, updatePayrollStatus } from './api/payrollService';
import { getEmployees } from '../employees/api/employeeService';
import '../../components/shared.css';

const Payroll = () => {
    const role = localStorage.getItem('userRole');
    const isAdmin = role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'FINANCE';

    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Generate Form State
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const [payRes, empRes] = await Promise.all([
                    getAllPayrolls(),
                    getEmployees()
                ]);
                setPayrolls(payRes.data);
                setEmployees(empRes.data);
            } else {
                const res = await getMyPayslips();
                setPayrolls(res.data);
            }
        } catch (err) {
            setError('Failed to load payroll data.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        setError('');
        try {
            await generatePayroll({ employeeId: selectedEmployee, payPeriod });
            // Refresh list
            fetchData();
            setSelectedEmployee('');
            alert('Payroll generated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating payroll');
        } finally {
            setGenerating(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updatePayrollStatus(id, newStatus);
            fetchData(); // Refresh list
        } catch (err) {
            alert('Error updating status');
        }
    };

    return (
        <DashboardLayout title="Payroll & Salary">
            <div className="shared-container">
                {error && <div className="alert-error">{error}</div>}

                {/* Admin/Finance Generate Section */}
                {isAdmin && (
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <span className="card-title">Generate Payroll</span>
                        </div>
                        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginTop: '16px' }}>
                            <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Employee</label>
                                <select 
                                    value={selectedEmployee} 
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Pay Period</label>
                                <input 
                                    type="month" 
                                    value={payPeriod}
                                    onChange={(e) => setPayPeriod(e.target.value)}
                                    required 
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={generating} style={{ height: '42px', padding: '0 24px' }}>
                                {generating ? 'Generating...' : 'Generate Payslip'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Payroll History Table */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">{isAdmin ? 'All Generated Payslips' : 'My Payslip History'}</span>
                    </div>

                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
                    ) : payrolls.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No payroll records found.
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ marginTop: '16px' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {isAdmin && <th>Employee</th>}
                                        <th>Period</th>
                                        <th>Basic</th>
                                        <th>HRA</th>
                                        <th>Overtime</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        {isAdmin && <th>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {payrolls.map(pay => (
                                        <tr key={pay._id}>
                                            {isAdmin && (
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{pay.employeeId?.name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pay.employeeId?.employeeId}</div>
                                                </td>
                                            )}
                                            <td>{pay.payPeriod}</td>
                                            <td>${pay.basicSalary?.toFixed(2)}</td>
                                            <td>${pay.hra?.toFixed(2)}</td>
                                            <td>${pay.overtimePay?.toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>${pay.netSalary?.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${pay.status.toLowerCase()}`}>{pay.status}</span>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    {pay.status === 'Draft' && (
                                                        <button className="btn-secondary" onClick={() => handleStatusUpdate(pay._id, 'Approved')} style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px' }}>Approve</button>
                                                    )}
                                                    {pay.status === 'Approved' && (
                                                        <button className="btn-primary" onClick={() => handleStatusUpdate(pay._id, 'Paid')} style={{ padding: '4px 8px', fontSize: '12px' }}>Mark Paid</button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Payroll;
