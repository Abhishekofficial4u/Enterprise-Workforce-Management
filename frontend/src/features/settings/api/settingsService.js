import apiClient from '../../../api/apiClient';

export const getSettings = async () => {
    const response = await apiClient.get('/settings');
    return response.data;
};

export const updateSettings = async (settingsData) => {
    const response = await apiClient.put('/settings', settingsData);
    return response.data;
};

