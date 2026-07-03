import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/time-payroll/attendance';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const clockIn = async () => {
    const response = await axios.post(`${API_URL}/clock-in`, {}, getAuthHeader());
    return response.data;
};

export const clockOut = async () => {
    const response = await axios.post(`${API_URL}/clock-out`, {}, getAuthHeader());
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
