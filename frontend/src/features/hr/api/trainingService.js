import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://enterprise-workforce-management.onrender.com/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getTrainingPrograms = async () => {
    const response = await axios.get(`${API_URL}/hr/training`, getAuthHeader());
    return response.data;
};

export const createTrainingProgram = async (data) => {
    const response = await axios.post(`${API_URL}/hr/training`, data, getAuthHeader());
    return response.data;
};

export const updateTrainingProgram = async (id, data) => {
    const response = await axios.put(`${API_URL}/hr/training/${id}`, data, getAuthHeader());
    return response.data;
};

export const deleteTrainingProgram = async (id) => {
    const response = await axios.delete(`${API_URL}/hr/training/${id}`, getAuthHeader());
    return response.data;
};

export const enrollEmployee = async (employeeId, trainingProgramId) => {
    const response = await axios.post(`${API_URL}/hr/training/enroll`, { employeeId, trainingProgramId }, getAuthHeader());
    return response.data;
};

export const getProgramEnrollments = async (id) => {
    const response = await axios.get(`${API_URL}/hr/training/${id}/enrollments`, getAuthHeader());
    return response.data;
};

// Employee specific
export const getMyLearning = async () => {
    const response = await axios.get(`${API_URL}/hr/employees/me/learning`, getAuthHeader());
    return response.data;
};

export const updateEnrollmentStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/hr/learning/enrollments/${id}`, { status }, getAuthHeader());
    return response.data;
};
