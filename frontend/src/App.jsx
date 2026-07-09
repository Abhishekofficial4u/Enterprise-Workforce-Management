import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/auth/components/LandingPage';
import RolePortal from './features/auth/components/RolePortal';
import Login from './features/auth/components/Login';
import ForgotPassword from './features/auth/components/ForgotPassword';
import ResetPassword from './features/auth/components/ResetPassword';
import DashboardHome from './features/auth/components/DashboardHome';
import AdminLayout from './layouts/AdminLayout';
import HRLayout from './layouts/HRLayout';
import FinanceLayout from './layouts/FinanceLayout';
import ManagerLayout from './layouts/ManagerLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import Employees from './features/employees/Employees';
import Profile from './features/employees/Profile';
import CredentialsVault from './features/employees/CredentialsVault';
import OrgChart from './features/employees/OrgChart';
import Attendance from './features/attendance/Attendance';
import Leave from './features/payroll/Leave';
import ShiftManagement from './features/attendance/components/ShiftManagement';
import Payroll from './features/payroll/Payroll';
import ProjectsHome from './features/projects/ProjectsHome';
import ProjectKanban from './features/projects/components/ProjectKanban';
import RecruitmentHome from './features/recruitment/RecruitmentHome';
import JobBoard from './features/recruitment/components/JobBoard';
import PerformanceHome from './features/performance/PerformanceHome';
import AuditLogs from './features/admin/AuditLogs';
import HelpDesk from './features/helpdesk/HelpDesk';
import Assets from './features/assets/Assets';
import Reports from './features/reports/Reports';
import AiAssistant from './features/ai/AiAssistant';
import AnnouncementsManager from './features/employees/components/AnnouncementsManager';
import TrainingManager from './features/hr/components/TrainingManager';
import LearningPortal from './features/employees/components/LearningPortal';
import Settings from './features/settings/Settings';

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
    const role = localStorage.getItem('userRole');
    
    // Super Admin bypasses all checks
    if (role === 'SUPER_ADMIN' || permissions.includes('*')) {
        return children;
    }
    
    // Check if user has ALL required permissions
    const hasPermission = requiredPermissions.length === 0 || requiredPermissions.every(p => permissions.includes(p));
    
    if (!hasPermission) {
        let roleBase = '';
        if (role === 'SUPER_ADMIN' || role === 'ORG_ADMIN' || role === 'IT_ADMIN') roleBase = 'admin';
        else if (role === 'HR_MANAGER') roleBase = 'hr';
        else if (role === 'FINANCE') roleBase = 'finance';
        else if (role === 'MANAGER' || role === 'TEAM_LEAD') roleBase = 'manager';
        else roleBase = 'employee';
        
        return <Navigate to={roleBase ? `/${roleBase}/dashboard` : '/dashboard'} replace />;
    }
    
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
                <Route path="/careers" element={<div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 0' }}><div style={{ maxWidth: 1200, margin: '0 auto' }}><h1 style={{ padding: '0 24px', color: 'var(--text-primary)' }}>Careers at Enterprise</h1><JobBoard /></div></div>} />
                <Route path="/portal" element={<RolePortal />} />
                <Route path="/login/:portalId" element={<Login />} />
                <Route path="/login" element={<Navigate to="/portal" replace />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* ======================= */}
                {/* 1. ADMIN PORTAL ROUTES  */}
                {/* ======================= */}
                <Route path="/admin/dashboard" element={<PermWrap perms={[]}><AdminLayout><DashboardHome /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/vault" element={<PermWrap perms={['manage_users']}><AdminLayout><CredentialsVault /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/assets" element={<PermWrap perms={['manage_assets']}><AdminLayout><Assets /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/helpdesk" element={<PermWrap perms={[]}><AdminLayout><HelpDesk /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/ai-assistant" element={<PermWrap perms={[]}><AdminLayout><AiAssistant /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/reports" element={<PermWrap perms={['view_reports']}><AdminLayout><Reports /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/employees" element={<PermWrap perms={['manage_employees']}><AdminLayout><Employees /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/org-chart" element={<PermWrap perms={['view_all_data']}><AdminLayout><OrgChart /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/recruitment" element={<PermWrap perms={['manage_recruitment']}><AdminLayout><RecruitmentHome /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/performance" element={<PermWrap perms={['view_performance']}><AdminLayout><PerformanceHome /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/audit" element={<PermWrap perms={['view_all_data']}><AdminLayout><AuditLogs /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/attendance" element={<PermWrap perms={['approve_leave']}><AdminLayout><Attendance /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/leave" element={<PermWrap perms={['approve_leave']}><AdminLayout><Leave /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/shifts" element={<PermWrap perms={['approve_leave']}><AdminLayout><ShiftManagement /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/payroll" element={<PermWrap perms={['manage_payroll']}><AdminLayout><Payroll /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/projects" element={<PermWrap perms={['manage_projects']}><AdminLayout><ProjectsHome /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/profile" element={<PermWrap perms={[]}><AdminLayout><Profile /></AdminLayout></PermWrap>} />
                <Route path="/admin/dashboard/settings" element={<PermWrap perms={[]}><AdminLayout><Settings /></AdminLayout></PermWrap>} />

                {/* ======================= */}
                {/* 2. HR PORTAL ROUTES     */}
                {/* ======================= */}
                <Route path="/hr/dashboard" element={<PermWrap perms={['manage_employees']}><HRLayout><DashboardHome /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/employees" element={<PermWrap perms={['manage_employees']}><HRLayout><Employees /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/recruitment" element={<PermWrap perms={['manage_recruitment']}><HRLayout><RecruitmentHome /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/performance" element={<PermWrap perms={[]}><HRLayout><PerformanceHome /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/attendance" element={<PermWrap perms={['manage_attendance']}><HRLayout><Attendance /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/leave" element={<PermWrap perms={['manage_attendance']}><HRLayout><Leave /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/shifts" element={<PermWrap perms={['manage_attendance']}><HRLayout><ShiftManagement /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/announcements" element={<PermWrap perms={['manage_employees']}><HRLayout><AnnouncementsManager /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/training" element={<PermWrap perms={['manage_employees']}><HRLayout><TrainingManager /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/reports" element={<PermWrap perms={['view_reports']}><HRLayout><Reports /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/payroll" element={<PermWrap perms={['manage_payroll']}><HRLayout><Payroll /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/profile" element={<PermWrap perms={[]}><HRLayout><Profile /></HRLayout></PermWrap>} />
                <Route path="/hr/dashboard/ai-assistant" element={<PermWrap perms={[]}><HRLayout><AiAssistant /></HRLayout></PermWrap>} />

                {/* ======================= */}
                {/* 3. FINANCE PORTAL       */}
                {/* ======================= */}
                <Route path="/finance/dashboard" element={<PermWrap perms={['manage_payroll']}><FinanceLayout><DashboardHome /></FinanceLayout></PermWrap>} />
                <Route path="/finance/dashboard/payroll" element={<PermWrap perms={['manage_payroll']}><FinanceLayout><Payroll /></FinanceLayout></PermWrap>} />
                <Route path="/finance/dashboard/employees" element={<PermWrap perms={['manage_payroll']}><FinanceLayout><Employees /></FinanceLayout></PermWrap>} />
                <Route path="/finance/dashboard/reports" element={<PermWrap perms={['view_reports']}><FinanceLayout><Reports /></FinanceLayout></PermWrap>} />
                <Route path="/finance/dashboard/profile" element={<PermWrap perms={[]}><FinanceLayout><Profile /></FinanceLayout></PermWrap>} />
                <Route path="/finance/dashboard/ai-assistant" element={<PermWrap perms={[]}><FinanceLayout><AiAssistant /></FinanceLayout></PermWrap>} />

                {/* ======================= */}
                {/* 4. MANAGER PORTAL       */}
                {/* ======================= */}
                <Route path="/manager/dashboard" element={<PermWrap perms={['view_team']}><ManagerLayout><DashboardHome /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/employees" element={<PermWrap perms={['view_team']}><ManagerLayout><Employees /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/org-chart" element={<PermWrap perms={['view_team']}><ManagerLayout><OrgChart /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/projects" element={<PermWrap perms={['view_projects']}><ManagerLayout><ProjectsHome /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/attendance" element={<PermWrap perms={['approve_leave']}><ManagerLayout><Attendance /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/leave" element={<PermWrap perms={['approve_leave']}><ManagerLayout><Leave /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/shifts" element={<PermWrap perms={['approve_leave']}><ManagerLayout><ShiftManagement /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/performance" element={<PermWrap perms={['view_performance']}><ManagerLayout><PerformanceHome /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/reports" element={<PermWrap perms={['view_reports']}><ManagerLayout><Reports /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/profile" element={<PermWrap perms={[]}><ManagerLayout><Profile /></ManagerLayout></PermWrap>} />
                <Route path="/manager/dashboard/ai-assistant" element={<PermWrap perms={[]}><ManagerLayout><AiAssistant /></ManagerLayout></PermWrap>} />

                {/* ======================= */}
                {/* 5. EMPLOYEE PORTAL      */}
                {/* ======================= */}
                <Route path="/employee/dashboard" element={<PermWrap perms={[]}><EmployeeLayout><DashboardHome /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/performance" element={<PermWrap perms={[]}><EmployeeLayout><PerformanceHome /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/profile" element={<PermWrap perms={[]}><EmployeeLayout><Profile /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/ai-assistant" element={<PermWrap perms={[]}><EmployeeLayout><AiAssistant /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/credentials" element={<PermWrap perms={[]}><EmployeeLayout><CredentialsVault /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/attendance" element={<PermWrap perms={[]}><EmployeeLayout><Attendance /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/leave" element={<PermWrap perms={[]}><EmployeeLayout><Leave /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/payroll" element={<PermWrap perms={[]}><EmployeeLayout><Payroll /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/helpdesk" element={<PermWrap perms={[]}><EmployeeLayout><HelpDesk /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/learning" element={<PermWrap perms={[]}><EmployeeLayout><LearningPortal /></EmployeeLayout></PermWrap>} />
                <Route path="/employee/dashboard/careers" element={<PermWrap perms={[]}><EmployeeLayout><JobBoard /></EmployeeLayout></PermWrap>} />

                {/* Legacy Routes (To be deprecated) */}
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
