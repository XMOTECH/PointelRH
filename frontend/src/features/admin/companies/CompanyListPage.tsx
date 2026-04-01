import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Users, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCompanies, useCreateCompany, useGlobalStats } from '../hooks/useCompanies';
import { CompanyTable } from './components/CompanyTable';
import { CompanyCreateModal } from './components/CompanyCreateModal';
import type { CreateCompanyData } from '../api/admin.api';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function CompanyListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  // Stats from backend
  const { data: stats } = useGlobalStats();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useCompanies({
    page,
    per_page: 20,
    search: debouncedSearch || undefined,
  });

  const createMutation = useCreateCompany();

  const companies = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;

  const handleCreateCompany = (formData: CreateCompanyData) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  const statCards = [
    { 
      label: "Total Sociétés", 
      value: stats?.total_companies ?? "...", 
      icon: Building2, 
      color: "text-primary",
      bg: "bg-primary/10"
    },
    { 
      label: "Utilisateurs Actifs", 
      value: stats?.active_users ?? "...", 
      icon: Users, 
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    { 
      label: "SLA Plateforme", 
      value: stats?.sla_status ?? "99.9%", 
      icon: Activity, 
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    { 
      label: "Ratio Croissance", 
      value: "+12.5%", 
      icon: TrendingUp, 
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-[2px] bg-primary rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Platform Governance</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-black text-on-surface tracking-tighter uppercase italic leading-[0.85]">
            Supervision <br />
            <span className="text-primary not-italic">Des Instances</span>
          </h1>
          <p className="text-on-surface-variant font-medium max-w-lg leading-relaxed opacity-70">
            Console d'administration centrale pour le pilotage des environnements PointelRH. 
            Gérez les quotas, surveillez l'activité et déployez de nouvelles instances.
          </p>
        </div>

        <Button
          variant="primary"
          className="group relative px-10 h-16 rounded-2xl shadow-premium hover:scale-[1.02] transition-all overflow-hidden"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Plus size={22} strokeWidth={3} className="mr-3" />
          <span className="font-display font-black uppercase tracking-tight text-lg">Déployer Instance</span>
        </Button>
      </motion.div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="premium-card p-6 flex flex-col gap-4 accent-bar"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon size={26} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-3xl font-display font-black text-on-surface tracking-tighter italic leading-none">
                {stat.value}
              </div>
              <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-2 opacity-50">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Control Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-between"
      >
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center glass rounded-2xl border-outline-variant/30 px-5 focus-within:border-primary/50 transition-colors">
            <Search className="text-on-surface-variant opacity-40 shrink-0" size={20} strokeWidth={2} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="QUELLE INSTANCE RECHERCHEZ-VOUS ?"
              className="w-full pl-4 pr-2 py-5 bg-transparent border-none text-xs font-black uppercase tracking-[0.1em] focus:ring-0 outline-none text-on-surface placeholder:text-on-surface-variant/30"
            />
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="secondary" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest border border-outline-variant/50">Export Logs</Button>
           <Button variant="secondary" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest border border-outline-variant/50">Maintenance</Button>
        </div>
      </motion.div>

      {/* Error & Table Area */}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center gap-4 text-red-600"
          >
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
              <Plus size={20} className="rotate-45" />
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-tight text-sm">Échec de synchronisation</h4>
              <p className="text-xs opacity-80 font-medium">L'API de plateforme est temporairement indisponible. Vérifiez vos permissions Super Admin.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CompanyTable companies={companies} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-6 pt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <Plus size={20} className="rotate-90" />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em]">Séquence</span>
            <span className="text-xl font-display font-black text-primary italic leading-none">{page} <span className="text-on-surface-variant/30 not-italic">/ {lastPage}</span></span>
          </div>

          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface-variant disabled:opacity-20 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <Plus size={20} />
          </button>
        </div>
      )}

      <CompanyCreateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCompany}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
