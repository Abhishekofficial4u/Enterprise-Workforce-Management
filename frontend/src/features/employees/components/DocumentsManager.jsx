import React, { useState, useEffect } from 'react';
import { getDocuments, addDocument, deleteDocument } from '../api/documentService';
import { FileText, Download, Trash2, Plus } from 'lucide-react';

const DocumentsManager = ({ employeeId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', type: 'Resume', url: '', file: null });

    useEffect(() => {
        if (employeeId) {
            fetchDocs();
        }
    }, [employeeId]);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await getDocuments(employeeId);
            setDocuments(res.data);
        } catch (error) {
            console.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            let payload;
            if (newDoc.file) {
                payload = new FormData();
                payload.append('title', newDoc.title);
                payload.append('type', newDoc.type);
                payload.append('file', newDoc.file);
            } else {
                payload = { title: newDoc.title, type: newDoc.type, url: newDoc.url };
            }

            await addDocument(employeeId, payload);
            fetchDocs();
            setShowModal(false);
            setNewDoc({ title: '', type: 'Resume', url: '', file: null });
        } catch (error) {
            alert('Error adding document: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await deleteDocument(id);
            fetchDocs();
        } catch (error) {
            alert('Error deleting document');
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Loading documents...</div>;

    return (
        <div style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>Document Vault</h3>
                <button className="ewm-btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setShowModal(true)}>
                    <Plus size={14} /> Upload Document
                </button>
            </div>

            {documents.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    No documents found. Upload contracts, IDs, or certifications here.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {documents.map(doc => (
                        <div key={doc._id} style={{ padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '8px' }}>
                                    <FileText size={24} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={doc.title}>{doc.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{doc.type}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                                Added on {new Date(doc.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="ewm-btn" style={{ flex: 1, padding: '6px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                                    <Download size={12} /> View
                                </a>
                                <button className="ewm-btn-secondary" style={{ padding: '6px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(doc._id)}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="ewm-card" style={{ width: 400, padding: 24 }}>
                        <h3 style={{ marginTop: 0, marginBottom: 20 }}>Upload Document</h3>
                        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Document Title</label>
                                <input 
                                    type="text" required 
                                    value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                                    placeholder="e.g. Employment Contract 2026"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Document Type</label>
                                <select 
                                    value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                                >
                                    <option value="Resume" style={{ background: '#1e1e2d', color: '#fff' }}>Resume</option>
                                    <option value="Contract" style={{ background: '#1e1e2d', color: '#fff' }}>Contract</option>
                                    <option value="ID" style={{ background: '#1e1e2d', color: '#fff' }}>ID / Passport</option>
                                    <option value="Certification" style={{ background: '#1e1e2d', color: '#fff' }}>Certification</option>
                                    <option value="Policy" style={{ background: '#1e1e2d', color: '#fff' }}>Policy Acknowledgment</option>
                                    <option value="Other" style={{ background: '#1e1e2d', color: '#fff' }}>Other</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Upload File</label>
                                <input 
                                    type="file"
                                    onChange={e => setNewDoc({...newDoc, file: e.target.files[0], url: ''})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)' }}
                                />
                                <div style={{ textAlign: 'center', margin: '10px 0', color: 'var(--text-muted)' }}>OR</div>
                                <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>Document URL (S3/Cloud)</label>
                                <input 
                                    type="url" 
                                    required={!newDoc.file} 
                                    disabled={!!newDoc.file}
                                    value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', opacity: newDoc.file ? 0.5 : 1 }}
                                    placeholder="https://..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                                <button type="button" className="ewm-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="ewm-btn">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentsManager;
