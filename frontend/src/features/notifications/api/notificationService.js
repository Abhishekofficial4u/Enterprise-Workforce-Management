import apiClient from '../../../api/apiClient';

export const getMyNotifications = async () => {
    const response = await apiClient.get('/notifications/my');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await apiClient.put(`/notifications/${id}/read`, {});
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await apiClient.put('/notifications/read-all', {});
    return response.data;
};

