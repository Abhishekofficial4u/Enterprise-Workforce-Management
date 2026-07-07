import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/assets';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const createAsset = async (assetData) => {
    const response = await axios.post(API_URL, assetData, getAuthHeader());
    return response.data;
};

export const getAllAssets = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const updateAsset = async (id, updateData) => {
    const response = await axios.put(`${API_URL}/${id}`, updateData, getAuthHeader());
    return response.data;
};

export const deleteAsset = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
};
