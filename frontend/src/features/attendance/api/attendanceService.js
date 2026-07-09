import apiClient from '../../../api/apiClient';

export const clockIn = async (location = {}) => {
    const response = await apiClient.post('/time-payroll/attendance/clock-in', location);
    return response.data;
};

export const clockOut = async (location = {}) => {
    const response = await apiClient.post('/time-payroll/attendance/clock-out', location);
    return response.data;
};

export const getMyAttendance = async () => {
    const response = await apiClient.get('/time-payroll/attendance/my');
    return response.data;
};

export const getAllAttendance = async (dateStr) => {
    const query = dateStr ? `?date=${dateStr}` : '';
    const response = await apiClient.get(`/time-payroll/attendance/daily${query}`);
    return response.data;
};

