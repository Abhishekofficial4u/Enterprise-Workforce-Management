import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/auth';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userRole', response.data.role); // Legacy fallback
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles || []));
        localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions || []));
    }
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await axios.put(`${API_URL}/reset-password/${token}`, { password });
    return response.data;
};
