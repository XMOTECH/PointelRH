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

  // Afficher un spinner pendant le chargement ou la redirection
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTop: '4px solid #0066cc',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: '#666' }}>Chargement...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
