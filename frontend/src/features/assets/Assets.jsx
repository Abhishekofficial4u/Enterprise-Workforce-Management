import React, { useState, useEffect } from 'react';
import { getAllAssets } from './api/assetService';
import AddAssetModal from './components/AddAssetModal';
import AssignAssetModal from './components/AssignAssetModal';
import '../../components/shared.css';

const Assets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // UI States
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [filterCategory, setFilterCategory] = useState('All');

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await getAllAssets();
            setAssets(res.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch assets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const filteredAssets = filterCategory === 'All' 
        ? assets 
        : assets.filter(a => a.category === filterCategory);

    // Stats
    const stats = [
        { label: 'Total Assets', value: assets.length, color: '#6366f1' },
        { label: 'Available', value: assets.filter(a => a.status === 'Available').length, color: '#10b981' },
        { label: 'Assigned', value: assets.filter(a => a.status === 'Assigned').length, color: '#f59e0b' },
        { label: 'Maintenance', value: assets.filter(a => a.status === 'Under Maintenance').length, color: '#ef4444' },
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'Available': return 'var(--success)';
            case 'Assigned': return 'var(--primary)';
            case 'Under Maintenance': return 'var(--warning)';
            case 'Retired': return 'var(--danger)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <>
            <div>
                <div className="page-header">
                    <div className="page-header-left">
                        <h1>Asset Management</h1>
                        <p>Track and assign company hardware and software licenses</p>
                    </div>
                    <div>
                        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                            ➕ Add Asset
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    {stats.map(s => (
                        <div key={s.label} className="card" style={{ padding: 20, borderLeft: `4px solid ${s.color}` }}>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{s.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: s.color === '#6366f1' ? 'var(--primary)' : 'var(--text-primary)' }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="search-filter-bar">
                    {['All', 'Hardware', 'Software', 'Accessory'].map(cat => (
                        <button
                            key={cat}
                            className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                            onClick={() => setFilterCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {error && <div className="alert-error" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

                <div className="data-table-wrap">
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                            Loading assets...
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tag ID</th>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Assigned To</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                                            No assets found.
                                        </td>
                                    </tr>
                                ) : filteredAssets.map(asset => (
                                    <tr key={asset._id}>
                                        <td style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>{asset.assetTag}</td>
                                        <td style={{ fontWeight: '600' }}>{asset.name}</td>
                                        <td>{asset.category}</td>
                                        <td>
                                            {asset.assignedTo ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                                                        {asset.assignedTo.name?.charAt(0)}
                                                    </div>
                                                    <span style={{ fontSize: 13 }}>{asset.assignedTo.name}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge" style={{ backgroundColor: `${getStatusColor(asset.status)}20`, color: getStatusColor(asset.status) }}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ padding: '4px 10px', fontSize: 12 }}
                                                onClick={() => setSelectedAsset(asset)}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showAddModal && (
                <AddAssetModal 
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchAssets();
                    }}
                />
            )}

            {selectedAsset && (
                <AssignAssetModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    onSuccess={() => {
                        setSelectedAsset(null);
                        fetchAssets();
                    }}
                />
            )}

        </>
    );
};

export default Assets;
