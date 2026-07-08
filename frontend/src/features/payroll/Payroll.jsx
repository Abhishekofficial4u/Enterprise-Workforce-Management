import React, { useState, useEffect, useMemo } from 'react';
import { generatePayroll, batchGeneratePayroll, getMyPayslips, getAllPayrolls, updatePayrollStatus, runPayrollAIAudit } from './api/payrollService';
import { getEmployees } from '../employees/api/employeeService';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import '../../components/shared.css';

const Payroll = () => {
    const role = localStorage.getItem('userRole');
    const isAdmin = role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'FINANCE';

    const [payrolls, setPayrolls] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [aiResult, setAiResult] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Generate Form State
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [payPeriod, setPayPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [generating, setGenerating] = useState(false);
    const [batchGenerating, setBatchGenerating] = useState(false);

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
            fetchData();
            setSelectedEmployee('');
            alert('Payroll generated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating payroll');
        } finally {
            setGenerating(false);
        }
    };

    const handleBatchGenerate = async () => {
        if (!window.confirm(`Are you sure you want to generate payroll for ALL active employees for ${payPeriod}?`)) return;
        setBatchGenerating(true);
        setError('');
        try {
            const res = await batchGeneratePayroll({ payPeriod });
            fetchData();
            alert(res.message || 'Batch payroll generated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating batch payroll');
        } finally {
            setBatchGenerating(false);
        }
    const handleAIAudit = async () => {
        try {
            setAnalyzing(true);
            const result = await runPayrollAIAudit();
            if (result.success) {
                setAiResult(result.data);
            } else {
                alert(result.message || 'AI Audit failed');
            }
        } catch (error) {
            alert('Error running AI audit');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updatePayrollStatus(id, newStatus);
            fetchData(); 
        } catch (err) {
            alert('Error updating status');
        }
    };

    // Calculate aggregated stats
    const totalDisbursed = useMemo(() => {
        return payrolls.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
    }, [payrolls]);

    const pendingReview = useMemo(() => {
        return payrolls.filter(p => p.status === 'Pending' || p.status === 'Draft').length;
    }, [payrolls]);

    // Department wise expenditure for chart
    const deptStats = useMemo(() => {
        if (!isAdmin || !payrolls.length) return [];
        const map = {};
        payrolls.forEach(p => {
            const dept = p.employeeId?.department || 'Unknown';
            map[dept] = (map[dept] || 0) + (p.netSalary || 0);
        });
        return Object.keys(map).map(dept => ({ name: dept, total: map[dept] })).sort((a,b) => b.total - a.total);
    }, [payrolls, isAdmin]);

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6'];

    return (
        <>
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>{isAdmin ? 'Payroll Management' : 'My Payslips'}</h1>
                        <p>{isAdmin ? 'Manage, generate, and audit organizational payrolls' : 'View and download your salary slips'}</p>
                    </div>
                </div>

                {error && <div className="alert-error" style={{marginBottom: 20}}>⚠️ {error}</div>}

                {/* KPI Cards */}
                {isAdmin && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                        <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Total Disbursed (Paid)</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
                                ${totalDisbursed.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Pending / Draft Slips</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
                                {pendingReview}
                            </div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Total Payrolls Generated</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>
                                {payrolls.length}
                            </div>
                        </div>
                    </div>
                )}

                {/* Optional Chart */}
                {isAdmin && deptStats.length > 0 && (
                    <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: 15, color: 'var(--text-primary)' }}>Payroll Expenditure by Department</h4>
                        <div style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptStats}>
                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                                    <RechartsTooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }}
                                        formatter={(value) => [`$${value.toLocaleString()}`, 'Total Cost']}
                                    />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                        {deptStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

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
                            <button type="submit" className="btn-primary" disabled={generating || batchGenerating} style={{ height: '42px', padding: '0 24px' }}>
                                {generating ? 'Generating...' : 'Generate Payslip'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={handleBatchGenerate} disabled={generating || batchGenerating} style={{ height: '42px', padding: '0 24px' }}>
                                {batchGenerating ? 'Processing Batch...' : 'Batch Generate All'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Payroll History Table */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">{isAdmin ? 'All Generated Payslips' : 'My Payslip History'}</span>
                        {isAdmin && (
                            <button className="ewm-btn-secondary" onClick={handleAIAudit} disabled={analyzing}>
                                {analyzing ? 'Scanning...' : '✨ Run AI Audit'}
                            </button>
                        )}
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
                                        <th>Deductions</th>
                                        <th>Net Salary</th>
                                        <th>Status</th>
                                        <th>Actions</th>
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
                                            <td style={{ color: 'var(--danger)' }}>-${pay.deductions?.toFixed(2)}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--success)' }}>${pay.netSalary?.toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge ${pay.status.toLowerCase()}`}>{pay.status}</span>
                                            </td>
                                            <td>
                                                {isAdmin ? (
                                                    <>
                                                        {pay.status === 'Draft' && (
                                                            <button className="btn-secondary" onClick={() => handleStatusUpdate(pay._id, 'Approved')} style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px' }}>Approve</button>
                                                        )}
                                                        {pay.status === 'Approved' && (
                                                            <button className="btn-primary" onClick={() => handleStatusUpdate(pay._id, 'Paid')} style={{ padding: '4px 8px', fontSize: '12px' }}>Mark Paid</button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button className="ewm-btn-secondary" onClick={() => window.print()} style={{ padding: '4px 8px', fontSize: '12px' }}>Download PDF</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Result Modal */}
            {aiResult && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="ewm-card" style={{ maxWidth: 600, width: '100%', padding: 32, maxHeight: '80vh', overflowY: 'auto' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginTop: 0 }}>
                            ✨ AI Payroll Audit
                        </h2>
                        
                        <div style={{ margin: '20px 0' }}>
                            <p style={{ color: 'var(--text-primary)', fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                                {aiResult.summary}
                            </p>
                            
                            <h4 style={{ marginBottom: 12, color: 'var(--danger)' }}>Anomalies Detected ({aiResult.anomalies?.length || 0})</h4>
                            
                            {aiResult.anomalies?.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {aiResult.anomalies.map((anom, idx) => (
                                        <div key={idx} style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, borderLeft: `4px solid ${anom.severity === 'HIGH' ? 'var(--danger)' : 'var(--warning)'}` }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                {anom.severity} Severity <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}>({anom.payrollId})</span>
                                            </div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{anom.reason}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: 16, borderRadius: 8, fontWeight: 500 }}>
                                    ✅ No significant anomalies detected in recent payrolls.
                                </div>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="ewm-btn" onClick={() => setAiResult(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Payroll;
