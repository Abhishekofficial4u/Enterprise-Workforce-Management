import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/auth/components/LandingPage';
import Login from './features/auth/components/Login';
import ForgotPassword from './features/auth/components/ForgotPassword';
import ResetPassword from './features/auth/components/ResetPassword';
import DashboardHome from './features/auth/components/DashboardHome';
import Employees from './features/employees/Employees';
import Profile from './features/employees/Profile';
import CredentialsVault from './features/employees/CredentialsVault';
import Attendance from './features/attendance/Attendance';
import Payroll from './features/payroll/Payroll';
import Leave from './features/payroll/Leave';
import ProjectsHome from './features/projects/ProjectsHome';
import ProjectKanban from './features/projects/components/ProjectKanban';
import RecruitmentHome from './features/recruitment/RecruitmentHome';
import PerformanceHome from './features/performance/PerformanceHome';
import HelpDesk from './features/helpdesk/HelpDesk';
import Assets from './features/assets/Assets';
import Reports from './features/reports/Reports';
import AiAssistant from './features/ai/AiAssistant';

// Guard: redirect to login if no token
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('userToken');
    return token ? children : <Navigate to="/login" replace />;
};

// Guard: RBAC Role Check (Legacy fallback)
const RoleRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem('userRole');
    if (!role) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
    return children;
};

// Guard: RBAC Permission Check
const PermissionRoute = ({ children, requiredPermissions }) => {
    const permsStr = localStorage.getItem('userPermissions');
    const permissions = permsStr ? JSON.parse(permsStr) : [];
    if (!permissions || permissions.length === 0) return <Navigate to="/login" replace />;
    
    // Check if user has ALL required permissions
    const hasPermission = requiredPermissions.every(p => permissions.includes(p));
    if (!hasPermission) return <Navigate to="/dashboard" replace />;
    return children;
};

const Wrap = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;
const RoleWrap = ({ children, roles }) => <PrivateRoute><RoleRoute allowedRoles={roles}>{children}</RoleRoute></PrivateRoute>;
const PermWrap = ({ children, perms }) => <PrivateRoute><PermissionRoute requiredPermissions={perms}>{children}</PermissionRoute></PrivateRoute>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<Wrap><DashboardHome /></Wrap>} />
                <Route path="/dashboard/profile" element={<Wrap><Profile /></Wrap>} />
                
                {/* HR Only */}
                <Route path="/dashboard/employees"   element={<PermWrap perms={['manage_employees']}><Employees /></PermWrap>} />
                <Route path="/dashboard/vault"       element={<PermWrap perms={['manage_users']}><CredentialsVault /></PermWrap>} />
                <Route path="/dashboard/reports"     element={<PermWrap perms={['view_reports']}><Reports /></PermWrap>} />
                <Route path="/dashboard/ai-assistant" element={<Wrap><AiAssistant /></Wrap>} />
                
                {/* Finance/Admin Only */}
                <Route path="/dashboard/payroll"     element={<PermWrap perms={['manage_payroll']}><Payroll /></PermWrap>} />
                
                {/* Everyone */}
                <Route path="/dashboard/attendance"  element={<Wrap><Attendance /></Wrap>} />
                <Route path="/dashboard/leave"       element={<Wrap><Leave /></Wrap>} />

                {/* Restricted Features */}
                <Route path="/dashboard/recruitment" element={<PermWrap perms={['manage_recruitment']}><RecruitmentHome /></PermWrap>} />
                <Route path="/dashboard/performance" element={<PermWrap perms={['view_performance']}><PerformanceHome /></PermWrap>} />
                <Route path="/dashboard/projects"    element={<PermWrap perms={['manage_projects']}><ProjectsHome /></PermWrap>} />
                <Route path="/dashboard/projects/:id" element={<PermWrap perms={['manage_projects']}><ProjectKanban /></PermWrap>} />
                <Route path="/dashboard/helpdesk"    element={<Wrap><HelpDesk /></Wrap>} />
                <Route path="/dashboard/assets"      element={<PermWrap perms={['manage_assets']}><Assets /></PermWrap>} />

                {/* Default redirect to Landing Page instead of Login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
