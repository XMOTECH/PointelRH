import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Check, Copy, ExternalLink, Mail, MessageSquare, SendHorizontal, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { buildMagicLink, buildWhatsAppShareUrl, buildMailtoShareUrl } from '../utils/shareUtils';
import type { OnboardingSession } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  session: OnboardingSession | null;
  onViewDetails?: (sessionId: string) => void;
}

export const ShareInviteModal: React.FC<Props> = ({
  open,
  onClose,
  session,
  onViewDetails,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open || !session) return null;

  const staging = (session.stagingData as Record<string, any>) || (session as any).staging_data || {};
  const cleanStr = (val: any): string => {
    if (!val || typeof val !== 'string') return '';
    const trimmed = val.trim();
    if (trimmed === 'undefined' || trimmed === 'null') return '';
    return trimmed;
  };

  const fName =
    cleanStr(staging.candidateFirstName) ||
    cleanStr(staging.candidate_first_name) ||
    cleanStr(session.employee?.firstName);
  const lName =
    cleanStr(staging.candidateLastName) ||
    cleanStr(staging.candidate_last_name) ||
    cleanStr(session.employee?.lastName);

  let candidateName = `${fName} ${lName}`.trim();
  if (!candidateName) {
    const direct =
      cleanStr(staging.candidateName) ||
      cleanStr(staging.fullName) ||
      cleanStr(session.employee?.fullName) ||
      cleanStr(session.candidateName);
    if (direct) {
      candidateName = direct;
    } else {
      const emailVal = cleanStr(staging.candidateEmail) || cleanStr(staging.candidate_email) || cleanStr(session.employee?.email);
      candidateName = emailVal ? emailVal.split('@')[0] : 'Nouveau Collaborateur';
    }
  }

  const email = staging.candidateEmail || staging.candidate_email || session.employee?.email || '';
  const phone = staging.candidatePhone || staging.candidate_phone || session.employee?.phone || '';
  const token = session.magicToken || (session as any).magic_token || '';
  const magicLink = buildMagicLink(token);

  const handleCopyLink = () => {
    if (!magicLink) return;
    navigator.clipboard.writeText(magicLink);
    setCopied(true);
    toast.success('Lien Magic Link copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    if (!magicLink) return;
    const url = buildWhatsAppShareUrl(phone, candidateName, magicLink);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleMailtoShare = () => {
    if (!magicLink) return;
    const url = buildMailtoShareUrl(email, candidateName, magicLink);
    window.location.href = url;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invitation envoyée"
      className="sm:max-w-lg"
    >
      <div className="space-y-5 pt-1">
        {/* En-tête de confirmation */}
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-600 rounded-xl shrink-0 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-on-surface">
              Onboarding créé avec succès pour {candidateName}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Un email d'invitation avec le lien sécurisé a été préparé pour{' '}
              <strong className="text-on-surface">{email || 'le candidat'}</strong>. Vous pouvez également lui transmettre le lien instantanément sur son téléphone.
            </p>
          </div>
        </div>

        {/* Bloc Magic Link */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Lien d'accès unique (Magic Link)
          </label>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low border border-on-surface/10">
            <input
              type="text"
              readOnly
              value={magicLink}
              className="bg-transparent text-xs font-mono text-on-surface flex-1 outline-none select-all truncate px-1"
            />
            <Button
              type="button"
              size="sm"
              variant={copied ? 'secondary' : 'secondary'}
              onClick={handleCopyLink}
              className="shrink-0 h-8 text-xs font-semibold"
            >
              {copied ? (
                <>
                  <Check size={14} className="mr-1.5 text-emerald-600" />
                  Copié
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1.5" />
                  Copier
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Canaux d'envoi rapide */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Transmettre directement au candidat
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-semibold transition-all shadow-sm group cursor-pointer"
            >
              <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
              <span>Envoyer sur WhatsApp {phone ? `(${phone})` : ''}</span>
            </button>

            {/* Email client */}
            <button
              type="button"
              onClick={handleMailtoShare}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-on-surface/10 text-on-surface text-xs font-semibold transition-all active:scale-[0.99] group cursor-pointer"
            >
              <Mail size={16} className="group-hover:scale-110 transition-transform text-primary" />
              <span>Ouvrir dans Messagerie</span>
            </button>
          </div>
        </div>

        {/* Pied de modal */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/40">
          <a
            href={magicLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
          >
            <ExternalLink size={13} />
            Tester le portail candidat
          </a>

          <div className="flex items-center gap-2">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onViewDetails(session.id);
                }}
                className="h-8 text-xs font-semibold"
              >
                Voir le dossier
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs font-semibold"
            >
              Terminer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
