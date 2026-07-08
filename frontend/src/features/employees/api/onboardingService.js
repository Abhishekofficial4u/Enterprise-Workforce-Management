import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://enterprise-workforce-management.onrender.com/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getOnboardingTasks = async (employeeId) => {
    const response = await axios.get(`${API_URL}/hr/employees/${employeeId}/onboarding`, getAuthHeader());
    return response.data;
};

export const createOnboardingTask = async (employeeId, taskData) => {
    const response = await axios.post(`${API_URL}/hr/employees/${employeeId}/onboarding`, taskData, getAuthHeader());
    return response.data;
};

export const generateStandardChecklist = async (employeeId) => {
    const response = await axios.post(`${API_URL}/hr/employees/${employeeId}/onboarding/generate`, {}, getAuthHeader());
    return response.data;
};

export const updateOnboardingTask = async (taskId, taskData) => {
    const response = await axios.put(`${API_URL}/hr/onboarding/${taskId}`, taskData, getAuthHeader());
    return response.data;
};

export const deleteOnboardingTask = async (taskId) => {
    const response = await axios.delete(`${API_URL}/hr/onboarding/${taskId}`, getAuthHeader());
    return response.data;
};
