import apiClient from '../../../api/apiClient';

export const generatePayroll = async (payload) => {
    const response = await apiClient.post('/time-payroll/payroll/generate', payload);
    return response.data;
};

export const getMyPayslips = async () => {
    const response = await apiClient.get('/time-payroll/payroll/my');
    return response.data;
};

export const getAllPayrolls = async () => {
    const response = await apiClient.get('/time-payroll/payroll/all');
    return response.data;
};

export const updatePayrollStatus = async (id, status) => {
    const response = await apiClient.put(`/time-payroll/payroll/${id}/status`, { status });
    return response.data;
};

export const batchGeneratePayroll = async (payload) => {
    const response = await apiClient.post('/time-payroll/payroll/batch-generate', payload);
    return response.data;
};

export const runPayrollAIAudit = async (id) => {
    const response = await apiClient.post('/time-payroll/payroll/ai-audit', {});
    return response.data;
};

