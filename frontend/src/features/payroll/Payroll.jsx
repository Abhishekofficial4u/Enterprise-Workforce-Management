import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../../components/shared.css';

const payrollData = [
    { month: 'Jan', amount: 18.4 }, { month: 'Feb', amount: 18.7 },
    { month: 'Mar', amount: 19.1 }, { month: 'Apr', amount: 18.9 },
    { month: 'May', amount: 20.2 }, { month: 'Jun', amount: 19.8 },
];

const mockPayroll = [
    { id: 'EMP001', name: 'Rahul Sharma',  dept: 'Engineering', basic: 60000, hra: 12000, bonus: 5000, overtime: 3000, deductions: 2500, net: 77500  },
    { id: 'EMP002', name: 'Priya Mehta',   dept: 'HR',          basic: 55000, hra: 11000, bonus: 0,    overtime: 0,    deductions: 2200, net: 63800  },
    { id: 'EMP003', name: 'Amit Verma',    dept: 'Finance',     basic: 65000, hra: 13000, bonus: 8000, overtime: 1500, deductions: 3000, net: 84500  },
    { id: 'EMP004', name: 'Sneha Patil',   dept: 'Marketing',   basic: 48000, hra: 9600,  bonus: 2000, overtime: 0,    deductions: 1900, net: 57700  },
    { id: 'EMP005', name: 'Karan Singh',   dept: 'Engineering', basic: 80000, hra: 16000, bonus: 10000,overtime: 4000, deductions: 3500, net: 106500 },
];

const fmt = n => '₹' + n.toLocaleString('en-IN');

const Payroll = () => (
    <DashboardLayout title="Payroll">
        <div>
            <div className="page-header">
                <div className="page-header-left">
                    <h1>Payroll Management</h1>
                    <p>June 2026 payroll — pending Finance approval</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary">👁️ Preview Payslips</button>
                    <button className="btn-primary">✅ Approve Payroll</button>
                </div>
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Total Payroll',  value: '₹19.8L',  icon: '💰', color: '#6366f1' },
                    { label: 'Employees Paid', value: '248',      icon: '👥', color: '#10b981' },
                    { label: 'Total Overtime', value: '₹1.2L',   icon: '⏰', color: '#f59e0b' },
                    { label: 'Total Deductions',value: '₹3.4L',  icon: '📉', color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 12, padding: '18px 20px',
                        borderTop: `3px solid ${s.color}`,
                        display: 'flex', gap: 14, alignItems: 'center'
                    }}>
                        <div style={{ fontSize: 28 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Bar Chart */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: 'var(--text-primary)' }}>Monthly Payroll Cost (₹ Lakhs)</div>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={payrollData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}
                                labelStyle={{ color: '#94a3b8' }}
                                itemStyle={{ color: '#818cf8' }}
                                formatter={v => [`₹${v}L`, 'Payroll']}
                            />
                            <Bar dataKey="amount" fill="#6366f1" radius={[6,6,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Payroll Status */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18, color: 'var(--text-primary)' }}>Payroll Status — June 2026</div>
                    {[
                        { step: 'Attendance Data Collected', done: true  },
                        { step: 'Leave Deductions Applied',  done: true  },
                        { step: 'Salary Calculated',         done: true  },
                        { step: 'Manager Review',            done: false },
                        { step: 'Finance Approval',          done: false },
                        { step: 'Payslips Generated',        done: false },
                    ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: s.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                border: `2px solid ${s.done ? '#10b981' : 'var(--border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, flexShrink: 0
                            }}>
                                {s.done ? '✓' : ''}
                            </div>
                            <span style={{ fontSize: 13.5, color: s.done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: s.done ? 500 : 400 }}>
                                {s.step}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payroll Table */}
            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Basic</th>
                            <th>HRA</th>
                            <th>Bonus</th>
                            <th>Overtime</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                            <th>Payslip</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockPayroll.map(e => (
                            <tr key={e.id}>
                                <td>
                                    <div className="emp-name">{e.name}</div>
                                    <div className="emp-id">{e.dept}</div>
                                </td>
                                <td>{fmt(e.basic)}</td>
                                <td>{fmt(e.hra)}</td>
                                <td style={{ color: e.bonus > 0 ? '#34d399' : 'var(--text-muted)' }}>{e.bonus > 0 ? fmt(e.bonus) : '—'}</td>
                                <td style={{ color: e.overtime > 0 ? '#34d399' : 'var(--text-muted)' }}>{e.overtime > 0 ? fmt(e.overtime) : '—'}</td>
                                <td style={{ color: '#f87171' }}>-{fmt(e.deductions)}</td>
                                <td><strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{fmt(e.net)}</strong></td>
                                <td><div className="icon-btn" title="Download Payslip">📄</div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="table-footer">
                    <span className="table-info">5 of 248 employees shown • June 2026</span>
                </div>
            </div>
        </div>
    </DashboardLayout>
);

export default Payroll;
