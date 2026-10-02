import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Printer, Building, User, CreditCard, ShieldCheck } from 'lucide-react';
import { usePayslip } from '../hooks/usePayroll';
import type { PayslipLine } from '../types';

interface PayslipModalProps {
  payslipId: string | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslipId, onClose }) => {
  const { data: payslip, isLoading } = usePayslip(payslipId || undefined);

  if (!payslipId) return null;

  const formatFcfa = (val?: number | null) => {
    if (val === null || val === undefined || isNaN(Number(val))) return '-';
    return `${Math.round(Number(val)).toLocaleString('fr-FR')} F`;
  };

  const formatRate = (rate?: number | null) => {
    if (rate === null || rate === undefined || isNaN(Number(rate))) return '-';
    return `${Number(rate).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={!!payslipId}
      onClose={onClose}
      title="Bulletin de Paie Sénégalais"
      className="sm:max-w-4xl max-h-[92vh] flex flex-col"
    >
      {isLoading || !payslip ? (
        <div className="py-20 text-center text-on-surface-variant text-sm italic">
          Chargement du bulletin de paie en cours...
        </div>
      ) : (
        <div className="space-y-6 overflow-y-auto pr-1 text-on-surface">
          {/* Print Styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-payslip, #printable-payslip * {
                visibility: visible;
              }
              #printable-payslip {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                color: black;
                padding: 20px;
                font-size: 11px;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>

          {/* Action Bar */}
          <div className="flex justify-between items-center no-print bg-surface-container-low/40 p-3 rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-on-surface-variant uppercase">Statut :</span>
              {payslip.status === 'PAID' ? (
                <Badge variant="success">PAYÉ</Badge>
              ) : payslip.status === 'VALIDATED' ? (
                <Badge variant="info">VALIDÉ</Badge>
              ) : (
                <Badge variant="warning">BROUILLON (CALCULÉ)</Badge>
              )}
              <span className="text-xs text-on-surface-variant/70 ml-2">
                Période : <strong>{payslip.periodLabel}</strong>
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={handlePrint} className="flex items-center gap-2">
              <Printer size={15} />
              Imprimer le Bulletin
            </Button>
          </div>

          {/* Printable Document Box */}
          <div
            id="printable-payslip"
            className="border border-outline-variant/30 rounded-2xl p-6 bg-surface-container-lowest shadow-sm space-y-6 text-xs"
          >
            {/* Payslip Header */}
            <div className="border-b border-outline-variant/20 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Building size={18} />
                  </div>
                  <span className="font-display font-black text-base uppercase tracking-tight text-on-surface">
                    LuminaRH Sénégal
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Système Intégré de Gestion RH & Paie • République du Sénégal
                </p>
                <p className="text-[10px] text-on-surface-variant">
                  Conformité CGI Art. 37-38 • CCNI • IPRES • CSS
                </p>
              </div>

              <div className="sm:text-right">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg text-xs tracking-wider uppercase">
                  Bulletin de Paie
                </span>
                <p className="font-bold text-on-surface text-sm mt-1">Mois : {payslip.periodLabel}</p>
                <p className="text-[10px] text-on-surface-variant font-mono">
                  Réf : BUL-{payslip.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Employee & Job Information Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-container-low/20 p-4 rounded-xl border border-outline-variant/20">
              {/* Col 1 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-[10px]">
                  <User size={14} /> Salarié(e)
                </div>
                <p className="text-sm font-black text-on-surface">
                  {payslip.employeeName || `${payslip.employee?.firstName || ''} ${payslip.employee?.lastName || ''}`.trim() || 'Collaborateur'}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Emploi / Poste :{' '}
                  <strong className="text-on-surface">
                    {payslip.jobTitle || payslip.employee?.jobTitle || 'Collaborateur'}
                  </strong>
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Département :{' '}
                  <strong className="text-on-surface">
                    {payslip.departmentName || payslip.employee?.department?.name || 'Général'}
                  </strong>
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Statut :{' '}
                  <strong className="text-on-surface">
                    {(payslip.isCadre ?? payslip.employee?.isCadre) ? 'Cadre (RG + RCC)' : 'Non-Cadre (RG)'}
                  </strong>
                </p>
              </div>

              {/* Col 2 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-[10px]">
                  <CreditCard size={14} /> Données Légales & Règlement
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Parts Fiscales (Quotient Familial) :{' '}
                  <strong className="text-on-surface font-mono">{payslip.taxParts} parts</strong>
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  N° IPRES :{' '}
                  <span className="font-mono text-on-surface">
                    {payslip.employee?.ipresNumber || 'Non renseigné'}
                  </span>
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  N° CSS :{' '}
                  <span className="font-mono text-on-surface">
                    {payslip.employee?.cssNumber || 'Non renseigné'}
                  </span>
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Règlement :{' '}
                  <strong className="text-on-surface">
                    {payslip.employee?.bankRib
                      ? `Virement Bancaire (${payslip.employee.bankName || 'Banque'} - ${payslip.employee.bankRib})`
                      : payslip.employee?.mobileMoneyNumber
                      ? `Mobile Money (${payslip.employee.mobileMoneyProvider || 'Wave'} - ${payslip.employee.mobileMoneyNumber})`
                      : 'Espèces / Chèque'}
                  </strong>
                </p>
              </div>
            </div>

            {/* Rubriques Table */}
            <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low/40 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Désignation / Rubrique</th>
                    <th className="py-2.5 px-3 text-right">Base</th>
                    <th className="py-2.5 px-3 text-right">Taux</th>
                    <th className="py-2.5 px-3 text-right text-emerald-700">Gain (FCFA)</th>
                    <th className="py-2.5 px-3 text-right text-red-700">Retenue (FCFA)</th>
                    <th className="py-2.5 px-3 text-right text-amber-700">Patronal (FCFA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {payslip.lines && payslip.lines.length > 0 ? (
                    payslip.lines.map((line: PayslipLine) => (
                      <tr
                        key={line.id}
                        className={
                          line.category === 'SUMMARY'
                            ? 'bg-surface-container-low/30 font-bold'
                            : 'hover:bg-surface-container-low/10'
                        }
                      >
                        <td className="py-2 px-3 font-mono text-[10px] text-on-surface-variant/70">
                          {line.code}
                        </td>
                        <td className="py-2 px-3 font-medium text-on-surface">{line.description}</td>
                        <td className="py-2 px-3 text-right font-mono text-[11px] text-on-surface-variant">
                          {formatFcfa(line.base)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[11px] text-on-surface-variant">
                          {formatRate(line.rate)}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-600">
                          {line.gain ? formatFcfa(line.gain) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-red-600">
                          {line.retenue ? formatFcfa(line.retenue) : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-amber-600">
                          {line.patronal ? formatFcfa(line.patronal) : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-on-surface-variant italic">
                        Aucune ligne détaillée trouvée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals & Net Pay Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Totals details */}
              <div className="border border-outline-variant/20 rounded-xl p-3 space-y-1.5 bg-surface-container-low/10 text-xs">
                <div className="flex justify-between text-on-surface">
                  <span>Salaire Brut Total :</span>
                  <strong>{formatFcfa(payslip.grossSalary)}</strong>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Brut Fiscal Imposable :</span>
                  <span>{formatFcfa(payslip.taxableGross)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Cotisations Salariales (IPRES RG/RCC) :</span>
                  <span>-{formatFcfa(Number(payslip.ipresEmployee || 0) + Number(payslip.ipresExecEmployee || 0))}</span>
                </div>
                <div className="flex justify-between text-purple-600">
                  <span>Retenue Fiscale (IR / VRS - {payslip.taxParts || 1} parts) :</span>
                  <span>-{formatFcfa(payslip.incomeTax ?? payslip.taxIncomeTax ?? 0)}</span>
                </div>
                {(payslip.advancesDeducted || 0) > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Acomptes sur Salaire Déduits :</span>
                    <span>-{formatFcfa(payslip.advancesDeducted)}</span>
                  </div>
                )}
                <div className="border-t border-outline-variant/20 pt-1.5 flex justify-between text-amber-600 text-[11px]">
                  <span>Charges Patronales (IPRES, CSS, CFCE) :</span>
                  <span>
                    +{formatFcfa(
                      Number(payslip.ipresEmployer || 0) +
                        Number(payslip.ipresExecEmployer || 0) +
                        Number(payslip.cssFamily || 0) +
                        Number(payslip.cssWorkAccident || 0) +
                        Number(payslip.cfceTax || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface text-[11px] font-bold">
                  <span>Coût Total Employeur :</span>
                  <span>{formatFcfa(payslip.totalEmployerCost ?? payslip.employerTotalCost ?? 0)}</span>
                </div>
              </div>

              {/* Right Column: Prominent Net To Pay */}
              <div className="border-2 border-emerald-600/30 bg-emerald-500/10 rounded-xl p-4 flex flex-col justify-center items-center text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                  Net à Payer au Salarié
                </p>
                <p className="text-3xl font-display font-black text-emerald-700 tracking-tight my-2">
                  {formatFcfa(payslip.netPayable ?? payslip.netSalary ?? payslip.netPay ?? 0)}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800/80 font-medium">
                  <ShieldCheck size={14} />
                  Net après retenues sociales, IR et acomptes
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="border-t border-outline-variant/20 pt-3 text-[10px] text-on-surface-variant/70 text-center leading-relaxed">
              Pour faire valoir ce que de droit. Établi en conformité avec le Code du Travail de la République du
              Sénégal, la CCNI et le Code Général des Impôts (CGI). Conservez ce bulletin sans limitation de
              durée.
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
