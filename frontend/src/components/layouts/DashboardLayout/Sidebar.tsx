import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuminaLogo } from '@/components/ui/LuminaLogo';
import {
  LayoutDashboard,
  Users,
  Bell,
  Activity,
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
  Coins,
  HeartHandshake,
  UserPlus,
  UserMinus,
  Award,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import adminAvatar from '@/assets/admin_avatar.png';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  manager: 'Manager',
  employee: 'Employé',
};

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

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navSections: NavSection[] = [
  // ── Admin / Manager ──
  {
    title: 'Principal',
    roles: ['admin', 'manager'],
    items: [
      { icon: <LayoutDashboard size={20} />, label: 'Tableau de bord', path: '/dashboard', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Organisation',
    roles: ['admin', 'manager'],
    items: [
      { icon: <UserPlus size={20} />, label: 'Onboarding', path: '/onboarding', roles: ['admin', 'manager'] },
      { icon: <UserMinus size={20} />, label: 'Offboarding', path: '/offboarding', roles: ['admin', 'manager'] },
      { icon: <Award size={20} />, label: 'Performance', path: '/performance', roles: ['admin', 'manager'] },
      { icon: <Building2 size={20} />, label: 'Départements', path: '/departments', roles: ['admin'] },
      { icon: <Users size={20} />, label: 'Employés', path: '/employees', roles: ['admin'] },
      { icon: <ShieldCheck size={20} />, label: 'Managers', path: '/managers', roles: ['admin'] },
    ],
  },
  {
    title: 'Planification',
    roles: ['admin', 'manager'],
    items: [
      { icon: <CalendarRange size={20} />, label: 'Planning Hebdo', path: '/schedules/planning', roles: ['admin', 'manager'] },
      { icon: <Clock size={20} />, label: 'Modèles Plannings', path: '/schedules', roles: ['admin'] },
      { icon: <PlaneTakeoff size={20} />, label: 'Congés', path: '/leaves', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Opérations',
    roles: ['admin', 'manager'],
    items: [
      { icon: <Briefcase size={20} />, label: 'Missions', path: '/missions', roles: ['admin', 'manager'] },
      { icon: <ListTodo size={20} />, label: 'Taches Equipe', path: '/team-tasks', roles: ['admin', 'manager'] },
      { icon: <MapIcon size={20} />, label: 'Sites & QR', path: '/locations', roles: ['admin'] },
      { icon: <Activity size={20} />, label: 'Live Monitor', path: '/monitor', roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Finance & Social',
    roles: ['admin'],
    items: [
      { icon: <Coins size={20} />, label: 'Pré-paie (Sénégal)', path: '/payroll', roles: ['admin'] },
      { icon: <HeartHandshake size={20} />, label: 'Acomptes & Prêts', path: '/advances', roles: ['admin'] },
    ],
  },
  {
    title: 'Système',
    roles: ['admin'],
    items: [
      { icon: <Settings size={20} />, label: 'Paramètres', path: '/settings', roles: ['admin'] },
    ],
  },

  // ── Super Admin ──
  {
    title: 'Plateforme',
    roles: ['super_admin'],
    items: [
      { icon: <Building2 size={20} />, label: 'Entreprises', path: '/admin/companies', roles: ['super_admin'] },
    ],
  },

  // ── Employee ──
  {
    title: 'Mon Espace',
    roles: ['employee'],
    items: [
      { icon: <Clock size={20} />, label: 'Pointage', path: '/clock-in', roles: ['employee'] },
      { icon: <User size={20} />, label: 'Mon Profil', path: '/my-profile', roles: ['employee'] },
      { icon: <History size={20} />, label: 'Historique', path: '/my-attendance', roles: ['employee'] },
      { icon: <Briefcase size={20} />, label: 'Mes Missions', path: '/my-missions', roles: ['employee'] },
      { icon: <ListTodo size={20} />, label: 'Mes Taches', path: '/my-tasks', roles: ['employee'] },
      { icon: <PlaneTakeoff size={20} />, label: 'Mes Congés', path: '/my-leaves', roles: ['employee'] },
      { icon: <CalendarDays size={20} />, label: 'Mon Planning', path: '/my-schedule', roles: ['employee'] },
      { icon: <HeartHandshake size={20} />, label: 'Acomptes & Prêts', path: '/my-advances', roles: ['employee'] },
      { icon: <Award size={20} />, label: 'Mes Évaluations', path: '/performance', roles: ['employee'] },
    ],
  },
  {
    title: 'Général',
    roles: ['admin', 'manager', 'employee', 'super_admin'],
    items: [
      { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', roles: ['admin', 'manager', 'employee', 'super_admin'] },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleSections = navSections
    .filter(section => user && section.roles.includes(user.role))
    .map(section => ({
      ...section,
      items: section.items.filter(item => user && item.roles.includes(user.role)),
    }))
    .filter(section => section.items.length > 0);

  return (
    <aside className={cn(
      "bg-surface-container-low flex flex-col sticky top-0 h-screen shrink-0 z-50 border-r border-on-surface/15 transition-all duration-300 relative",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Floating Border Edge Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          className="absolute -right-3.5 top-6 z-50 w-7 h-7 rounded-full bg-surface-container-lowest border border-on-surface/15 shadow-sm flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      {/* Logo Header */}
      <div className={cn(
        "py-6 border-b border-on-surface/10 mb-2 flex items-center",
        isCollapsed ? "justify-center px-2" : "justify-start px-6"
      )}>
        {isCollapsed ? (
          <LuminaLogo variant="icon" size="sm" />
        ) : (
          <LuminaLogo variant="horizontal" size="md" showTagline={false} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {visibleSections.map((section, sectionIdx) => (
          <div key={section.title}>
            {/* Section separator */}
            {sectionIdx > 0 && (
              <div className="h-px bg-on-surface/10 mx-3 mt-4 mb-2" />
            )}

            {/* Section title */}
            {!isCollapsed && (
              <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
                {section.title}
              </p>
            )}

            {/* Section items */}
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center transition-all duration-150 rounded-xl",
                      isCollapsed 
                        ? "w-10 h-10 mx-auto justify-center my-1" 
                        : "gap-3.5 px-3.5 py-2.5",
                      isActive
                        ? "bg-primary text-on-primary font-semibold shadow-none"
                        : "text-on-surface-variant font-medium hover:text-primary transition-colors"
                    )}
                  >
                    <div className="text-current shrink-0">
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <span className="text-base leading-none truncate">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className={cn(
        "border-t border-on-surface/10 py-3 transition-all duration-300",
        isCollapsed ? "px-2 text-center" : "px-4"
      )}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => navigate('/my-profile')}
              title={`${user?.name || 'Amadou Diallo'} - ${roleLabels[user?.role || ''] || user?.role || 'Administrateur'}`}
              className="w-10 h-10 rounded-full overflow-hidden border border-on-surface/15 hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
            >
              <img src={adminAvatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
            </button>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              className="w-8 h-8 rounded-xl hover:bg-red-50 text-on-surface-variant hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div
              onClick={() => navigate('/my-profile')}
              className="flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-on-surface/15 shrink-0">
                <img src={adminAvatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors leading-tight">
                  {user?.name || 'Amadou Diallo'}
                </p>
                <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-[0.15em] truncate mt-0.5">
                  {roleLabels[user?.role || ''] || user?.role || 'ADMINISTRATEUR'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant/70 hover:text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer"
            >
              <LogOut size={16} />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
