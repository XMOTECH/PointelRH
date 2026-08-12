import { useNavigate } from 'react-router-dom';
import { User, Users, Shield, ArrowRight } from 'lucide-react';
import { LuminaLogo } from '@/components/ui/LuminaLogo';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#FAFCFF] to-[#F0F4F8] text-slate-800 font-sans">
      {/* Top Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-100">
        <LuminaLogo variant="horizontal" size="md" showTagline={true} />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">
          Portail d'Accès d'Entreprise
        </span>
      </header>

      {/* Main Gateway Selection */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-3xl w-full text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
            Bienvenue sur votre portail RH
          </h2>
          <p className="text-base text-slate-500 max-w-lg mx-auto font-medium">
            Veuillez sélectionner votre espace pour vous connecter et accéder à vos outils opérationnels.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* Card 1: Collaborateur */}
          <div
            onClick={() => navigate('/login')}
            className="flex flex-col justify-between p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                <User size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Espace Collaborateur</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Enregistrez vos pointages quotidiens (web ou reconnaissance faciale), suivez vos plannings, demandez des congés et soumettez des requêtes d'acompte.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
              Se connecter <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 2: Manager */}
          <div
            onClick={() => navigate('/login/manager')}
            className="flex flex-col justify-between p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Portail Manager</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Pilotez l'activité de vos équipes terrain, validez les feuilles de présence, approuvez les missions et coordonnez les plannings hebdomadaires.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
              Se connecter <ArrowRight size={16} />
            </div>
          </div>

          {/* Card 3: Admin */}
          <div
            onClick={() => navigate('/login/admin')}
            className="flex flex-col justify-between p-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Administration</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Gérez les configurations globales du système, les profils des employés, suivez les KPI d'entreprise, les exports de pré-paie et la validation des prêts.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
              Se connecter <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 text-xs text-slate-400">
        <p className="font-semibold">© 2026 LUMINARH S.A. TOUS DROITS RÉSERVÉS.</p>
        <div className="flex gap-6 mt-4 sm:mt-0 font-medium">
          <a href="#" className="hover:text-slate-600">Conditions d'Utilisation</a>
          <a href="#" className="hover:text-slate-600">Politique de Confidentialité</a>
          <a href="#" className="hover:text-slate-600">Support Technique</a>
        </div>
      </footer>
    </div>
  );
}
