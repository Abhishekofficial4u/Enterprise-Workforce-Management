import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/performance';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getMyReviews = async () => {
    const response = await axios.get(`${API_URL}/my`);
    return response.data;
};

export const acknowledgeReview = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/acknowledge`);
    return response.data;
};

export const getAllReviews = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createReview = async (data) => {
    const response = await axios.post(API_URL, data);
    return response.data;
};

// Goals API
export const createGoal = async (data) => {
    const response = await axios.post(`${API_URL}/goals`, data);
    return response.data;
};

export const getMyGoals = async () => {
    const response = await axios.get(`${API_URL}/goals/my`);
    return response.data;
};

export const updateGoalProgress = async (id, data) => {
    const response = await axios.patch(`${API_URL}/goals/${id}`, data);
    return response.data;
};

// Peer Feedback API
export const submitFeedback = async (data) => {
    const response = await axios.post(`${API_URL}/feedback`, data);
    return response.data;
};

// AI Performance Draft
export const generateAIDraft = async (employeeId) => {
    const response = await axios.post(`${API_URL}/ai-draft/${employeeId}`);
    return response.data;
};
