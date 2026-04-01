import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/Table';
import { Badge } from '../../../../components/ui/Badge';
import { Switch } from '../../../../components/ui/Switch';
import type { Company } from '../../api/admin.api';
import { formatDate, cn } from '../../../../lib/utils';
import { Building2, Users, Calendar, MoreVertical, ShieldCheck, Zap, Globe, Lock } from 'lucide-react';
import { useToggleCompanyStatus } from '../../hooks/useCompanies';

interface CompanyTableProps {
  companies: Company[];
  isLoading: boolean;
}

export function CompanyTable({ companies, isLoading }: CompanyTableProps) {
  const toggleMutation = useToggleCompanyStatus();

  const getPlanBadge = (plan: Company['plan']) => {
    switch (plan) {
      case 'enterprise':
        return (
          <Badge variant="info" className="bg-primary/10 text-primary border border-primary/20 gap-1.5 py-1 px-3">
            <ShieldCheck size={12} strokeWidth={2.5} />
            <span className="font-black tracking-widest text-[9px]">ENTERPRISE</span>
          </Badge>
        );
      case 'pro':
        return (
          <Badge variant="warning" className="bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-1.5 py-1 px-3">
            <Zap size={12} strokeWidth={2.5} />
            <span className="font-black tracking-widest text-[9px]">PRO</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="bg-surface-container-high text-on-surface-variant border border-outline-variant gap-1.5 py-1 px-3">
            <Globe size={12} strokeWidth={2.5} />
            <span className="font-black tracking-widest text-[9px]">FREE</span>
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30 shadow-ambient">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 size={24} className="text-primary/40" />
            </div>
          </div>
          <p className="text-on-surface-variant font-display font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Synchronisation des données...</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="premium-card w-full h-96 flex flex-col items-center justify-center gap-8 text-center p-12">
        <div className="w-24 h-24 bg-surface-container-low rounded-[2rem] flex items-center justify-center text-on-surface-variant/20 rotate-3 border border-outline-variant/30 shadow-inner">
          <Building2 size={48} strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-display font-black text-on-surface uppercase tracking-tight italic leading-none">Plateforme Vierge</h3>
          <p className="text-on-surface-variant max-w-xs font-medium leading-relaxed opacity-70 italic text-sm">
            Aucune organisation n'a été déployée pour le moment. Initialisez une instance pour commencer.
          </p>
        </div>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-outline-variant to-transparent" />
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-container-low/50 border-none">
            <TableHead className="font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em] py-6 pl-8">Organisation</TableHead>
            <TableHead className="font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em]">Offre Active</TableHead>
            <TableHead className="font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em] text-center">Effectif</TableHead>
            <TableHead className="font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em]">Disponibilité</TableHead>
            <TableHead className="font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em]">Enregistrement</TableHead>
            <TableHead className="font-black text-on-surface-variant text-[10px] uppercase tracking-[0.2em] text-right pr-8">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id} className="group transition-all hover:bg-surface-container-low/40 border-b border-outline-variant/10 last:border-none">
              <TableCell className="py-6 pl-8 border-none">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container shadow-sm flex items-center justify-center text-on-surface-variant/40 group-hover:text-primary group-hover:shadow-md group-hover:shadow-primary/10 transition-all duration-500 border border-outline-variant/30">
                    <Building2 size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-display font-black text-on-surface tracking-tight text-xl leading-none uppercase italic group-hover:text-primary transition-colors duration-300">
                      {company.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-on-surface-variant font-bold mt-2 opacity-40 font-mono tracking-widest">
                      <Lock size={10} />
                      {company.id.substring(0, 8).toUpperCase()}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-none">
                {getPlanBadge(company.plan)}
              </TableCell>
              <TableCell className="text-center border-none">
                <div className="flex items-center justify-center gap-2.5 font-black text-on-surface bg-surface-container-high/40 shadow-sm w-fit mx-auto px-4 py-2 rounded-xl border border-outline-variant/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Users size={14} strokeWidth={2.5} />
                  <span className="text-xs tracking-tighter">{company.users_count || 0}</span>
                </div>
              </TableCell>
              <TableCell className="border-none">
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={company.is_active} 
                    onCheckedChange={(val) => toggleMutation.mutate({ id: company.id, isActive: val })}
                    disabled={toggleMutation.isPending}
                  />
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.1em]",
                      company.is_active ? "text-green-600" : "text-red-500"
                    )}>
                      {company.is_active ? 'OPÉRATIONNEL' : 'DÉCONNECTÉ'}
                    </span>
                    <span className="text-[8px] font-bold text-on-surface-variant opacity-40">AUTO-SYNC ON</span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-none">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-on-surface-variant font-black text-[10px] opacity-70 group-hover:opacity-100 transition-opacity">
                    <Calendar size={12} strokeWidth={2.5} className="text-primary" />
                    <span>{formatDate(company.created_at)}</span>
                  </div>
                  <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary/20 w-3/4" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-none pr-8 text-right">
                <button className="w-10 h-10 inline-flex items-center justify-center bg-surface-container-low hover:bg-primary hover:text-white rounded-xl transition-all duration-300 text-on-surface-variant shadow-sm border border-outline-variant/30">
                  <MoreVertical size={20} strokeWidth={1.5} />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
