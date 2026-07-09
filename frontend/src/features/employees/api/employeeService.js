import apiClient from '../../../api/apiClient';

export const getEmployees = async () => {
    const response = await apiClient.get('/hr/employees');
    return response.data;
};

// Ready for when we implement the Add Employee modal
export const createEmployee = async (employeeData) => {
    const response = await apiClient.post('/hr/employees', employeeData);
    return response.data;
};

export const updateEmployee = async (id, data) => {
    const response = await apiClient.put(`/hr/employees/${id}`, data);
    return response.data;
};

// Profile APIs
export const getMyProfile = async () => {
    const response = await apiClient.get('/hr/employees/me');
    return response.data;
};

export const updateMyProfile = async (profileData) => {
    const response = await apiClient.put('/hr/employees/me', profileData);
    return response.data;
};

// Ready for when we implement Archive
export const archiveEmployee = async (id) => {
    const response = await apiClient.delete(`/hr/employees/${id}`);
    return response.data;
};

export const deleteEmployee = async (id) => {
    const response = await apiClient.delete(`/hr/employees/${id}/permanent`);
    return response.data;
};

