import React, { useState } from 'react';
import { AuthLeftSidebar } from './AuthLeftSidebar';
import { AuthHeader } from './AuthHeader';
import { AuthHelpModal, type HelpModalType } from './AuthHelpModal';

interface LoginLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  roleBadge?: string;
  onOpenForgotModal?: () => void;
}

export function LoginLayout({ children, title, subtitle }: LoginLayoutProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [modalType, setModalType] = useState<HelpModalType>(null);

  const handleOpenHelp = (e: React.MouseEvent, type: HelpModalType) => {
    e.preventDefault();
    setModalType(type);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans text-slate-800 antialiased">
      {/* Modal */}
      <AuthHelpModal type={modalType} onClose={() => setModalType(null)} />

      {/* LEFT COLUMN: Visual Branding & Value Proposition (Lark Style) */}
      <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-6 xl:p-10 pt-6 bg-gradient-to-b from-[#F0F5FF] via-[#F4F7FF] to-[#ECF0FF] border-r border-blue-100/50 relative overflow-hidden">
        {/* Soft Background Blur Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-300/30 rounded-full blur-3xl pointer-events-none" />

        <AuthLeftSidebar />
      </div>

      {/* RIGHT COLUMN: Authentication Form & Header */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-white min-h-screen relative overflow-y-auto">
        {/* Top Header Navigation */}
        <AuthHeader />

        {/* Form Container Center */}
        <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
          {/* Header Title & Subtitle */}
          <div className="space-y-2 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {title || "Saisissez votre e-mail professionnel"}
            </h2>
            <p className="text-sm text-slate-500">
              {subtitle || "Identifiez-vous pour accéder à vos outils et services RH."}
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>

          {/* Terms & Privacy Consent Checkbox (Lark Style) */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-500 leading-relaxed group">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
              />
              <span>
                J'ai lu et j'accepte les{' '}
                <button
                  type="button"
                  onClick={(e) => handleOpenHelp(e, 'terms')}
                  className="text-indigo-600 font-medium hover:underline text-left"
                >
                  Conditions d'utilisation
                </button>{' '}
                et la{' '}
                <button
                  type="button"
                  onClick={(e) => handleOpenHelp(e, 'terms')}
                  className="text-indigo-600 font-medium hover:underline text-left"
                >
                  Politique de confidentialité
                </button>.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="font-medium">
            © 2026 LUMINARH S.A. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <button
              onClick={(e) => handleOpenHelp(e, 'help')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Aide & Support
            </button>
            <button
              onClick={(e) => handleOpenHelp(e, 'terms')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Confidentialité
            </button>
            <button
              onClick={(e) => handleOpenHelp(e, 'terms')}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              CGU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
