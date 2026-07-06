import axios from 'axios';

const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/helpdesk';

const getAuthHeader = () => {
    const token = localStorage.getItem('userToken');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const createTicket = async (ticketData) => {
    const response = await axios.post(API_URL, ticketData, getAuthHeader());
    return response.data;
};

export const getMyTickets = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};

export const getAllTickets = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

export const updateTicket = async (id, updateData) => {
    const response = await axios.put(`${API_URL}/${id}`, updateData, getAuthHeader());
    return response.data;
};

export const addResponse = async (id, message) => {
    const response = await axios.post(`${API_URL}/${id}/respond`, { message }, getAuthHeader());
    return response.data;
};
