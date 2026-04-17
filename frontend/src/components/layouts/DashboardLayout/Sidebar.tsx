import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Map as MapIcon,
  Settings,
  Briefcase,
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

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: string[];
}

interface NavSection {
  title: string;
  roles: string[];
  items: NavItem[];
}

const navSections: NavSection[] = [
  // ── Admin / Manager ──
  {
    title: 'Principal',
    roles: ['admin', 'manager'],
    items: [
      { icon: <LayoutDashboard size={18} />, label: 'Tableau de bord', path: '/dashboard', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Organisation',
    roles: ['admin'],
    items: [
      { icon: <Building2 size={18} />, label: 'Départements', path: '/departments', roles: ['admin'] },
      { icon: <Users size={18} />, label: 'Employés', path: '/employees', roles: ['admin'] },
      { icon: <ShieldCheck size={18} />, label: 'Managers', path: '/managers', roles: ['admin'] },
    ],
  },
  {
    title: 'Planification',
    roles: ['admin', 'manager'],
    items: [
      { icon: <CalendarRange size={18} />, label: 'Planning Hebdo', path: '/schedules/planning', roles: ['admin', 'manager'] },
      { icon: <Clock size={18} />, label: 'Modèles Plannings', path: '/schedules', roles: ['admin'] },
      { icon: <PlaneTakeoff size={18} />, label: 'Congés', path: '/leaves', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Opérations',
    roles: ['admin', 'manager'],
    items: [
      { icon: <Briefcase size={18} />, label: 'Missions', path: '/missions', roles: ['admin', 'manager'] },
      { icon: <ListTodo size={18} />, label: 'Taches Equipe', path: '/team-tasks', roles: ['admin', 'manager'] },
      { icon: <MapIcon size={18} />, label: 'Sites & QR', path: '/locations', roles: ['admin'] },
      { icon: <Bell size={18} />, label: 'Live Monitor', path: '/monitor', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Système',
    roles: ['admin'],
    items: [
      { icon: <ShieldCheck size={18} />, label: 'Utilisateurs', path: '/admin/users', roles: ['admin'] },
      { icon: <Settings size={18} />, label: 'Paramètres', path: '/settings', roles: ['admin'] },
    ],
  },

  // ── Super Admin ──
  {
    title: 'Plateforme',
    roles: ['super_admin'],
    items: [
      { icon: <Building2 size={18} />, label: 'Entreprises', path: '/admin/companies', roles: ['super_admin'] },
    ],
  },

  // ── Employee ──
  {
    title: 'Mon Espace',
    roles: ['employee'],
    items: [
      { icon: <Clock size={18} />, label: 'Pointage', path: '/clock-in', roles: ['employee'] },
      { icon: <User size={18} />, label: 'Mon Profil', path: '/my-profile', roles: ['employee'] },
      { icon: <History size={18} />, label: 'Historique', path: '/my-attendance', roles: ['employee'] },
      { icon: <Briefcase size={18} />, label: 'Mes Missions', path: '/my-missions', roles: ['employee'] },
      { icon: <ListTodo size={18} />, label: 'Mes Taches', path: '/my-tasks', roles: ['employee'] },
      { icon: <PlaneTakeoff size={18} />, label: 'Mes Congés', path: '/my-leaves', roles: ['employee'] },
      { icon: <CalendarDays size={18} />, label: 'Mon Planning', path: '/my-schedule', roles: ['employee'] },
    ],
  },
  {
    title: 'Général',
    roles: ['employee', 'admin', 'manager'],
    items: [
      { icon: <Bell size={18} />, label: 'Notifications', path: '/notifications', roles: ['employee', 'admin', 'manager'] },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const visibleSections = navSections
    .filter(section => user && section.roles.includes(user.role))
    .map(section => ({
      ...section,
      items: section.items.filter(item => user && item.roles.includes(user.role)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className="w-64 bg-surface flex flex-col fixed inset-y-0 left-0 z-50 border-r border-outline-variant/30">
      {/* Logo */}
      <div className="px-6 py-6">
        <h1 className="text-2xl font-display font-bold text-on-surface tracking-tight uppercase">
          Pointel<span className="text-primary">RH</span>
        </h1>
        {user?.role === 'super_admin' ? (
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1 block">
            Super Admin
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 mt-1 block">
            Gestion des Ressources Humaines
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto pb-4">
        {visibleSections.map((section, sectionIdx) => (
          <div key={section.title}>
            {/* Section separator */}
            {sectionIdx > 0 && (
              <div className="h-px bg-outline-variant/20 mx-3 mt-4 mb-2" />
            )}

            {/* Section title */}
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-space font-semibold uppercase tracking-[0.2em] text-on-surface-variant/50">
              {section.title}
            </p>

            {/* Section items */}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary font-semibold before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:bg-primary before:rounded-r-full"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    )}
                  >
                    <div className="text-current">
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-outline-variant/20">
        <p className="text-[10px] text-on-surface-variant/30 tracking-wider">
          &copy; 2026 PointelRH
        </p>
      </div>
    </aside>
  );
};
