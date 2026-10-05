import React from 'react';
import { 
  Sparkles, 
  FileCheck, 
  Upload, 
  Eye, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Activity,
  User,
  Shield,
  Clock
} from 'lucide-react';
import type { OnboardingAuditLog } from '../../types';

interface Props {
  auditLogs: OnboardingAuditLog[];
}

interface ActionMeta {
  title: string;
  icon: React.ElementType;
}

const ACTION_CONFIG: Record<string, ActionMeta> = {
  SESSION_CREATED: {
    title: 'Parcours d\'onboarding initialisé',
    icon: Sparkles,
  },
  MAGIC_LINK_OPENED: {
    title: 'Portail candidat ouvert via lien magique',
    icon: Eye,
  },
  DOCUMENT_UPLOADED: {
    title: 'Document justificatif déposé',
    icon: Upload,
  },
  DOCUMENT_REVIEWED: {
    title: 'Document vérifié et validé',
    icon: FileCheck,
  },
  DOCUMENT_REJECTED: {
    title: 'Document rejeté (Demande de correction)',
    icon: XCircle,
  },
  DATA_SUBMITTED: {
    title: 'Fiche de renseignements complétée',
    icon: FileText,
  },
  TASK_COMPLETED: {
    title: 'Tâche validée',
    icon: CheckCircle2,
  },
  PROVISIONING_APPROVED: {
    title: 'Provisioning finalisé & Compte actif',
    icon: UserCheck,
  },
  SESSION_CANCELLED: {
    title: 'Parcours annulé',
    icon: XCircle,
  },
};

const formatActor = (actor?: string | null): { label: string; isCandidate: boolean } => {
  if (!actor || actor === 'SYSTEM' || actor === 'Système') {
    return { label: 'Système automatique', isCandidate: false };
  }
  if (actor.toUpperCase() === 'CANDIDATE') {
    return { label: 'Salarié (Candidat)', isCandidate: true };
  }
  if (actor.includes('-') && actor.length > 20) {
    return { label: 'Gestionnaire RH', isCandidate: false };
  }
  return { label: actor, isCandidate: false };
};

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const SessionAuditTab: React.FC<Props> = ({ auditLogs }) => {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-on-surface-variant border border-dashed border-on-surface/10 rounded-xl">
        Aucun journal d'audit enregistré pour ce parcours.
      </div>
    );
  }

  return (
    <div className="py-2 px-1">
      <div className="flex flex-col">
        {auditLogs.map((log, index) => {
          const isFirst = index === 0;
          const isLast = index === auditLogs.length - 1;

          const config = ACTION_CONFIG[log.action] || {
            title: log.action.replace(/_/g, ' ').toLowerCase(),
            icon: Activity,
          };
          const Icon = config.icon;
          const actorInfo = formatActor(log.actorId);
          const detailDoc = log.details?.documentType || log.details?.fileName || log.details?.taskTitle;

          return (
            <div key={log.id || index} className="flex items-stretch gap-4 group">
              {/* Colonne Rail de Timeline : Garanti 100% centré par Flexbox */}
              <div className="flex flex-col items-center shrink-0 w-8">
                {/* Ligne au-dessus du nœud */}
                <div className={`w-[2px] ${isFirst ? 'bg-transparent' : 'bg-on-surface/10'} h-3`} />

                {/* Nœud circulaire (26px) centré au pixel près */}
                <div className="w-[26px] h-[26px] rounded-full bg-surface-container-lowest border-2 border-primary/30 group-hover:border-primary flex items-center justify-center text-primary shadow-xs transition-colors shrink-0 z-10">
                  <Icon size={12} className="text-primary" />
                </div>

                {/* Ligne en-dessous du nœud reliant le suivant */}
                <div className={`w-[2px] ${isLast ? 'bg-transparent' : 'bg-on-surface/10'} flex-1 min-h-4`} />
              </div>

              {/* Contenu de la carte d'audit */}
              <div className="flex-1 pb-3">
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-on-surface/10 hover:border-on-surface/20 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-on-surface">
                        {config.title}
                      </span>

                      {/* Acteur humanisé */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          actorInfo.isCandidate
                            ? 'bg-primary/5 text-primary border border-primary/10'
                            : 'bg-surface-container text-on-surface-variant border border-on-surface/10'
                        }`}
                      >
                        {actorInfo.isCandidate ? <User size={10} /> : <Shield size={10} />}
                        {actorInfo.label}
                      </span>
                    </div>

                    {/* Horodatage précis */}
                    <span className="text-[11px] text-on-surface-variant font-mono whitespace-nowrap tabular-nums">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  {/* Détails secondaires / Contexte */}
                  <div className="flex items-center justify-between text-[11px] text-on-surface-variant/80">
                    <div className="flex items-center gap-2">
                      {detailDoc && (
                        <span className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface font-medium">
                          {detailDoc}
                        </span>
                      )}
                    </div>

                    {/* Code technique d'audit discret */}
                    {log.action && (
                      <span className="text-[9px] font-mono tracking-wider text-on-surface-variant/40">
                        {log.action}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

