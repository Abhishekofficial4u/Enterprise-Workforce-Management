import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/performance';

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getMyReviews = async () => {
    const response = await axios.get(`${API_URL}/my`);
    return response.data;
};

export const acknowledgeReview = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/acknowledge`);
    return response.data;
};

export const getAllReviews = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const createReview = async (reviewData) => {
    const response = await axios.post(API_URL, reviewData);
    return response.data;
};
