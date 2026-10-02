import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Banknote, Wallet, Building2, Receipt, Users, ShieldCheck } from 'lucide-react';
import type { PayrollPeriod } from '../types';

interface PayrollKpiCardsProps {
  period?: PayrollPeriod | null;
  isLoading?: boolean;
}

export const PayrollKpiCards: React.FC<PayrollKpiCardsProps> = ({ period, isLoading }) => {
  const formatFcfa = (val?: number) => {
    if (val === undefined || val === null || isNaN(Number(val))) return '0 FCFA';
    return `${Math.round(Number(val)).toLocaleString('fr-FR')} FCFA`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface-container-low rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {period && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Statut de la période {period.periodLabel} :
            </span>
            <StatusBadge status={period.status} />
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <Users size={15} className="text-primary" />
              <strong>{period.employeeCount}</strong> collaborateurs traités
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-emerald-600" />
              Barème légal Sénégal 2026 (CGI, IPRES, CSS, CFCE)
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Masse Salariale Brute */}
        <Card className="p-5 flex items-start justify-between bg-surface-container-lowest border-on-surface/10 rounded-2xl shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Masse Salariale Brute
            </p>
            <p className="text-2xl font-display font-bold text-on-surface mt-1">
              {formatFcfa(period?.totalGross)}
            </p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">
              Base + H.Sup + Primes + Transport
            </p>
          </div>
          <div className="text-primary shrink-0 pt-0.5">
            <Banknote size={24} />
          </div>
        </Card>

        {/* KPI 2: Net Total à Payer */}
        <Card className="p-5 flex items-start justify-between bg-surface-container-lowest border-on-surface/10 rounded-2xl shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Net Total à Payer
            </p>
            <p className="text-2xl font-display font-bold text-emerald-600 mt-1">
              {formatFcfa(period?.totalNet)}
            </p>
            <p className="text-[10px] text-emerald-700/70 mt-1">
              À verser aux collaborateurs
            </p>
          </div>
          <div className="text-emerald-600 shrink-0 pt-0.5">
            <Wallet size={24} />
          </div>
        </Card>

        {/* KPI 3: Charges Patronales */}
        <Card className="p-5 flex items-start justify-between bg-surface-container-lowest border-on-surface/10 rounded-2xl shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Charges Patronales
            </p>
            <p className="text-2xl font-display font-bold text-amber-600 mt-1">
              {formatFcfa(period?.totalSocialEmployer)}
            </p>
            <p className="text-[10px] text-amber-700/70 mt-1">
              IPRES (8.4%/3.6%), CSS (7%+AT), CFCE 3%
            </p>
          </div>
          <div className="text-amber-600 shrink-0 pt-0.5">
            <Building2 size={24} />
          </div>
        </Card>

        {/* KPI 4: Retenues Fiscales (VRS / IR) */}
        <Card className="p-5 flex items-start justify-between bg-surface-container-lowest border-on-surface/10 rounded-2xl shadow-sm">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Impôt Retenu (VRS / IR)
            </p>
            <p className="text-2xl font-display font-bold text-indigo-600 mt-1">
              {formatFcfa(period?.totalTax)}
            </p>
            <p className="text-[10px] text-indigo-700/70 mt-1">
              À reverser au Trésor Public (DGID)
            </p>
          </div>
          <div className="text-indigo-600 shrink-0 pt-0.5">
            <Receipt size={24} />
          </div>
        </Card>
      </div>
    </div>
  );
};
