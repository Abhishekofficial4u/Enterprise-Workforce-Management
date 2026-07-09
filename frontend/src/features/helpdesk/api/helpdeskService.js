import apiClient from '../../../api/apiClient';

export const createTicket = async (ticketData) => {
    const response = await apiClient.post('/helpdesk', ticketData);
    return response.data;
};

export const getMyTickets = async () => {
    const response = await apiClient.get('/helpdesk/my');
    return response.data;
};

export const getAllTickets = async () => {
    const response = await apiClient.get('/helpdesk');
    return response.data;
};

export const updateTicket = async (id, updateData) => {
    const response = await apiClient.put(`/helpdesk/${id}`, updateData);
    return response.data;
};

export const addResponse = async (id, message) => {
    const response = await apiClient.post(`/helpdesk/${id}/respond`, { message });
    return response.data;
};

