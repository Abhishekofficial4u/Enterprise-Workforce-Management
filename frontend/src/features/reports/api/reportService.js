import apiClient from '../../../api/apiClient';

export const getDashboardStats = async () => {
    const response = await apiClient.get('/reports/dashboard');
    return response.data;
};

export const getAiSummary = async (dashboardData) => {
    const response = await apiClient.post('/reports/ai-summary', { dashboardData });
    return response.data;
};

