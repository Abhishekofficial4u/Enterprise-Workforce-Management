import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/recruitment';

// Interceptor to add auth token
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Jobs API
export const getJobs = async () => {
    const response = await axios.get(`${API_URL}/jobs`);
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await axios.post(`${API_URL}/jobs`, jobData);
    return response.data;
};

export const updateJobStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/jobs/${id}/status`, { status });
    return response.data;
};

// Candidates API
export const getCandidates = async (jobId) => {
    const response = await axios.get(`${API_URL}/jobs/${jobId}/candidates`);
    return response.data;
};

export const createCandidate = async (candidateData) => {
    const response = await axios.post(`${API_URL}/candidates`, candidateData);
    return response.data;
};

export const updateCandidateStage = async (id, stage) => {
    const response = await axios.patch(`${API_URL}/candidates/${id}/stage`, { stage });
    return response.data;
};
