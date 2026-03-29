import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, CircleHelp, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import adminAvatar from '@/assets/admin_avatar.png';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 glass border-b border-outline-variant transition-all duration-300">
      {/* Left Search Bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm placeholder:text-on-surface-variant/60 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all outline-none"
            placeholder="Rechercher un employé, un département..."
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          <button className="p-2.5 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all">
            <CircleHelp size={20} />
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-on-surface/10 mx-2" />

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center gap-3 p-1 rounded-xl transition-all duration-200 border border-transparent",
              isProfileOpen ? "bg-surface-container border-outline-variant" : "hover:bg-surface-container"
            )}
          >
            <div className="text-right hidden sm:block px-2">
              <p className="text-sm font-semibold text-on-surface leading-none">{user?.name}</p>
              <div className="mt-1 flex items-center justify-end">
                <span className="text-[10px] font-bold text-primary bg-primary-container px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest overflow-hidden border border-outline-variant shadow-sm transition-transform active:scale-95">
              <img 
                src={adminAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Simple Clean Profile Dropdown/Menu */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-surface-container-lowest rounded-xl shadow-premium border border-outline-variant py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-2 border-b border-outline-variant mb-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">Gestion du compte</p>
              </div>
              <button
                onClick={() => { setIsProfileOpen(false); navigate('/my-profile'); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors text-left font-medium"
              >
                <User size={18} className="opacity-60" />
                Mon Profil
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left font-bold"
              >
                <LogOut size={18} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
