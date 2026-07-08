import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getAnnouncements = async () => {
    const response = await axios.get(`${API_URL}/org/announcements`, getAuthHeader());
    return response.data;
};

export const createAnnouncement = async (announcementData) => {
    const response = await axios.post(`${API_URL}/org/announcements`, announcementData, getAuthHeader());
    return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
    const response = await axios.put(`${API_URL}/org/announcements/${id}`, announcementData, getAuthHeader());
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await axios.delete(`${API_URL}/org/announcements/${id}`, getAuthHeader());
    return response.data;
};
