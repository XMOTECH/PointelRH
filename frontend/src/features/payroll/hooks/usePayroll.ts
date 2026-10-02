import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../api/payroll.api';
import { toast } from 'sonner';
import type { GeneratePayrollPayload, AddPayrollVariablePayload } from '../types';

export const PAYROLL_QUERY_KEYS = {
  periods: ['payroll-periods'] as const,
  period: (id: string) => ['payroll-period', id] as const,
  payslip: (id: string) => ['payroll-payslip', id] as const,
  prePayroll: (monthYear?: string) => ['pre-payroll', monthYear] as const,
};

export function usePayrollPeriods() {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.periods,
    queryFn: payrollApi.getPeriods,
  });
}

export function usePayrollPeriod(id?: string) {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.period(id || ''),
    queryFn: () => payrollApi.getPeriod(id!),
    enabled: !!id,
  });
}

export function usePayslip(id?: string) {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.payslip(id || ''),
    queryFn: () => payrollApi.getPayslip(id!),
    enabled: !!id,
  });
}

export function useGeneratePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeneratePayrollPayload) => payrollApi.generatePayrollRun(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.periods });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.period(data.id) });
      }
      toast.success(
        `Cycle de paie ${data.month}/${data.year} calculé avec succès (${data.employeeCount} employés traités)`
      );
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors du calcul de la paie';
      toast.error(msg);
    },
  });
}

export function useValidatePayrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.validatePeriod(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.periods });
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.period(data.id) });
      toast.success(`Période de paie ${data.periodLabel} validée et verrouillée.`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la validation de la période';
      toast.error(msg);
    },
  });
}

export function useMarkPayrollPeriodAsPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollApi.markPeriodAsPaid(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.periods });
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.period(data.id) });
      toast.success(`Période ${data.periodLabel} marquée comme payée.`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la mise à jour du statut de paiement';
      toast.error(msg);
    },
  });
}

export function useAddPayrollVariable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddPayrollVariablePayload) => payrollApi.addVariable(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYROLL_QUERY_KEYS.periods });
      toast.success('Variable de paie enregistrée avec succès. Relancez le calcul pour l\'appliquer.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de l\'enregistrement de la variable';
      toast.error(msg);
    },
  });
}

export function usePrePayroll(monthYear?: string) {
  return useQuery({
    queryKey: PAYROLL_QUERY_KEYS.prePayroll(monthYear),
    queryFn: () => payrollApi.getPrePayroll(monthYear),
  });
}
