import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults(null);
                return;
            }
            
            setLoading(true);
            try {
                const res = await fetch(`https://enterprise-workforce-management.onrender.com/api/v1/org/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
                });
                const data = await res.json();
                if (data.success) {
                    setResults(data.data);
                    setShowDropdown(true);
                }
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleResultClick = (type, item) => {
        setShowDropdown(false);
        setQuery('');
        
        // Navigation logic based on result type
        const role = localStorage.getItem('userRole')?.toLowerCase();
        const base = role === 'super_admin' ? '/admin/dashboard' : `/${role === 'manager' ? 'manager' : 'hr'}/dashboard`;
        
        if (type === 'employee') {
            navigate(`${base}/employees`);
        } else if (type === 'project') {
            navigate(`${base}/projects`);
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative', width: '300px' }}>
            <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input 
                    type="text" 
                    placeholder="Search employees, projects..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results) setShowDropdown(true); }}
                    style={{ 
                        width: '100%', 
                        padding: '10px 14px 10px 36px', 
                        borderRadius: 20, 
                        border: '1px solid var(--border)', 
                        background: 'var(--bg-card)', 
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
            </div>
            
            {showDropdown && results && (
                <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, 
                    background: 'var(--bg-card)', border: '1px solid var(--border)', 
                    borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 1000,
                    maxHeight: 400, overflowY: 'auto'
                }}>
                    {loading && <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)' }}>Searching...</div>}
                    
                    {!loading && results.employees?.length === 0 && results.projects?.length === 0 && results.departments?.length === 0 && (
                        <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)' }}>No results found.</div>
                    )}
                    
                    {!loading && results.employees?.length > 0 && (
                        <div>
                            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg)' }}>Employees</div>
                            {results.employees.map(emp => (
                                <div key={emp._id} onClick={() => handleResultClick('employee', emp)} style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                                        {emp.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{emp.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.designation}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!loading && results.projects?.length > 0 && (
                        <div>
                            <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--bg)' }}>Projects</div>
                            {results.projects.map(proj => (
                                <div key={proj._id} onClick={() => handleResultClick('project', proj)} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{proj.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Status: {proj.status}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
