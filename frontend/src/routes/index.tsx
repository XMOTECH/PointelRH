import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../components/layouts/ProtectedRoute';
import { MainLayout } from '../components/layouts/MainLayout';
import ClockInPage from '../features/clockin/ClockInPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import { EmployeeListPage } from '../features/employees/EmployeeListPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'employee') return <Navigate to="/clock-in" />;
  return <Navigate to="/dashboard" />;
}

function LayoutWrapper() {
  return <MainLayout />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Layout Wrapper for all protected routes */}
        <Route element={
          <ProtectedRoute roles={['admin', 'manager', 'employee']}>
            <LayoutWrapper />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clock-in" element={<ClockInPage />} />
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Redirect intelligent selon role */}
        <Route path="/" element={<RoleBasedRedirect />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
