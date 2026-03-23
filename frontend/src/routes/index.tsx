import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../components/layouts/ProtectedRoute';
import { MainLayout } from '../components/layouts/MainLayout';
import ClockInPage from '../features/clockin/ClockInPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import { EmployeeListPage } from '../features/employees/EmployeeListPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import KioskPage from '../features/kiosk/KioskPage';

function RoleBasedRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
    } else if (user.role === 'employee') {
      navigate('/clock-in', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  );
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

        {/* KIOSK MVP (Public for tablet) */}
        <Route path="/kiosk" element={<KioskPage />} />

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

