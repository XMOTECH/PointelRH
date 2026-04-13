import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Map as MapIcon,
  Settings,
  Briefcase,
  ChevronRight,
  Clock,
  User,
  History,
  CalendarDays,
  Building2,
  CalendarRange,
  PlaneTakeoff,
  ShieldCheck,
  ListTodo,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/dashboard', roles: ['admin', 'manager'] },
    { icon: <Building2 size={20} />, label: 'Départements', path: '/departments', roles: ['admin'] },
    { icon: <Users size={20} />, label: 'Employés', path: '/employees', roles: ['admin'] },
    { icon: <ShieldCheck size={20} />, label: 'Managers', path: '/managers', roles: ['admin'] },
    { icon: <CalendarRange size={20} />, label: 'Planning Hebdo', path: '/schedules/planning', roles: ['admin', 'manager'] },
    { icon: <Clock size={20} />, label: 'Modèles Plannings', path: '/schedules', roles: ['admin'] },
    { icon: <PlaneTakeoff size={20} />, label: 'Congés', path: '/leaves', roles: ['admin', 'manager'] },
    { icon: <Briefcase size={20} />, label: 'Missions', path: '/missions', roles: ['admin', 'manager'] },
    { icon: <ListTodo size={20} />, label: 'Taches Equipe', path: '/team-tasks', roles: ['admin', 'manager'] },
    { icon: <MapIcon size={20} />, label: 'Sites & QR', path: '/locations', roles: ['admin'] },
    { icon: <Bell size={20} />, label: 'Live Monitor', path: '/monitor', roles: ['admin', 'manager'] },
    { icon: <ShieldCheck size={20} />, label: 'Utilisateurs', path: '/admin/users', roles: ['admin'] },
    { icon: <Settings size={20} />, label: 'Paramètres', path: '/settings', roles: ['admin'] },

    // ── Platform Admin (Super Admin) ──
    { icon: <Building2 size={20} />, label: 'Entreprises', path: '/admin/companies', roles: ['super_admin'] },

    // ── Employee ──
    { icon: <Clock size={20} />, label: 'Pointage', path: '/clock-in', roles: ['employee'] },
    { icon: <User size={20} />, label: 'Mon Profil', path: '/my-profile', roles: ['employee'] },
    { icon: <History size={20} />, label: 'Historique', path: '/my-attendance', roles: ['employee'] },
    { icon: <Briefcase size={20} />, label: 'Mes Missions', path: '/my-missions', roles: ['employee'] },
    { icon: <ListTodo size={20} />, label: 'Mes Taches', path: '/my-tasks', roles: ['employee'] },
    { icon: <PlaneTakeoff size={20} />, label: 'Mes Congés', path: '/my-leaves', roles: ['employee'] },
    { icon: <CalendarDays size={20} />, label: 'Mon Planning', path: '/my-schedule', roles: ['employee'] },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', roles: ['employee', 'admin', 'manager'] },
  ];

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );


  return (
    <aside className="w-64 bg-surface-container-low flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300">
      <div className="px-8 py-10">
        <h1 className="text-2xl font-display font-black text-on-surface tracking-tighter uppercase italic">
          Pointel<span className="text-primary not-italic">RH</span>
        </h1>
        {user?.role === 'super_admin' && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50 mt-1 block">Super Admin</span>
        )}
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "accent-bar bg-surface-container-highest text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("transition-transform duration-200 group-hover:scale-110", isActive && "scale-110")}>
                  {item.icon}
                </div>
                <span className="text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};
