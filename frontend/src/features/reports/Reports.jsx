import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { getDashboardStats } from './api/reportService';
import { 
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer 
} from 'recharts';
import '../../components/shared.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getDashboardStats();
                setData(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const exportToCSV = () => {
        if (!data) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Category,Metric,Value\n";
        
        // Summary stats
        csvContent += `Summary,Total Employees,${data.summary.totalEmployees}\n`;
        csvContent += `Summary,Total Assets,${data.summary.totalAssets}\n`;
        csvContent += `Summary,Total Tickets,${data.summary.totalTickets}\n`;
        csvContent += `Summary,Open Tickets,${data.summary.openTickets}\n`;

        // Departments
        data.charts.departmentDistribution.forEach(d => {
            csvContent += `Department Distribution,${d.name},${d.value}\n`;
        });

        // Asset Status
        data.charts.assetStatusDist.forEach(d => {
            csvContent += `Asset Status,${d.name},${d.value}\n`;
        });

        // Ticket Status
        data.charts.ticketStatusDist.forEach(d => {
            csvContent += `Ticket Status,${d.name},${d.value}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ewm_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <DashboardLayout title="Reports & Analytics">
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                    Loading Analytics...
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Reports & Analytics">
                <div className="alert-error">⚠️ {error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Reports & Analytics">
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Reports & Analytics</h1>
                        <p>High-level insights across all organizational modules</p>
                    </div>
                    <div>
                        <button className="btn-secondary" onClick={exportToCSV}>
                            📥 Export CSV Data
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 15, marginBottom: 30 }}>
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', borderTop: '4px solid #6366f1' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Employees</div>
                        <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 5 }}>{data.summary.totalEmployees}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', borderTop: '4px solid #10b981' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Assets</div>
                        <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 5 }}>{data.summary.totalAssets}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', borderTop: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Support Tickets</div>
                        <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 5 }}>{data.summary.totalTickets}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', borderTop: '4px solid #ef4444' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Open Support Tickets</div>
                        <div style={{ fontSize: 28, fontWeight: 'bold', marginTop: 5 }}>{data.summary.openTickets}</div>
                    </div>
                </div>

                {/* Charts Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                    
                    {/* Dept Chart */}
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: 20 }}>Employee Distribution</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.departmentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.charts.departmentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: 'none', borderRadius: 8, color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Ticket Status Chart */}
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: 20 }}>Help Desk Ticket Status</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.charts.ticketStatusDist}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                                    <XAxis dataKey="name" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: 'none', borderRadius: 8, color: '#fff' }} cursor={{fill: 'transparent'}}/>
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Asset Status Chart */}
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: 20 }}>Asset Availability</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.assetStatusDist}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        dataKey="value"
                                    >
                                        {data.charts.assetStatusDist.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: 'none', borderRadius: 8, color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Asset Category Chart */}
                    <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: 20 }}>Asset Categories</h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.charts.assetCategoryDist} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                                    <XAxis type="number" stroke="#6b7280" />
                                    <YAxis dataKey="name" type="category" stroke="#6b7280" width={100} />
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: 'none', borderRadius: 8, color: '#fff' }} cursor={{fill: 'transparent'}}/>
                                    <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Reports;
