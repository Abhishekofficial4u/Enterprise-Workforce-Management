import apiClient from '../../../api/apiClient';

export const getAnnouncements = async () => {
    const response = await apiClient.get('/org/announcements');
    return response.data;
};

export const createAnnouncement = async (announcementData) => {
    const response = await apiClient.post('/org/announcements', announcementData);
    return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
    const response = await apiClient.put(`/org/announcements/${id}`, announcementData);
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await apiClient.delete(`/org/announcements/${id}`);
    return response.data;
};

