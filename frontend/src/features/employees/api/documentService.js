const API_URL = 'https://enterprise-workforce-management.onrender.com/api/v1/hr';

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
    };
};

export const getDocuments = async (employeeId) => {
    const res = await fetch(`${API_URL}/employees/${employeeId}/documents`, { headers: getHeaders() });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
};

export const addDocument = async (employeeId, docData) => {
    let body = docData;
    let headers = getHeaders();

    if (docData instanceof FormData) {
        // Remove Content-Type so browser sets it with boundary for multipart/form-data
        delete headers['Content-Type'];
    } else {
        body = JSON.stringify(docData);
    }

    const res = await fetch(`${API_URL}/employees/${employeeId}/documents`, {
        method: 'POST',
        headers: headers,
        body: body
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
};

export const deleteDocument = async (docId) => {
    const res = await fetch(`${API_URL}/documents/${docId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    return data;
};
