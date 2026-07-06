import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/auth';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userRole', response.data.role);
    }
    return response.data;
};
