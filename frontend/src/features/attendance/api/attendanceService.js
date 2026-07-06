import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/time-payroll/attendance';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const clockIn = async (location = {}) => {
    const response = await axios.post(`${API_URL}/clock-in`, location, getAuthHeader());
    return response.data;
};

export const clockOut = async (location = {}) => {
    const response = await axios.post(`${API_URL}/clock-out`, location, getAuthHeader());
    return response.data;
};

export const getMyAttendance = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

export const getAllAttendance = async (dateStr) => {
    const query = dateStr ? `?date=${dateStr}` : '';
    const response = await axios.get(`${API_URL}/daily${query}`, getAuthHeader());
    return response.data;
};
