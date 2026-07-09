import apiClient from '../../../api/apiClient';

// Jobs API
export const getJobs = async () => {
    const response = await apiClient.get('/recruitment/jobs');
    return response.data;
};

export const createJob = async (jobData) => {
    const response = await apiClient.post('/recruitment/jobs', jobData);
    return response.data;
};

export const updateJobStatus = async (id, status) => {
    const response = await apiClient.patch(`/recruitment/jobs/${id}/status`, { status });
    return response.data;
};

// Candidates API
export const getCandidates = async (jobId) => {
    const response = await apiClient.get(`/recruitment/jobs/${jobId}/candidates`);
    return response.data;
};

export const createCandidate = async (candidateData) => {
    const response = await apiClient.post('/recruitment/candidates', candidateData);
    return response.data;
};

export const updateCandidateStage = async (id, stage) => {
    const response = await apiClient.put(`/recruitment/candidates/${id}/stage`, { stage });
    return response.data;
};

export const runAiScreen = async (candidateId) => {
    const response = await apiClient.post(`/recruitment/candidates/${candidateId}/ai-screen`);
    return response.data;
};

