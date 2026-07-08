const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/audit';

export const getAuditLogs = async (page = 1, limit = 50, filters = {}) => {
    let url = `${API_URL}?page=${page}&limit=${limit}`;
    if (filters.action) url += `&action=${filters.action}`;
    if (filters.resource) url += `&resource=${filters.resource}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
};
