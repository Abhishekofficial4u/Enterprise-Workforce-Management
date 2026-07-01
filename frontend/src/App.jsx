import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/components/Login';
import DashboardHome from './features/auth/components/DashboardHome';
import Employees from './features/employees/Employees';
import Attendance from './features/attendance/Attendance';
import Leave from './features/payroll/Leave';
import Payroll from './features/payroll/Payroll';
import ComingSoon from './components/ComingSoon';

// Guard: redirect to login if no token
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('userToken');
    return token ? children : <Navigate to="/login" replace />;
};

const Wrap = ({ children }) => <PrivateRoute>{children}</PrivateRoute>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<Wrap><DashboardHome /></Wrap>} />
                <Route path="/dashboard/employees"   element={<Wrap><Employees /></Wrap>} />
                <Route path="/dashboard/attendance"  element={<Wrap><Attendance /></Wrap>} />
                <Route path="/dashboard/leave"       element={<Wrap><Leave /></Wrap>} />
                <Route path="/dashboard/payroll"     element={<Wrap><Payroll /></Wrap>} />

                {/* Phase 2 Placeholders */}
                <Route path="/dashboard/recruitment" element={<Wrap><ComingSoon title="Recruitment" icon="🎯" description="AI-powered hiring pipeline with resume analyzer, interview scheduling and offer management." /></Wrap>} />
                <Route path="/dashboard/performance" element={<Wrap><ComingSoon title="Performance Management" icon="🏆" description="Goals, KPIs, quarterly reviews, and performance ratings for all employees." /></Wrap>} />
                <Route path="/dashboard/projects"    element={<Wrap><ComingSoon title="Project & Task Management" icon="🗂️" description="Kanban boards, sprint tracking, task assignment and time logging." /></Wrap>} />
                <Route path="/dashboard/helpdesk"    element={<Wrap><ComingSoon title="Help Desk" icon="🎫" description="IT support ticketing with priority routing and resolution tracking." /></Wrap>} />
                <Route path="/dashboard/assets"      element={<Wrap><ComingSoon title="Asset Management" icon="💻" description="Company asset inventory, assignment tracking and maintenance records." /></Wrap>} />
                <Route path="/dashboard/ai-assistant"element={<Wrap><ComingSoon title="AI Operations Assistant" icon="🤖" description="AI-powered HR chatbot for policy Q&A, leave queries and resume analysis." /></Wrap>} />
                <Route path="/dashboard/reports"     element={<Wrap><ComingSoon title="Reports & Analytics" icon="📈" description="Advanced cross-module analytics with exportable charts and insights." /></Wrap>} />

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
