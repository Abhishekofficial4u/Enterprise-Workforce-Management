import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/reports';

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
