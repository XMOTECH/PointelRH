import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../components/layouts/ProtectedRoute';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import ClockInPage from '../features/clockin/ClockInPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import LiveMonitorPage from '../features/dashboard/LiveMonitorPage';
import { QrLocationsPage } from '../features/location/QrLocationsPage';
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
    <div className="flex justify-center items-center min-h-screen bg-surface">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-surface-container-low border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-on-surface-variant font-medium">Chargement...</p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* KIOSK MVP */}
        <Route path="/kiosk" element={<KioskPage />} />

        {/* Layout Wrapper */}
        <Route element={
          <ProtectedRoute roles={['admin', 'manager', 'employee']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/monitor" element={<LiveMonitorPage />} />
          <Route path="/locations" element={<QrLocationsPage />} />
          <Route path="/settings" element={<div className="p-8 text-on-surface opacity-50">Settings (Prêt pour implémentation)</div>} />
          <Route path="/clock-in" element={<ClockInPage />} />
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

