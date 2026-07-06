import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/notifications';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getMyNotifications = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await axios.put(`${API_URL}/${id}/read`, {}, getAuthHeader());
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axios.put(`${API_URL}/read-all`, {}, getAuthHeader());
    return response.data;
};
