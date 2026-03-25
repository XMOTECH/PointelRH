import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Map as MapIcon,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'manager'] },
    { icon: <MapIcon size={20} />, label: 'Sites & QR', path: '/locations', roles: ['admin'] },
    { icon: <Users size={20} />, label: 'Employés', path: '/employees', roles: ['admin'] },
    { icon: <Bell size={20} />, label: 'Live Monitor', path: '/monitor', roles: ['admin', 'manager'] },
    { icon: <Settings size={20} />, label: 'Paramètres', path: '/settings', roles: ['admin'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-surface-container-low flex flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300">
      <div className="px-8 py-10 flex flex-col gap-1">
        <h1 className="text-2xl font-display font-black text-on-surface tracking-tighter uppercase italic">
          Pointel
        </h1>
        
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
