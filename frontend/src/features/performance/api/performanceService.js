import apiClient from '../../../api/apiClient';

export const getMyReviews = async () => {
    const response = await apiClient.get('/performance/my');
    return response.data;
};

export const acknowledgeReview = async (id) => {
    const response = await apiClient.patch(`/performance/${id}/acknowledge`);
    return response.data;
};

export const getAllReviews = async () => {
    const response = await apiClient.get('/performance');
    return response.data;
};

export const createReview = async (data) => {
    const response = await apiClient.post('/performance', data);
    return response.data;
};

// Goals API
export const createGoal = async (data) => {
    const response = await apiClient.post('/performance/goals', data);
    return response.data;
};

export const getMyGoals = async () => {
    const response = await apiClient.get('/performance/goals/my');
    return response.data;
};

export const updateGoalProgress = async (id, data) => {
    const response = await apiClient.patch(`/performance/goals/${id}`, data);
    return response.data;
};

// Peer Feedback API
export const submitFeedback = async (data) => {
    const response = await apiClient.post('/performance/feedback', data);
    return response.data;
};

// AI Performance Draft
export const generateAIDraft = async (employeeId) => {
    const response = await apiClient.post(`/performance/ai-draft/${employeeId}`);
    return response.data;
};
