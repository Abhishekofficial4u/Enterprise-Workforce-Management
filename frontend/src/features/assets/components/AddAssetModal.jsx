import React, { useState } from 'react';
import { createAsset } from '../api/assetService';

const AddAssetModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Hardware',
        purchaseDate: '',
        cost: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAsset(formData);
            onSuccess();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add asset');
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: 500 }}>
                <h2>Add New Asset</h2>
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-field">
                        <label>Asset Name</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="e.g. MacBook Pro M3, Adobe CC License"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="form-field">
                        <label>Category</label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Hardware</option>
                            <option>Software</option>
                            <option>Accessory</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Purchase Date</label>
                            <input 
                                type="date"
                                required
                                value={formData.purchaseDate}
                                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cost ($)</label>
                            <input 
                                type="number" 
                                required 
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.cost}
                                onChange={(e) => setFormData({...formData, cost: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Asset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAssetModal;
