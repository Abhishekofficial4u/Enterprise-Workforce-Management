import axios from 'axios';

// Use production backend or local depending on env. For simplicity, fallback to onrender
const API_URL = import.meta.env.VITE_API_URL || 'https://enterprise-workforce-management.onrender.com/api/v1';

export const getSettings = async () => {
    const token = localStorage.getItem('userToken');
    const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateSettings = async (settingsData) => {
    const token = localStorage.getItem('userToken');
    const response = await axios.put(`${API_URL}/settings`, settingsData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
