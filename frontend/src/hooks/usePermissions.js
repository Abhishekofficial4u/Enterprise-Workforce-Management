export const usePermissions = () => {
    const permissionsStr = localStorage.getItem('userPermissions');
    const permissions = permissionsStr ? JSON.parse(permissionsStr) : [];
    
    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (requiredPermissions) => {
        return requiredPermissions.some(p => permissions.includes(p));
    };

    const hasAllPermissions = (requiredPermissions) => {
        return requiredPermissions.every(p => permissions.includes(p));
    };

    return { permissions, hasPermission, hasAnyPermission, hasAllPermissions };
};
