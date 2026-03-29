import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { ProtectedRoute } from '../components/layouts/ProtectedRoute';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import ClockInPage from '../features/clockin/ClockInPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import LiveMonitorPage from '../features/dashboard/LiveMonitorPage';
import { QrLocationsPage } from '../features/location/QrLocationsPage';
import { EmployeeListPage } from '../features/employees/EmployeeListPage';
import { ManagerListPage } from '../features/managers/ManagerListPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import KioskPage from '../features/kiosk/KioskPage';
import MyProfilePage from '../features/my-profile/MyProfilePage';
import MyAttendancePage from '../features/my-attendance/MyAttendancePage';
import MySchedulePage from '../features/my-schedule/MySchedulePage';
import { DepartmentListPage } from '../features/departments';
import { ScheduleListPage, WeeklyPlanningPage } from '../features/schedules';
import { AdminLeaveRequestsPage } from '../features/leaves';
import { SettingsPage } from '../features/settings/SettingsPage';
import { MissionsPage } from '../features/missions/MissionsPage';
import { MissionTrackingPage } from '../features/missions/MissionTrackingPage';

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
        <Route path="/login/*" element={<LoginPage />} />

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
          <Route path="/employees" element={<EmployeeListPage />} />
          <Route path="/managers" element={<ManagerListPage />} />
          
          <Route path="/departments" element={<DepartmentListPage />} />
          <Route path="/schedules" element={<ScheduleListPage />} />
          <Route path="/schedules/planning" element={<WeeklyPlanningPage />} />
          <Route path="/leaves" element={<AdminLeaveRequestsPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/:id/tracking" element={<MissionTrackingPage />} />
          <Route path="/admin/users" element={<div className="p-8"><h1 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1><p className="text-on-surface-variant">Chargement du module...</p></div>} />
          
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/clock-in" element={<ClockInPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/my-profile" element={<MyProfilePage />} />
          <Route path="/my-attendance" element={<MyAttendancePage />} />
          <Route path="/my-schedule" element={<MySchedulePage />} />
        </Route>

        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

