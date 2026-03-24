import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Tableau de bord';
    if (path === '/locations') return 'Sites & QR';
    if (path === '/employees') return 'Employés';
    if (path === '/monitor') return 'Live Monitor';
    if (path === '/settings') return 'Paramètres';
    if (path === '/notifications') return 'Notifications';
    return 'Aperçu';
  };

  return (
    <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 mx-4 mt-4 rounded-2xl glass transition-all duration-300">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-50">
          <span>Opérations</span>
          <ChevronRight size={10} />
          <span className="text-primary">{getPageTitle()}</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-on-surface -mt-1">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <button className="p-2.5 bg-surface-container-low rounded-xl text-on-surface-variant hover:bg-surface-container transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-container-low group-hover:border-surface-container" />
          </button>
        </div>
        
        <div className="h-10 w-[1px] bg-on-surface/5" />

        <div className="flex items-center gap-3 bg-surface-container-low/50 pl-4 pr-1 py-1 rounded-2xl">
          <div className="text-right">
            <p className="text-xs font-bold text-on-surface">{user?.name}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20">
            {user?.name?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
