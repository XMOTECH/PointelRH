import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, CircleHelp, LogOut, User, ChevronDown, Shield, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import adminAvatar from '@/assets/admin_avatar.png';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-24 sticky top-0 z-40 flex items-center justify-between px-8 glass border-b border-outline-variant/30 transition-all duration-300">
      {/* Left Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-4 bg-surface-container-low/50 border border-outline-variant/30 rounded-2xl text-xs font-black uppercase tracking-widest placeholder:text-on-surface-variant/20 focus:bg-surface-container-lowest focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all outline-none"
            placeholder="Command Center Search..."
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

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={cn(
              "flex items-center gap-4 p-1.5 rounded-2xl transition-all duration-300 border group",
              isProfileOpen 
                ? "bg-surface-container-high border-primary/20 shadow-premium" 
                : "bg-surface-container-low border-outline-variant/30 hover:border-primary/20 hover:bg-surface-container hover:shadow-lg"
            )}
          >
            <div className="w-11 h-11 rounded-xl bg-surface-container-highest overflow-hidden border border-outline-variant/50 shadow-inner transition-transform group-hover:scale-95 duration-500">
              <img 
                src={adminAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
              />
            </div>
            
            <div className="text-left hidden lg:block pr-2">
              <p className="text-xs font-black text-on-surface uppercase tracking-tight leading-none group-hover:text-primary transition-colors italic">
                {user?.name || 'Super User'}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                  {user?.role === 'super_admin' ? 'System Root' : user?.role}
                </span>
              </div>
            </div>

            <ChevronDown 
              size={16} 
              className={cn("text-on-surface-variant/40 transition-transform duration-500 mr-2", isProfileOpen && "rotate-180 text-primary")} 
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute top-full right-0 mt-4 w-72 bg-surface-container-lowest rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-outline-variant/40 py-4 z-50 overflow-hidden"
              >
                {/* Header Dropdown */}
                <div className="px-6 py-4 border-b border-outline-variant/20 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Accès Privilégié</p>
                      <p className="text-xs font-bold text-on-surface truncate max-w-[160px]">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-3 space-y-1">
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/my-profile'); }}
                    className="w-full flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <User size={18} strokeWidth={2.5} />
                    </div>
                    Mon Espace
                  </button>

                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-4 px-4 py-4 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high hover:text-primary rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Settings size={18} strokeWidth={2.5} />
                    </div>
                    Paramètres
                  </button>

                  <div className="h-px bg-outline-variant/20 my-3 mx-4" />

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                      <LogOut size={18} strokeWidth={2.5} />
                    </div>
                    Déconnexion
                  </button>
                </div>

                <div className="mt-4 px-6 py-4 bg-surface-container-low/50 text-center">
                  <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.3em]">PointelRH Platform v3.1</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
