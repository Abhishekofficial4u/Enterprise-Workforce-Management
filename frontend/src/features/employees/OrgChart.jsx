import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, User, Mail, Briefcase, Hash, Building2 } from 'lucide-react';
import { Tree, TreeNode } from 'react-organizational-chart';
import './OrgChart.css';

const StyledNode = ({ node, onNodeClick }) => {
    return (
        <div className="org-card" onClick={() => onNodeClick(node)}>
            <div className="org-card-header">
                <div className="org-avatar">
                    {node.profilePhoto ? (
                        <img src={node.profilePhoto} alt={node.name} />
                    ) : (
                        <div className="org-avatar-placeholder"><User size={16} /></div>
                    )}
                </div>
                <div className="org-info">
                    <h4>{node.name}</h4>
                    <p>{node.designation}</p>
                </div>
            </div>
        </div>
    );
};

const renderTreeNodes = (nodes, onNodeClick) => {
    if (!nodes || nodes.length === 0) return null;
    return nodes.map((node) => (
        <TreeNode key={node._id} label={<StyledNode node={node} onNodeClick={onNodeClick} />}>
            {node.children && node.children.length > 0 && renderTreeNodes(node.children, onNodeClick)}
        </TreeNode>
    ));
};

const OrgChart = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.get('https://enterprise-workforce-management.onrender.com/api/v1/org/hierarchy', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setHierarchy(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load organization hierarchy');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading hierarchy...</div>;
    if (error) return <div style={{ padding: 40, color: 'var(--error)' }}>{error}</div>;

    return (
        <div className="org-chart-container">
            <div className="page-header" style={{ marginBottom: 40 }}>
                <h1>Organization Hierarchy</h1>
                <p>Visual map of the company reporting structure</p>
            </div>
            
            <div className="org-tree-wrapper">
                {hierarchy.length > 0 ? (
                    hierarchy.map(rootNode => (
                        <Tree
                            key={rootNode._id}
                            lineWidth={'2px'}
                            lineColor={'var(--border)'}
                            lineBorderRadius={'10px'}
                            lineHeight={'30px'}
                            nodePadding={'5px'}
                            label={<StyledNode node={rootNode} onNodeClick={setSelectedEmployee} />}
                        >
                            {rootNode.children && rootNode.children.length > 0 && renderTreeNodes(rootNode.children, setSelectedEmployee)}
                        </Tree>
                    ))
                ) : (
                    <div className="empty-state">No organization data found.</div>
                )}
            </div>

            {/* Employee Details Modal */}
            {selectedEmployee && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="ewm-card" style={{ width: 400, padding: 32, position: 'relative' }}>
                        <button 
                            onClick={() => setSelectedEmployee(null)}
                            style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            &times;
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 16, overflow: 'hidden' }}>
                                {selectedEmployee.profilePhoto ? (
                                    <img src={selectedEmployee.profilePhoto} alt={selectedEmployee.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    selectedEmployee.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h2 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{selectedEmployee.name}</h2>
                            <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 500 }}>{selectedEmployee.designation}</p>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                                <Hash size={18} />
                                <span>{selectedEmployee.employeeId || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                                <Mail size={18} />
                                <span>{selectedEmployee.email || 'No email available'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                                <Building2 size={18} />
                                <span>{selectedEmployee.department || 'General'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)' }}>
                                <Briefcase size={18} />
                                <span>{selectedEmployee.children?.length > 0 ? `Manages ${selectedEmployee.children.length} employees` : 'Individual Contributor'}</span>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                            <button className="ewm-btn" onClick={() => setSelectedEmployee(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrgChart;
