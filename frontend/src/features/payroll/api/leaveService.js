import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/time-payroll/leave';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const applyLeave = async (payload) => {
    const response = await axios.post(API_URL, payload, getAuthHeader());
    return response.data;
};

export const getMyLeaves = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

export const getMyLeaveBalance = async () => {
    const response = await axios.get(`${API_URL}/balance`, getAuthHeader());
    return response.data;
};

export const getAllLeaves = async () => {
    const response = await axios.get(`${API_URL}/all`, getAuthHeader());
    return response.data;
};

export const updateLeaveStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, getAuthHeader());
    return response.data;
};
