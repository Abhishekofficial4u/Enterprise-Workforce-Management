import apiClient from '../../../api/apiClient';

export const createAsset = async (assetData) => {
    const response = await apiClient.post('/assets', assetData);
    return response.data;
};

export const getAllAssets = async () => {
    const response = await apiClient.get('/assets');
    return response.data;
};

export const updateAsset = async (id, updateData) => {
    const response = await apiClient.put(`/assets/${id}`, updateData);
    return response.data;
};

export const deleteAsset = async (id) => {
    const response = await apiClient.delete(`/assets/${id}`);
    return response.data;
};

