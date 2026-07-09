import apiClient from '../../../api/apiClient';

export const getOnboardingTasks = async (employeeId) => {
    const response = await apiClient.get(`/hr/employees/${employeeId}/onboarding`);
    return response.data;
};

export const createOnboardingTask = async (employeeId, taskData) => {
    const response = await apiClient.post(`/hr/employees/${employeeId}/onboarding`, taskData);
    return response.data;
};

export const generateStandardChecklist = async (employeeId) => {
    const response = await apiClient.post(`/hr/employees/${employeeId}/onboarding/generate`, {});
    return response.data;
};

export const updateOnboardingTask = async (taskId, taskData) => {
    const response = await apiClient.put(`/hr/onboarding/${taskId}`, taskData);
    return response.data;
};

export const deleteOnboardingTask = async (taskId) => {
    const response = await apiClient.delete(`/hr/onboarding/${taskId}`);
    return response.data;
};

