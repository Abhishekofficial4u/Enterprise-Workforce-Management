const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/time-payroll/shifts';

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
    };
};

export const getShifts = async (startDate, endDate) => {
    let url = API_URL;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await fetch(url, { headers: getHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
};

export const createShift = async (shiftData) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(shiftData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
};

export const deleteShift = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
};
