import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Lock,
  CheckCircle2,
  PlusCircle,
  Search,
  FileText,
  Calendar,
  Building,
  Smartphone,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  usePayrollPeriods,
  usePayrollPeriod,
  useGeneratePayrollRun,
  useValidatePayrollPeriod,
  useMarkPayrollPeriodAsPaid,
} from './hooks/usePayroll';
import { payrollApi } from './api/payroll.api';
import { PayrollKpiCards } from './components/PayrollKpiCards';
import { PayslipModal } from './components/PayslipModal';
import { AddVariableModal } from './components/AddVariableModal';
import { toast } from 'sonner';

export const PayrollPage: React.FC = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayslipId, setSelectedPayslipId] = useState<string | null>(null);
  const [isAddVariableOpen, setIsAddVariableOpen] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);

  // Queries
  const { data: periods = [], isLoading: isLoadingPeriods } = usePayrollPeriods();

  // Find period matching selectedMonth & selectedYear
  const currentPeriodInList = useMemo(() => {
    return periods.find((p) => p.month === selectedMonth && p.year === selectedYear);
  }, [periods, selectedMonth, selectedYear]);

  // Load detailed period (with payslips) if found
  const { data: detailedPeriod, isLoading: isLoadingDetailed } = usePayrollPeriod(
    currentPeriodInList?.id
  );

  const activePeriod = detailedPeriod || currentPeriodInList;

  // Mutations
  const generatePayroll = useGeneratePayrollRun();
  const validatePeriod = useValidatePayrollPeriod();
  const markAsPaid = useMarkPayrollPeriodAsPaid();

  // Format month input YYYY-MM
  const monthInputVal = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const handleMonthChange = (val: string) => {
    if (!val) return;
    const [y, m] = val.split('-').map(Number);
    setSelectedYear(y);
    setSelectedMonth(m);
  };

  const handleRunPayroll = async () => {
    try {
      await generatePayroll.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
      });
    } catch {
      // Toast already handled by hook
    }
  };

  const handleValidatePeriod = async () => {
    if (!activePeriod) return;
    if (
      window.confirm(
        `Confirmez-vous la validation et le verrouillage de la période ${activePeriod.periodLabel} ? Aucun recalcul ne sera possible sans déverrouillage.`
      )
    ) {
      await validatePeriod.mutateAsync(activePeriod.id);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!activePeriod) return;
    if (
      window.confirm(
        `Confirmez-vous que les salaires de la période ${activePeriod.periodLabel} ont été intégralement versés ?`
      )
    ) {
      await markAsPaid.mutateAsync(activePeriod.id);
    }
  };

  const handleExportBank = async () => {
    if (!activePeriod) return;
    setExportingType('bank');
    try {
      await payrollApi.exportBankTransfer(
        activePeriod.id,
        `ordre-virements-bancaires-${activePeriod.periodLabel.replace('/', '-')}.csv`
      );
      toast.success('Ordre de virement bancaire exporté avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de l\'exportation du fichier de virement bancaire');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportMobileMoney = async () => {
    if (!activePeriod) return;
    setExportingType('wave');
    try {
      await payrollApi.exportMobileMoney(
        activePeriod.id,
        `ordre-virements-wave-om-${activePeriod.periodLabel.replace('/', '-')}.csv`
      );
      toast.success('Fichier de paiement Mobile Money exporté avec succès');
    } catch (err: any) {
      toast.error('Erreur lors de l\'exportation Mobile Money');
    } finally {
      setExportingType(null);
    }
  };

  // Filtered payslips
  const payslips = activePeriod?.payslips || [];
  const filteredPayslips = useMemo(() => {
    if (!searchQuery) return payslips;
    const q = searchQuery.toLowerCase();
    return payslips.filter((p) => {
      const name = `${p.employeeName || ''} ${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.toLowerCase();
      const email = (p.employeeEmail || p.employee?.email || '').toLowerCase();
      const dept = (p.departmentName || p.employee?.department?.name || '').toLowerCase();
      return name.includes(q) || email.includes(q) || dept.includes(q);
    });
  }, [payslips, searchQuery]);

  const formatFcfa = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(Number(val))) return '0 F';
    return `${Math.round(Number(val)).toLocaleString('fr-FR')} F`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Calculator size={28} />
            </div>
            <h1 className="text-3xl font-display font-black text-on-surface tracking-tight uppercase">
              Moteur de Paie Sénégalais
            </h1>
          </div>
          <p className="text-sm text-on-surface-variant mt-1.5 font-medium">
            Conforme au Code Général des Impôts (CGI Art. 37-38), CCNI, IPRES (RG & RCC), CSS et CFCE.
          </p>
        </div>

        {/* Period Picker & Run Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-low px-3.5 py-2 rounded-xl border border-outline-variant/30">
            <Calendar className="text-primary" size={18} />
            <input
              type="month"
              value={monthInputVal}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="bg-transparent border-none text-on-surface font-semibold text-sm focus:ring-0 outline-none cursor-pointer"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleRunPayroll}
            disabled={generatePayroll.isPending}
            className="flex items-center gap-2 shadow-sm"
          >
            {generatePayroll.isPending ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Calculator size={16} />
            )}
            {activePeriod ? 'Recalculer la Paie' : 'Lancer le Calcul'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <PayrollKpiCards period={activePeriod} isLoading={isLoadingPeriods || isLoadingDetailed} />

      {/* Action Bar for Active Period */}
      {activePeriod && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low/30 border border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-2">
            {activePeriod.status === 'CALCULATED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleValidatePeriod}
                disabled={validatePeriod.isPending}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Lock size={15} />
                Valider & Figer la Période
              </Button>
            )}

            {activePeriod.status === 'VALIDATED' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkAsPaid}
                disabled={markAsPaid.isPending}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700"
              >
                <CheckCircle2 size={15} />
                Marquer comme Payé
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddVariableOpen(true)}
              className="flex items-center gap-1.5"
            >
              <PlusCircle size={15} />
              Ajouter Prime / Retenue
            </Button>
          </div>

          {/* Export Options */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportBank}
              disabled={exportingType === 'bank'}
              className="flex items-center gap-1.5"
            >
              <Building size={14} className="text-blue-600" />
              {exportingType === 'bank' ? 'Génération...' : 'Virement Bancaire (CSV)'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportMobileMoney}
              disabled={exportingType === 'wave'}
              className="flex items-center gap-1.5"
            >
              <Smartphone size={14} className="text-emerald-600" />
              {exportingType === 'wave' ? 'Génération...' : 'Wave / OM (CSV)'}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50" size={17} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par collaborateur, email ou service..."
            className="pl-10 text-sm"
          />
        </div>

        <div className="text-xs text-on-surface-variant font-medium flex items-center gap-2">
          <span>{filteredPayslips.length} bulletin(s) généré(s)</span>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
        {isLoadingDetailed || generatePayroll.isPending ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin mx-auto text-primary" />
            <p className="text-on-surface-variant text-sm font-medium">
              Calcul mathématique et fiscal des bulletins en cours...
            </p>
          </div>
        ) : !activePeriod ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Coins size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">
                Aucun cycle de paie calculé pour {String(selectedMonth).padStart(2, '0')}/{selectedYear}
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                Cliquez sur « Lancer le Calcul » pour consolider les salaires de base, heures supplémentaires,
                primes de transport et calculer les cotisations IPRES / CSS / CFCE et l'impôt sur le revenu.
              </p>
            </div>
            <Button variant="primary" onClick={handleRunPayroll}>
              <Calculator size={16} className="mr-2" />
              Lancer le calcul de la paie
            </Button>
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant text-sm italic">
            Aucun bulletin ne correspond à votre recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/30 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="py-3.5 px-4">Collaborateur</th>
                  <th className="py-3.5 px-4">Service / Fonction</th>
                  <th className="py-3.5 px-4 text-right">Salaire Base</th>
                  <th className="py-3.5 px-4 text-right">H.Sup & Primes</th>
                  <th className="py-3.5 px-4 text-right">Transport</th>
                  <th className="py-3.5 px-4 text-right">Brut Total</th>
                  <th className="py-3.5 px-4 text-right text-red-600">IPRES (5.6%/2.4%)</th>
                  <th className="py-3.5 px-4 text-right text-purple-600">IR (CGI)</th>
                  <th className="py-3.5 px-4 text-right text-red-600">Acomptes</th>
                  <th className="py-3.5 px-4 text-right text-emerald-600 font-bold">Net à Payer</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredPayslips.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-on-surface text-sm">
                        {p.employeeName || `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.trim() || 'Collaborateur'}
                      </div>
                      <div className="text-[10px] text-on-surface-variant/70 flex items-center gap-1.5 mt-0.5">
                        <span>{p.employeeEmail || p.employee?.email || ''}</span>
                        {(p.isCadre ?? p.employee?.isCadre) && (
                          <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-700 rounded text-[9px] font-bold">
                            CADRE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant font-medium">
                      <div>{p.jobTitle || p.employee?.jobTitle || 'Collaborateur'}</div>
                      <div className="text-[10px] text-on-surface-variant/60">
                        {p.departmentName || p.employee?.department?.name || 'Général'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-on-surface">
                      {formatFcfa(p.baseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                      +{formatFcfa(Number(p.overtimePay || 0) + Number(p.bonusesTotal || 0))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-on-surface">
                      +{formatFcfa(p.transportAllowance)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-on-surface">
                      {formatFcfa(p.grossSalary)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">
                      -{formatFcfa(Number(p.ipresEmployee || 0) + Number(p.ipresExecEmployee || 0))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-purple-600 font-medium">
                      -{formatFcfa(p.incomeTax ?? p.taxIncomeTax ?? 0)}
                      <div className="text-[9px] text-on-surface-variant/60 font-sans">
                        ({p.taxParts || 1} part{(p.taxParts || 1) > 1 ? 's' : ''})
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-red-600">
                      {(p.advancesDeducted || 0) > 0 ? `-${formatFcfa(p.advancesDeducted)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                      {formatFcfa(p.netPayable ?? p.netSalary ?? p.netPay ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedPayslipId(p.id)}
                        className="flex items-center gap-1.5 mx-auto text-xs py-1 px-2.5"
                      >
                        <FileText size={14} />
                        Voir Bulletin
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PayslipModal
        payslipId={selectedPayslipId}
        onClose={() => setSelectedPayslipId(null)}
      />

      <AddVariableModal
        open={isAddVariableOpen}
        onClose={() => setIsAddVariableOpen(false)}
        month={selectedMonth}
        year={selectedYear}
        payslips={payslips}
      />
    </motion.div>
  );
};
