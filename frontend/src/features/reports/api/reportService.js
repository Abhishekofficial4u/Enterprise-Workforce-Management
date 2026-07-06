import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/reports';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/dashboard`, getAuthHeader());
    return response.data;
};
