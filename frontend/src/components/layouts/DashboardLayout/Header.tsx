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
    <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 bg-white border-b border-surface-container/10 transition-all duration-300">
      {/* Left Search Bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 bg-[#f3f6f9] border-transparent rounded-2xl text-sm placeholder:text-on-surface-variant/40 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/20 transition-all outline-none"
            placeholder="Search users or permissions..."
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-on-surface-variant hover:bg-surface-container/50 rounded-xl transition-all relative">
            <Bell size={22} className="opacity-70" />
            <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <button className="p-2.5 text-on-surface-variant hover:bg-surface-container/50 rounded-xl transition-all">
            <CircleHelp size={22} className="opacity-70" />
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-on-surface/10 mx-2" />

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl transition-all duration-200",
              isProfileOpen ? "bg-surface-container" : "hover:bg-surface-container/50"
            )}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-on-surface leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 mt-1.5 uppercase tracking-widest leading-none">
                {user?.role}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-surface-container overflow-hidden border border-surface-container-highest shadow-sm">
              <img 
                src={adminAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </button>

          {/* Simple Clean Profile Dropdown/Menu */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-surface-container py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-2 border-b border-surface-container/50 mb-1">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Compte Admin</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors text-left font-medium">
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
