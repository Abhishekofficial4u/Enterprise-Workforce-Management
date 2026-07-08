import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAiSummary } from './api/reportService';
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
    const [aiSummary, setAiSummary] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);

    const handleGenerateSummary = async () => {
        if (!data) return;
        setGeneratingAI(true);
        try {
            const res = await getAiSummary(data);
            if (res.success) {
                setAiSummary(res.summary);
            } else {
                setAiSummary('Failed to generate summary.');
            }
        } catch (error) {
            setAiSummary('Error connecting to AI service.');
        } finally {
            setGeneratingAI(false);
        }
    };

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
            <>
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                    Loading Analytics...
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <div className="alert-error">⚠️ {error}</div>
            </>
        );
    }

    return (
        <>
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Reports & Analytics</h1>
                        <p>High-level insights across all organizational modules</p>
                    </div>
                    <div>
                        <button className="btn-secondary" onClick={exportToCSV} style={{ marginRight: 10 }}>
                            📥 Export CSV Data
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={handleGenerateSummary} 
                            disabled={generatingAI}
                            style={{ background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', border: 'none' }}
                        >
                            {generatingAI ? '✨ Analyzing Data...' : '✨ Generate AI Executive Summary'}
                        </button>
                    </div>
                </div>

                {/* AI Summary Section */}
                {aiSummary && (
                    <div style={{ marginBottom: 30, background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(to bottom, #8b5cf6, #ec4899)' }}></div>
                        <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            ✨ AI Executive Summary
                        </h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {aiSummary}
                        </p>
                    </div>
                )}

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

                {/* Predictive Analytics Section */}
                {data.predictive && data.predictive.burnoutRisk && (
                    <div style={{ marginTop: 30, background: 'var(--bg-card)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: 8, borderRadius: 8 }}>
                                🔥
                            </div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Predictive Analytics: Burnout Risk</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                            The system has identified these employees as having a high probability of burnout based on untaken leave balances and continuous work periods.
                        </p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                            {data.predictive.burnoutRisk.map((emp, idx) => (
                                <div key={`risk-${idx}`} className="ewm-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, borderLeft: `4px solid ${emp.riskScore > 80 ? '#ef4444' : '#f59e0b'}` }}>
                                    <div>
                                        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{emp.name}</h4>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.role} • {emp.department}</div>
                                    </div>
                                    
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                            <span style={{ color: 'var(--text-secondary)' }}>Risk Score</span>
                                            <span style={{ fontWeight: 'bold', color: emp.riskScore > 80 ? '#ef4444' : '#f59e0b' }}>{emp.riskScore}%</span>
                                        </div>
                                        <div style={{ width: '100%', background: 'var(--bg)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ width: `${emp.riskScore}%`, background: emp.riskScore > 80 ? '#ef4444' : '#f59e0b', height: '100%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Reports;
