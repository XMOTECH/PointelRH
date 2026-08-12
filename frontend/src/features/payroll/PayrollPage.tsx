import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Download, Calendar, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'sonner';

interface PayrollItem {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  base_salary: number;
  presence_days: number;
  overtime_15_hours: number;
  overtime_40_hours: number;
  overtime_60_hours: number;
  overtime_pay: number;
  transport_allowance: number;
  advances_deducted: number;
  net_salary_estimate: number;
}

export function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Format MM-YYYY
  const currentMonthYear = `${String(new Date().getMonth() + 1).padStart(2, '0')}-${new Date().getFullYear()}`;
  const [monthYear, setMonthYear] = useState(currentMonthYear);
  const [exporting, setExporting] = useState(false);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/payroll/pre-payroll', {
        params: { monthYear },
      });
      setPayrollData(res.data?.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des variables de paie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [monthYear]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const response = await api.get('/api/payroll/pre-payroll/export', {
        params: { monthYear },
        responseType: 'blob', // Important for file download
      });
      
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pre-payroll-${monthYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Le fichier CSV a été exporté avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'exportation CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-on-surface tracking-tighter uppercase flex items-center gap-3">
            <Coins className="text-primary" size={32} />
            Variables de Pré-paie (Sénégal)
          </h1>
          <p className="text-on-surface-variant mt-1 font-medium">
            Consolidez et exportez les heures supplémentaires, primes de transport et acomptes du personnel.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Month picker */}
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/20">
            <Calendar className="text-primary" size={16} />
            <input
              type="month"
              value={monthYear.split('-').reverse().join('-')}
              onChange={(e) => {
                if (!e.target.value) return;
                const [year, month] = e.target.value.split('-');
                setMonthYear(`${month}-${year}`);
              }}
              className="bg-transparent border-none text-on-surface font-medium text-sm focus:ring-0 outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleExportCsv}
            disabled={exporting || payrollData.length === 0}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Exporter en CSV
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm italic">
            Calcul et consolidation des variables en cours...
          </div>
        ) : payrollData.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm italic">
            Aucun employé actif trouvé pour ce mois.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] font-space font-semibold text-on-surface-variant/50 uppercase tracking-[0.15em] bg-surface-container-low/20">
                  <th className="px-6 py-4">Employé</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Salaire de Base</th>
                  <th className="px-6 py-4">Présence</th>
                  <th className="px-6 py-4">H. Sup 15% / 40% / 60%</th>
                  <th className="px-6 py-4">Gain H. Sup</th>
                  <th className="px-6 py-4">Indemnité Transport</th>
                  <th className="px-6 py-4">Acomptes Déduits</th>
                  <th className="px-6 py-4 text-right">Net Estimé (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {payrollData.map((item) => (
                  <tr key={item.employee_id} className="hover:bg-surface-container-low/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-on-surface text-sm">
                        {item.first_name} {item.last_name}
                      </div>
                      <div className="text-[10px] text-on-surface-variant/40">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-on-surface-variant/80">
                      {item.department}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-on-surface">
                      {item.base_salary.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-xs text-on-surface-variant/80">
                      {item.presence_days} jours
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-on-surface-variant/80">
                      {item.overtime_15_hours}h / {item.overtime_40_hours}h / {item.overtime_60_hours}h
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-emerald-600">
                      +{item.overtime_pay.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-on-surface">
                      +{item.transport_allowance.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-red-600">
                      -{item.advances_deducted.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-primary text-sm">
                      {item.net_salary_estimate.toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
