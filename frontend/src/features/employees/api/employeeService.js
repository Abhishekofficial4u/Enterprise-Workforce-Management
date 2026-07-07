import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/hr/employees';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getEmployees = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

// Ready for when we implement the Add Employee modal
export const createEmployee = async (employeeData) => {
    const response = await axios.post(API_URL, employeeData, getAuthHeader());
    return response.data;
};

export const updateEmployee = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    return response.data;
};

// Profile APIs
export const getMyProfile = async () => {
    const response = await axios.get(`${API_URL}/me`, getAuthHeader());
    return response.data;
};

export const updateMyProfile = async (profileData) => {
    const response = await axios.put(`${API_URL}/me`, profileData, getAuthHeader());
    return response.data;
};

// Ready for when we implement Archive
export const archiveEmployee = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

export const deleteEmployee = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}/permanent`, getAuthHeader());
    return response.data;
};
