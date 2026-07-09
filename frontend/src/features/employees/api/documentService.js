import apiClient from '../../../api/apiClient';

export const getDocuments = async (employeeId) => {
    const response = await apiClient.get(`/hr/employees/${employeeId}/documents`);
    return response.data;
};

export const addDocument = async (employeeId, docData) => {
    let headers = {};
    if (docData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await apiClient.post(`/hr/employees/${employeeId}/documents`, docData, { headers });
    return response.data;
};

export const deleteDocument = async (docId) => {
    const response = await apiClient.delete(`/hr/documents/${docId}`);
    return response.data;
};

