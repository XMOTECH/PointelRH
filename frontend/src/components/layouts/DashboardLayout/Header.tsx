import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, CircleHelp } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-6 glass border-b border-on-surface/10 transition-all duration-300">
      {/* Left Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-sm font-inter placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            placeholder="Rechercher..."
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="p-2.5 text-on-surface-variant/70 hover:bg-surface-container hover:text-primary rounded-xl transition-colors relative group"
        >
          <Bell size={20} strokeWidth={1.75} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-surface" />
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="p-2.5 text-on-surface-variant/70 hover:bg-surface-container hover:text-primary rounded-xl transition-colors"
        >
          <CircleHelp size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
};
