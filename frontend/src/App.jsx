import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/auth/components/LandingPage';
import Login from './features/auth/components/Login';
import DashboardHome from './features/auth/components/DashboardHome';
import Employees from './features/employees/Employees';
import Profile from './features/employees/Profile';
import Attendance from './features/attendance/Attendance';
import Payroll from './features/payroll/Payroll';
import Leave from './features/payroll/Leave';
import ProjectsHome from './features/projects/ProjectsHome';
import ProjectKanban from './features/projects/components/ProjectKanban';
import RecruitmentHome from './features/recruitment/RecruitmentHome';
import ComingSoon from './components/ComingSoon';

// Guard: redirect to login if no token
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('userToken');
    return token ? children : <Navigate to="/login" replace />;
};

// Guard: RBAC Role Check
const RoleRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem('userRole');
    if (!role) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
    return children;
};

const Wrap = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;
const RoleWrap = ({ children, roles }) => <PrivateRoute><RoleRoute allowedRoles={roles}>{children}</RoleRoute></PrivateRoute>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<Wrap><DashboardHome /></Wrap>} />
                <Route path="/dashboard/profile" element={<Wrap><Profile /></Wrap>} />
                
                {/* HR Only */}
                <Route path="/dashboard/employees"   element={<RoleWrap roles={['HR_MANAGER', 'SUPER_ADMIN']}><Employees /></RoleWrap>} />
                
                {/* Finance/Admin Only */}
                <Route path="/dashboard/payroll"     element={<Wrap><Payroll /></Wrap>} />
                
                {/* Everyone */}
                <Route path="/dashboard/attendance"  element={<Wrap><Attendance /></Wrap>} />
                <Route path="/dashboard/leave"       element={<Wrap><Leave /></Wrap>} />

                {/* Phase 2 Placeholders - Restricted for now */}
                <Route path="/dashboard/recruitment" element={<RoleWrap roles={['HR_MANAGER', 'SUPER_ADMIN']}><RecruitmentHome /></RoleWrap>} />
                <Route path="/dashboard/performance" element={<RoleWrap roles={['HR_MANAGER', 'SUPER_ADMIN']}><ComingSoon title="Performance Management" icon="🏆" description="Goals, KPIs, quarterly reviews, and performance ratings for all employees." /></RoleWrap>} />
                <Route path="/dashboard/projects"    element={<Wrap><ProjectsHome /></Wrap>} />
                <Route path="/dashboard/projects/:id" element={<Wrap><ProjectKanban /></Wrap>} />
                <Route path="/dashboard/helpdesk"    element={<Wrap><ComingSoon title="Help Desk" icon="🎫" description="IT support ticketing with priority routing and resolution tracking." /></Wrap>} />
                <Route path="/dashboard/assets"      element={<RoleWrap roles={['IT_ADMIN', 'SUPER_ADMIN']}><ComingSoon title="Asset Management" icon="💻" description="Company asset inventory, assignment tracking and maintenance records." /></RoleWrap>} />
                <Route path="/dashboard/ai-assistant"element={<Wrap><ComingSoon title="AI Operations Assistant" icon="🤖" description="AI-powered HR chatbot for policy Q&A, leave queries and resume analysis." /></Wrap>} />
                <Route path="/dashboard/reports"     element={<RoleWrap roles={['SUPER_ADMIN']}><ComingSoon title="Reports & Analytics" icon="📈" description="Advanced cross-module analytics with exportable charts and insights." /></RoleWrap>} />

                {/* Default redirect to Landing Page instead of Login */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
