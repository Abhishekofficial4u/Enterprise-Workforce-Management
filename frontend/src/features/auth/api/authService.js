import apiClient from '../../../api/apiClient';

export const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        
        const roles = response.data.roles || [];
        // Prioritize modern roles array over legacy string, as legacy string defaults to EMPLOYEE
        const primaryRole = (roles.length > 0 ? roles[0] : response.data.role) || 'EMPLOYEE';
        
        localStorage.setItem('userRole', primaryRole);
        localStorage.setItem('userRoles', JSON.stringify(roles));
        localStorage.setItem('userPermissions', JSON.stringify(response.data.permissions || []));
    }
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token, password) => {
    const response = await apiClient.put(`/auth/reset-password/${token}`, { password });
    return response.data;
};

