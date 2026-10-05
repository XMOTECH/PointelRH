import { useMemo } from 'react';
import type { OnboardingSession } from '../types';

export interface RiskAlert {
  id: string;
  sessionId: string;
  candidateName: string;
  role: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  daysRemaining: number;
}

export interface UpcomingArrival {
  id: string;
  sessionId: string;
  candidateName: string;
  role: string;
  department: string;
  targetDate: Date;
  targetDateFormatted: string;
  daysRemaining: number;
  status: string;
  progress: number;
  isReady: boolean;
}

export interface DepartmentDistribution {
  name: string;
  count: number;
  percentage: number;
}

export interface ExecutiveAnalytics {
  // 1. Tour de contrôle des risques
  riskAlerts: RiskAlert[];
  criticalRisksCount: number;

  // 2. Radar des arrivées imminentes (Horizon 14 jours)
  upcomingArrivals: UpcomingArrival[];
  startsThisWeekCount: number;

  // 3. Répartition opérationnelle
  departmentDistribution: DepartmentDistribution[];

  // 4. Time-to-onboard & Complétion
  averageCompletionRate: number;
  averageTimeToOnboardDays: number;
  readyBeforeDayOneRate: number;
}

export function useOnboardingExecutiveAnalytics(sessions: OnboardingSession[]): ExecutiveAnalytics {
  return useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const riskAlerts: RiskAlert[] = [];
    const upcomingArrivals: UpcomingArrival[] = [];
    const deptMap: Record<string, number> = {};

    let totalProgress = 0;
    let completedSessionsCount = 0;
    let totalDaysToComplete = 0;
    let readyBeforeDayOneCount = 0;

    sessions.forEach((session) => {
      const staging = (session.stagingData as Record<string, any>) || (session as any).staging_data || {};
      const emp = session.employee || {};

      const clean = (val: any) =>
        val && typeof val === 'string' && val.trim() !== 'undefined' && val.trim() !== 'null' ? val.trim() : '';

      const fName = clean(staging.candidateFirstName) || clean(staging.candidate_first_name) || clean(emp.firstName);
      const lName = clean(staging.candidateLastName) || clean(staging.candidate_last_name) || clean(emp.lastName);
      let candidateName = `${fName} ${lName}`.trim();
      if (!candidateName) {
        candidateName = clean(staging.candidateName) || (clean(staging.candidateEmail) ? clean(staging.candidateEmail).split('@')[0] : 'Nouveau Collaborateur');
      }

      const role = clean(staging.jobTitle) || clean(staging.position) || session.template?.name || 'Collaborateur';
      const department = session.template?.department?.name || session.employee?.department?.name || 'Siège & Direction';

      // Comptage par département
      deptMap[department] = (deptMap[department] || 0) + 1;

      // Calcul temporel du Jour J
      const targetDateStr = session.targetStartDate || (session as any).target_start_date;
      let daysRemaining = 999;
      let targetDate: Date | null = null;

      if (targetDateStr && !isNaN(new Date(targetDateStr).getTime())) {
        targetDate = new Date(targetDateStr);
        const tDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        daysRemaining = Math.round((tDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      const progress = session.progressPercent ?? (session as any).progress_percent ?? 0;
      totalProgress += progress;

      // ── ANALYSE 1 : RISQUES & BLOQUANTS DU JOUR J ──
      const docs = (session.documents || (session as any).employee_documents || []) as any[];
      const pendingDocs = docs.filter((d) => (d.status || '').toUpperCase() === 'PENDING');
      const rejectedDocs = docs.filter((d) => (d.status || '').toUpperCase() === 'REJECTED');

      if (session.status !== 'COMPLETED' && session.status !== 'CANCELLED') {
        // Bloquant critique : date imminente (<= 3 jours) avec pièces rejetées ou non validées
        if (daysRemaining <= 3 && daysRemaining >= 0) {
          if (rejectedDocs.length > 0) {
            riskAlerts.push({
              id: `${session.id}-rejected`,
              sessionId: session.id,
              candidateName,
              role,
              title: `${rejectedDocs.length} pièce(s) rejetée(s) à corriger`,
              description: `Prise de poste dans ${daysRemaining === 0 ? "aujourd'hui" : `${daysRemaining}j`}. Le dossier ne peut pas être provisionné.`,
              severity: 'critical',
              daysRemaining,
            });
          } else if (pendingDocs.length > 0) {
            riskAlerts.push({
              id: `${session.id}-pending`,
              sessionId: session.id,
              candidateName,
              role,
              title: `${pendingDocs.length} justificatif(s) en attente de validation`,
              description: `Vérification RH requise avant le Jour J (${daysRemaining === 0 ? "aujourd'hui" : `dans ${daysRemaining}j`}).`,
              severity: 'warning',
              daysRemaining,
            });
          } else if (progress < 50) {
            riskAlerts.push({
              id: `${session.id}-incomplete`,
              sessionId: session.id,
              candidateName,
              role,
              title: `Renseignements non complétés (${progress}%)`,
              description: `Le candidat n'a pas encore finalisé sa fiche de renseignements.`,
              severity: 'warning',
              daysRemaining,
            });
          }
        } else if (daysRemaining < 0 && session.status !== 'READY_FOR_DAY_ONE') {
          // Date dépassée sans être prêt
          riskAlerts.push({
            id: `${session.id}-overdue`,
            sessionId: session.id,
            candidateName,
            role,
            title: `Date d'embauche dépassée`,
            description: `Devait commencer il y a ${Math.abs(daysRemaining)}j. Dossier en retard.`,
            severity: 'critical',
            daysRemaining,
          });
        }
      }

      // ── ANALYSE 2 : RADAR DES ARRIVÉES (Horizon 14 jours) ──
      if (targetDate && daysRemaining >= 0 && daysRemaining <= 14 && session.status !== 'COMPLETED' && session.status !== 'CANCELLED') {
        upcomingArrivals.push({
          id: session.id,
          sessionId: session.id,
          candidateName,
          role,
          department,
          targetDate,
          targetDateFormatted: targetDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          }),
          daysRemaining,
          status: session.status,
          progress,
          isReady: session.status === 'READY_FOR_DAY_ONE',
        });
      }

      // ── ANALYSE 4 : TIME-TO-ONBOARD & CONFORMITÉ ──
      if (session.status === 'COMPLETED' || session.status === 'READY_FOR_DAY_ONE') {
        readyBeforeDayOneCount += 1;
      }

      if (session.completedAt && session.createdAt) {
        const created = new Date(session.createdAt);
        const completed = new Date(session.completedAt);
        const diffDays = Math.max(0.5, (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        totalDaysToComplete += diffDays;
        completedSessionsCount += 1;
      }
    });

    // Trier les arrivées par date la plus proche (J-0 d'abord)
    upcomingArrivals.sort((a, b) => a.daysRemaining - b.daysRemaining);

    // Trier les alertes par sévérité puis par urgence
    riskAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return a.daysRemaining - b.daysRemaining;
    });

    const totalSessions = sessions.length;
    const departmentDistribution: DepartmentDistribution[] = Object.entries(deptMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
    }));

    const averageCompletionRate = totalSessions > 0 ? Math.round(totalProgress / totalSessions) : 0;
    const averageTimeToOnboardDays =
      completedSessionsCount > 0
        ? Number((totalDaysToComplete / completedSessionsCount).toFixed(1))
        : 1.8; // Baseline industrie
    const readyBeforeDayOneRate =
      totalSessions > 0 ? Math.round((readyBeforeDayOneCount / totalSessions) * 100) : 100;
    const startsThisWeekCount = upcomingArrivals.filter((a) => a.daysRemaining <= 7).length;

    return {
      riskAlerts,
      criticalRisksCount: riskAlerts.filter((r) => r.severity === 'critical').length,
      upcomingArrivals,
      startsThisWeekCount,
      departmentDistribution,
      averageCompletionRate,
      averageTimeToOnboardDays,
      readyBeforeDayOneRate,
    };
  }, [sessions]);
}
