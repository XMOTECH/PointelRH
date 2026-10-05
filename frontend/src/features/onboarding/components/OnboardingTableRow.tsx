import React from 'react';
import { TableRow, TableCell } from '@/components/ui/Table';
import { UserAvatarCell } from '@/components/common/UserAvatarCell';
import { Button } from '@/components/ui/Button';
import { Calendar, MessageSquare, Copy } from 'lucide-react';
import { buildWhatsAppShareUrl } from '../utils/shareUtils';
import { toast } from 'sonner';
import type { OnboardingSession } from '../types';

interface Props {
  session: OnboardingSession;
  onSelect: (id: string) => void;
}

// Badges de statut élégants (sans point/bullet)
const STATUS_METAS: Record<string, { label: string; badgeClass: string }> = {
  DRAFT: { label: 'Brouillon', badgeClass: 'bg-surface-container text-on-surface-variant border-on-surface/10' },
  INVITED: { label: 'Invité (En attente)', badgeClass: 'bg-amber-500/10 text-amber-800 border-amber-500/20' },
  COLLECTING_DATA: { label: 'Données en cours', badgeClass: 'bg-amber-500/10 text-amber-800 border-amber-500/20' },
  IN_REVIEW: { label: 'En révision RH', badgeClass: 'bg-sky-500/10 text-sky-800 border-sky-500/20' },
  READY_FOR_DAY_ONE: { label: 'Prêt Jour J', badgeClass: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' },
  COMPLETED: { label: 'Terminé', badgeClass: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' },
  CANCELLED: { label: 'Annulé', badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-500/20' },
};


export const OnboardingTableRow: React.FC<Props> = ({ session, onSelect }) => {
  const staging = (session.stagingData as Record<string, any>) || (session as any).staging_data || {};
  const clean = (val: any) =>
    val && typeof val === 'string' && val.trim() !== 'undefined' && val.trim() !== 'null' ? val.trim() : '';

  const fName = clean(staging.candidateFirstName) || clean(staging.candidate_first_name) || clean(session.employee?.firstName);
  const lName = clean(staging.candidateLastName) || clean(staging.candidate_last_name) || clean(session.employee?.lastName);
  let name = `${fName} ${lName}`.trim();
  if (!name) {
    const direct = clean(staging.candidateName) || clean(staging.fullName) || clean((session.employee as any)?.fullName);
    name = direct || (staging.candidateEmail ? staging.candidateEmail.split('@')[0] : 'Nouveau Collaborateur');
  }


  const email = staging.candidateEmail || staging.candidate_email || session.employee?.email || '—';
  const phone = staging.candidatePhone || staging.candidate_phone || '';

  const targetDateStr = session.targetStartDate || (session as any).target_start_date;
  let targetDateFormatted = 'À définir';
  let dateDiffText = '';
  let dateDiffClass = 'text-on-surface-variant/70';

  if (targetDateStr && !isNaN(new Date(targetDateStr).getTime())) {
    const target = new Date(targetDateStr);
    targetDateFormatted = target.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    const diffDays = Math.round((tDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      dateDiffText = "Aujourd'hui";
      dateDiffClass = 'text-amber-800 font-semibold';
    } else if (diffDays < 0) {
      dateDiffText = `Passé (${Math.abs(diffDays)}j)`;
      dateDiffClass = 'text-rose-700 font-semibold';
    } else {
      dateDiffText = `Dans ${diffDays}j`;
      dateDiffClass = 'text-on-surface-variant/70';
    }
  }

  const progress = session.progressPercent ?? (session as any).progress_percent ?? 0;
  const token = session.magicToken || (session as any).magic_token;
  const statusMeta = STATUS_METAS[session.status] || {
    label: session.status,
    dotClass: 'bg-on-surface-variant/40',
  };

  return (
    <TableRow
      onClick={() => onSelect(session.id)}
      className="hover:bg-surface-container-low/50 transition-colors border-b border-on-surface/5 last:border-b-0 cursor-pointer group"
    >
      {/* Candidat (Avatar + Nom + Contact) */}
      <TableCell className="py-3 pl-6">
        <UserAvatarCell
          name={name}
          subtitle={`${email}${phone ? ` • ${phone}` : ''}`}
        />
      </TableCell>

      {/* Modèle de parcours */}
      <TableCell className="py-3">
        <span className="text-xs font-medium text-on-surface">
          {session.template?.name || 'Standard'}
        </span>
      </TableCell>

      {/* Date d'embauche épurée */}
      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-on-surface flex items-center gap-1.5 font-medium">
            <Calendar size={12} className="text-on-surface-variant/60 shrink-0" />
            {targetDateFormatted}
          </span>
          {dateDiffText && (
            <span className={`text-[10px] font-mono ${dateDiffClass}`}>
              {dateDiffText}
            </span>
          )}
        </div>
      </TableCell>

      {/* Progression sobre (style Stripe) */}
      <TableCell className="py-3">
        <div className="flex items-center gap-2.5 w-28">
          <div className="flex-1 h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-on-surface font-mono">
            {progress}%
          </span>
        </div>
      </TableCell>

      {/* Statut : Badge épuré sans point/bullet */}
      <TableCell className="py-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusMeta.badgeClass}`}
        >
          {statusMeta.label}
        </span>
      </TableCell>


      {/* Actions */}
      <TableCell className="py-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {token && session.status !== 'CANCELLED' && session.status !== 'COMPLETED' && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                title={phone ? `WhatsApp (${phone})` : 'Envoyer sur WhatsApp'}
                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                onClick={() => {
                  const magicUrl = `${window.location.origin}/onboarding/portal/${token}`;
                  const waUrl = buildWhatsAppShareUrl(phone, name, magicUrl);
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                <MessageSquare size={13} />
              </button>

              <button
                type="button"
                title="Copier le lien candidat"
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => {
                  const url = `${window.location.origin}/onboarding/portal/${token}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Lien candidat copié !');
                }}
              >
                <Copy size={13} />
              </button>
            </div>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSelect(session.id)}
            className="h-7 px-2.5 text-xs font-medium"
          >
            Détails
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
