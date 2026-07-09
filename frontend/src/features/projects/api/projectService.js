import apiClient from '../../../api/apiClient';

export const getProjects = async () => {
    const response = await apiClient.get('/projects');
    return response.data;
};

export const getProject = async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (data) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
};

export const updateProject = async (id, data) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
};

export const createTask = async (projectId, data) => {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
    return response.data;
};

export const updateTask = async (taskId, data) => {
    const response = await apiClient.put(`/projects/tasks/${taskId}`, data);
    return response.data;
};

export const deleteTask = async (taskId) => {
    const response = await apiClient.delete(`/projects/tasks/${taskId}`);
    return response.data;
};

