import apiClient from '../../../api/apiClient';

export const getTrainingPrograms = async () => {
    const response = await apiClient.get('/hr/training');
    return response.data;
};

export const createTrainingProgram = async (data) => {
    const response = await apiClient.post('/hr/training', data);
    return response.data;
};

export const updateTrainingProgram = async (id, data) => {
    const response = await apiClient.put(`/hr/training/${id}`, data);
    return response.data;
};

export const deleteTrainingProgram = async (id) => {
    const response = await apiClient.delete(`/hr/training/${id}`);
    return response.data;
};

export const enrollEmployee = async (employeeId, trainingProgramId) => {
    const response = await apiClient.post('/hr/training/enroll', { employeeId, trainingProgramId });
    return response.data;
};

export const getProgramEnrollments = async (id) => {
    const response = await apiClient.get(`/hr/training/${id}/enrollments`);
    return response.data;
};

// Employee specific
export const getMyLearning = async () => {
    const response = await apiClient.get('/hr/employees/me/learning');
    return response.data;
};

export const updateEnrollmentStatus = async (id, status) => {
    const response = await apiClient.put(`/hr/learning/enrollments/${id}`, { status });
    return response.data;
};

