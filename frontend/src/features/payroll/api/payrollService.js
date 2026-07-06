import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/time-payroll/payroll';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const generatePayroll = async (payload) => {
    const response = await axios.post(`${API_URL}/generate`, payload, getAuthHeader());
    return response.data;
};

export const getMyPayslips = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

export const getAllPayrolls = async () => {
    const response = await axios.get(`${API_URL}/all`, getAuthHeader());
    return response.data;
};

export const updatePayrollStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, getAuthHeader());
    return response.data;
};
