import { LuminaLogo } from '@/components/ui/LuminaLogo';
import { Check } from 'lucide-react';

export function AuthLeftSidebar() {
  const features = [
    "Jusqu'à 500 collaborateurs",
    "Historique complet de pointage & présences",
    "Calcul automatisé de la Paie & Acomptes sécurisé",
    "Traduction de la plateforme par IA",
    "Stockage cloud sécurisé des documents RH",
  ];

  // Services PointelRH avec émojis comme placeholders temporaires pour les futures icônes/logos
  const appDock = [
    { label: "Pointage", placeholder: "🕒" },
    { label: "Paie", placeholder: "💳" },
    { label: "Congés", placeholder: "🌴" },
    { label: "Employés", placeholder: "👥" },
    { label: "Planning", placeholder: "📅" },
    { label: "Kiosque", placeholder: "🖥️" },
  ];

  return (
    <div className="h-full flex flex-col justify-between z-10 relative">
      {/* Top-left Logo — Positioned at top corner */}
      <div className="pt-0 pb-1 -ml-1">
        <LuminaLogo variant="horizontal" size="lg" />
      </div>

      {/* Center Content — Vertically Centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 space-y-6 my-auto">
        {/* Main Headline */}
        <div className="space-y-1 pt-4">
          <h1 className="text-2xl xl:text-[1.75rem] font-extrabold text-slate-900 leading-snug">
            Adieu le chaos RH.
          </h1>
          <h1 className="text-2xl xl:text-[1.75rem] font-extrabold text-slate-900 leading-snug">
            Bonjour LuminaRH.
          </h1>
        </div>

        {/* Gradient Divider (Exact Lark Copy) */}
        <div className="w-full h-[1.5px] bg-gradient-to-r from-[#80B3FF] via-[#9B8CFF] to-[#D5A3FF] opacity-90 rounded-full my-3" />

        {/* Feature Description (Exact Lark Typography & Spacing) */}
        <div className="text-left w-full space-y-5 px-1">
          <div>
            <p className="text-[15px] leading-snug">
              <span className="font-extrabold text-[#5B50F6]">Planifiez gratuitement !</span>{' '}
              <span className="text-[#334155] font-normal">Pas de carte de crédit nécessaire</span>
            </p>
            <p className="text-[14px] text-[#475569] font-normal mt-1">
              Idéal pour les entreprises et les équipes explorant LuminaRH
            </p>
          </div>

          {/* Checklist */}
          <ul className="space-y-3.5 pt-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[14.5px] text-[#1E293B] font-normal leading-snug">
                <Check size={18} strokeWidth={3} className="text-[#16A34A] shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom App Dock (Exact Lark Style Cards with Service Names) */}
      <div className="pt-6 pb-2">
        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {appDock.map((app, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {/* App Icon Squircle Container (Emoji Placeholder) */}
              <div className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-[16px] bg-white border border-slate-100/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center justify-center text-xl sm:text-2xl">
                {app.placeholder}
              </div>
              {/* Service Label */}
              <span className="text-[11.5px] text-[#64748B] font-medium mt-2 tracking-tight text-center truncate max-w-full">
                {app.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
