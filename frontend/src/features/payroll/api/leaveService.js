import apiClient from '../../../api/apiClient';

export const applyLeave = async (payload) => {
    const response = await apiClient.post('/time-payroll/leave', payload);
    return response.data;
};

export const getMyLeaves = async () => {
    const response = await apiClient.get('/time-payroll/leave/my');
    return response.data;
};

export const getMyLeaveBalance = async () => {
    const response = await apiClient.get('/time-payroll/leave/balance');
    return response.data;
};

export const getAllLeaves = async () => {
    const response = await apiClient.get('/time-payroll/leave/all');
    return response.data;
};

export const updateLeaveStatus = async (id, status) => {
    const response = await apiClient.patch(`/time-payroll/leave/${id}/status`, { status });
    return response.data;
};

export const runAiPrediction = async (payload) => {
    const response = await apiClient.post('/time-payroll/leave/ai-prediction', payload);
    return response.data;
};

