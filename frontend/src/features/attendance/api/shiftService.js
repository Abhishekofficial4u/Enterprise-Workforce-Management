import apiClient from '../../../api/apiClient';

export const getShifts = async (startDate, endDate) => {
    let url = '/time-payroll/shifts';
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const response = await apiClient.get(url);
    return response.data.data;
};

export const createShift = async (shiftData) => {
    const response = await apiClient.post('/time-payroll/shifts', shiftData);
    return response.data.data;
};

export const deleteShift = async (id) => {
    const response = await apiClient.delete(`/time-payroll/shifts/${id}`);
    return response.data;
};

