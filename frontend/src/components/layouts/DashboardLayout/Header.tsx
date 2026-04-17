import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, CircleHelp, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import adminAvatar from '@/assets/admin_avatar.png';

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  manager: 'Manager',
  employee: 'Employé',
};

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8 glass border-b border-outline-variant/30 transition-all duration-300">
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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="p-3 text-on-surface-variant/60 hover:bg-surface-container hover:text-primary rounded-2xl transition-all relative group"
          >
            <Bell size={22} strokeWidth={1.5} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary rounded-full ring-4 ring-surface shadow-lg group-hover:scale-125 transition-transform" />
          </button>
          <button className="p-3 text-on-surface-variant/60 hover:bg-surface-container hover:text-primary rounded-2xl transition-all">
            <CircleHelp size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className="h-10 w-px bg-outline-variant/30 mx-2" />

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center gap-3 p-1.5 rounded-lg transition-colors border",
              isProfileOpen
                ? "bg-surface-container-low border-outline-variant shadow-sm"
                : "bg-transparent border-transparent hover:bg-surface-container-low hover:border-outline-variant/50"
            )}
          >
            <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30">
              <img
                src={adminAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-left hidden lg:block pr-2">
              <p className="text-sm font-space font-semibold text-on-surface leading-tight">
                {user?.name || 'Super User'}
              </p>
              <p className="text-[11px] text-on-surface-variant font-medium uppercase tracking-widest">
                {roleLabels[user?.role || ''] || user?.role}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={cn("text-on-surface-variant/60 transition-transform duration-200", isProfileOpen && "rotate-180")}
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute top-full right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-premium border border-outline-variant/40 py-2 z-50"
              >
                {/* Header Dropdown */}
                <div className="px-4 py-3 border-b border-outline-variant/20 mb-2">
                  <p className="text-sm font-space font-semibold text-on-surface truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{user?.email}</p>
                </div>

                {/* Actions */}
                <div className="px-2 space-y-0.5">
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/my-profile'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                  >
                    <User size={16} />
                    Mon Profil
                  </button>

                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-primary/5 hover:text-primary rounded-lg transition-colors"
                  >
                    <Settings size={16} />
                    Paramètres
                  </button>

                  <div className="h-px bg-outline-variant/20 my-1.5 mx-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
