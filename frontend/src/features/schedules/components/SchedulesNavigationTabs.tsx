import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarRange, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SchedulesNavigationTabsProps {
  schedulesCount?: number;
}

export const SchedulesNavigationTabs: React.FC<SchedulesNavigationTabsProps> = ({
  schedulesCount,
}) => {
  const { user } = useAuth();
  // /schedules est réservé aux admins (cf. routes) : pas d'onglet menant à une page interdite
  const canManageSchedules = user?.role === 'admin' || user?.role === 'super_admin';
  if (!canManageSchedules) return null;

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-surface-container-low/90 rounded-xl border border-outline-variant/60 shadow-2xs select-none">
      <NavLink
        to="/schedules/planning"
        className={({ isActive }) =>
          `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
            isActive
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/50 font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60'
          }`
        }
      >
        <CalendarRange size={14} className="shrink-0" />
        <span>Planning opérationnel</span>
      </NavLink>

      <NavLink
        to="/schedules"
        end
        className={({ isActive }) =>
          `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
            isActive
              ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/50 font-bold'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest/60'
          }`
        }
      >
        <Clock size={14} className="shrink-0" />
        <span>Horaires contractuels</span>
        {typeof schedulesCount === 'number' && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
            {schedulesCount}
          </span>
        )}
      </NavLink>
    </div>
  );
};
