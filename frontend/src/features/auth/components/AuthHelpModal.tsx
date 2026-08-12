import React, { useState } from 'react';
import { X, Mail, CheckCircle2, LifeBuoy, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export type HelpModalType = 'forgot' | 'help' | 'terms' | null;

interface AuthHelpModalProps {
  type: HelpModalType;
  onClose: () => void;
}

export function AuthHelpModal({ type, onClose }: AuthHelpModalProps) {
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!type) return null;

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResetSent(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            {type === 'forgot' && <Mail className="w-5 h-5 text-indigo-600" />}
            {type === 'help' && <LifeBuoy className="w-5 h-5 text-blue-600" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-slate-600" />}
            <h3 className="text-base font-bold text-slate-900">
              {type === 'forgot' && 'Réinitialiser votre mot de passe'}
              {type === 'help' && 'Aide & Support Technique'}
              {type === 'terms' && 'Conditions d\'utilisation & Confidentialité'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {type === 'forgot' && (
            <>
              {resetSent ? (
                <div className="py-4 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Demande envoyée !</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Si un compte correspond à <strong>{resetEmail}</strong>, vous recevrez un lien de réinitialisation sous quelques minutes.
                  </p>
                  <Button onClick={onClose} className="mt-2 bg-slate-900 hover:bg-slate-800 text-xs px-6 py-2">
                    Fermer
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500">
                    Saisissez votre adresse e-mail professionnelle. Nous vous enverrons les instructions pour configurer un nouveau mot de passe.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Email Professionnel
                    </label>
                    <Input
                      type="email"
                      placeholder="nom@entreprise.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="h-11 bg-slate-50 border-slate-200 text-sm"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <Button type="submit" isLoading={isLoading} className="text-xs px-5 py-2">
                      Envoyer le lien
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}

          {type === 'help' && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2">
                <h4 className="font-bold text-blue-950 flex items-center gap-2 text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Comptes de démonstration pré-configurés
                </h4>
                <div className="space-y-1 text-blue-900 font-mono text-[11px]">
                  <p>• Admin: <strong>amadou@luminarh.sn</strong> / <code>password</code></p>
                  <p>• Manager: <strong>fatou@luminarh.sn</strong> / <code>password</code></p>
                  <p>• Employé: <strong>mandiaye@luminarh.sn</strong> / <code>password</code></p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-900">Besoin d'assistance directe ?</h5>
                <p>Notre équipe support est disponible du lundi au vendredi de 8h00 à 18h00.</p>
                <p className="font-semibold text-slate-800">
                  Email : <a href="mailto:support@luminarh.com" className="text-indigo-600 hover:underline">support@luminarh.com</a>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button onClick={onClose} className="text-xs px-5 py-2">
                  Fermer
                </Button>
              </div>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-3 text-xs text-slate-600 max-h-72 overflow-y-auto pr-2">
              <h4 className="font-bold text-slate-900">1. Protection des données personnelles</h4>
              <p>
                Conformément à la réglementation sur la protection des données (RGPD et lois locales), LuminaRH garantit la confidentialité de vos données de pointeur, de congés et de paie.
              </p>

              <h4 className="font-bold text-slate-900 pt-2">2. Utilisation du service</h4>
              <p>
                Le présent portail est exclusivement réservé aux collaborateurs et gestionnaires RH autorisés. Toute tentative d'accès non autorisée fait l'objet d'un journal d'audit de sécurité.
              </p>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button onClick={onClose} className="text-xs px-5 py-2">
                  J'ai compris
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
