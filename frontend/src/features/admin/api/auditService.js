import apiClient from '../../../api/apiClient';

export const getAuditLogs = async (page = 1, limit = 50, filters = {}) => {
    let url = `/audit?page=${page}&limit=${limit}`;
    if (filters.action) url += `&action=${filters.action}`;
    if (filters.resource) url += `&resource=${filters.resource}`;

    const response = await apiClient.get(url);
    return response.data;
};

