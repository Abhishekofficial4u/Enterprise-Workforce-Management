import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/projects';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getProjects = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const getProject = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

export const createProject = async (data) => {
    const response = await axios.post(API_URL, data, getAuthHeader());
    return response.data;
};

export const updateProject = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};

export const createTask = async (projectId, data) => {
    const response = await axios.post(`${API_URL}/${projectId}/tasks`, data, getAuthHeader());
    return response.data;
};

export const updateTask = async (taskId, data) => {
    const response = await axios.put(`${API_URL}/tasks/${taskId}`, data, getAuthHeader());
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}`, getAuthHeader());
    return response.data;
};
