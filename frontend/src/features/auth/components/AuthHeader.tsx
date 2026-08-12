import { Headphones, Globe, ChevronDown } from 'lucide-react';
import { LuminaLogo } from '@/components/ui/LuminaLogo';

export function AuthHeader() {
  return (
    <div className="flex items-center justify-between w-full">
      {/* Mobile Logo (Visible only on small screens < lg) */}
      <div className="lg:hidden">
        <LuminaLogo variant="horizontal" size="sm" />
      </div>

      {/* Spacer for desktop */}
      <div className="hidden lg:block" />

      {/* Top Right Controls */}
      <div className="flex items-center gap-6 text-xs font-semibold text-slate-600 ml-auto">
        <a 
          href="#help" 
          className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
        >
          <Headphones size={15} className="text-slate-400" />
          <span>Centre d'aide</span>
        </a>

        <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
          <Globe size={15} className="text-slate-400" />
          <span>Français</span>
          <ChevronDown size={13} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}
