import { useState, useRef, useEffect } from 'react';
import { Lock, ArrowRight, ShieldCheck, Terminal, Info } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoginLayout } from './LoginLayout';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

interface ManagerLoginProps {
  onLogin: (email: string, pass: string) => void;
  onGoogleLogin: (idToken: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ManagerLogin({ onLogin, onGoogleLogin, isLoading, error }: ManagerLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const { renderButton } = useGoogleLogin({
    onSuccess: onGoogleLogin,
  });

  useEffect(() => {
    renderButton(googleBtnRef.current);
  }, [renderButton]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const LeftContent = (
    <>
      <div className="mb-20 flex items-center gap-3">
        <ShieldCheck className="text-blue-300" size={32} strokeWidth={2.5} />
        <h2 className="text-2xl font-bold tracking-tight">Précision Opérationnelle</h2>
      </div>

      <div className="space-y-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-100">Passerelle Système</span>
        </div>

        <h1 className="text-6xl font-black leading-none tracking-tight">
          Console de Gestion de Département.
        </h1>

        <p className="text-xl text-blue-100/70 max-w-sm leading-relaxed font-medium">
          Accédez à l'environnement critique pour l'ID de Département : <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">OPS-4290-X</span>.
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-24 border-t border-white/10">
        <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-blue-200">
          <span>V 2.4.0</span>
          <div className="w-1 h-1 rounded-full bg-blue-400"></div>
          <span className="uppercase">Environnement Sécurisé</span>
        </div>
        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
          <Terminal size={20} className="text-blue-300" strokeWidth={3} />
        </div>
      </div>
    </>
  );

  return (
    <LoginLayout leftContent={LeftContent} leftBgClass="bg-[#0036a3]">
      <div className="mb-12">
        <p className="text-blue-600 font-black tracking-[0.3em] uppercase text-[10px] mb-4">Accès Manager</p>
        <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight leading-tight">Connexion à l'espace</h2>

        <div className="p-4 bg-blue-50/50 border-l-4 border-blue-600 rounded-r-2xl flex gap-4 items-center">
          <Info className="text-blue-600 flex-shrink-0" size={20} />
          <p className="text-gray-600 text-[13px] font-bold leading-relaxed">
            Authentifié pour le cluster de départements <span className="text-blue-700">Operational Services</span>.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Adresse Email</label>
            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">Requis</span>
          </div>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">@</div>
            <Input
              type="email"
              placeholder="nom@operational.precision"
              className="pl-12 h-16 bg-gray-50 border-gray-100 focus:border-blue-600 focus:bg-white transition-all text-base rounded-2xl font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mot de passe</label>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Chiffré</span>
          </div>
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input
              type="password"
              placeholder="••••••••••••"
              className="pl-12 h-16 bg-gray-50 border-gray-100 focus:border-blue-600 focus:bg-white transition-all text-base rounded-2xl font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="w-6 h-6 rounded-lg border-2 border-gray-200 group-hover:border-blue-200 flex items-center justify-center transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-600 scale-0 group-hover:scale-100 transition-transform"></div>
            </div>
            <span className="text-sm text-gray-400 font-bold group-hover:text-gray-600 transition-colors">Se souvenir de l'appareil</span>
          </label>
          <a href="#" className="text-xs font-black text-blue-600 hover:text-blue-700 tracking-tight flex items-center gap-2">
             Clé d'accès oubliée ?
          </a>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-pulse">
            <ShieldCheck size={18} />
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-16 text-base font-black tracking-widest rounded-2xl bg-blue-700 hover:bg-blue-800 shadow-xl shadow-blue-100 flex items-center justify-center gap-4 transition-all hover:gap-6 active:scale-95"
          isLoading={isLoading}
        >
          Initialiser la Session <ArrowRight size={22} strokeWidth={2.5} />
        </Button>
      </form>

      <div className="mt-10 pt-8 border-t border-gray-100 space-y-6">
        <div className="relative flex justify-center">
          <span className="bg-white px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] relative z-10">OU CONTINUER AVEC</span>
        </div>
        <div ref={googleBtnRef} className="flex justify-center" />
      </div>

      <div className="mt-16 pt-10 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-6">
          <a href="#" className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors">Protocole de Sécurité</a>
          <a href="#" className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] hover:text-gray-600 transition-colors">Confidentialité</a>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
           <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
           <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Serveur : Node-Alpha</span>
        </div>
      </div>
    </LoginLayout>
  );
}
