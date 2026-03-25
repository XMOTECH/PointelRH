import { useState, useRef, useEffect } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoginLayout } from './LoginLayout';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => void;
  onGoogleLogin: (idToken: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AdminLogin({ onLogin, onGoogleLogin, isLoading, error }: AdminLoginProps) {
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
      <div className="mb-20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <div className="w-4 h-4 rounded-sm border-2 border-white"></div>
        </div>
        <h2 className="text-xl font-bold tracking-tight">Précision Opérationnelle</h2>
      </div>

      <div className="space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-[0.02em]">
          Maîtrisez votre écosystème RH.
        </h1>
        <p className="text-xl text-white/70 max-w-sm leading-relaxed">
          Conçu pour l'excellence, optimisé pour une efficacité sans faille.
        </p>
      </div>

      <div className="mt-auto pt-20">
        <div className="p-8 bg-white/10 rounded-2xl border border-white/10 space-y-6">
          <p className="text-lg italic font-medium leading-relaxed">
            "Pointel a transformé la façon dont nous gérons les missions de notre personnel sur trois continents."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-400"></div>
            <div>
              <p className="font-bold text-white">Marcus Thorne</p>
              <p className="text-sm text-white/60 uppercase tracking-widest font-bold">Directeur des Opérations</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <LoginLayout leftContent={LeftContent} leftBgClass="bg-[#0041c8]">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Bon retour</h2>
        <p className="text-gray-500 font-medium">Connectez-vous à votre tableau de bord administrateur</p>
      </div>

      {error ? (
        <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex gap-4 items-start">
          <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <p className="text-red-800 font-bold mb-1">Erreur d'authentification</p>
            <p className="text-red-600/90 text-sm leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      ) : (
         <div className="h-[2px] w-12 bg-gray-100 mb-10"></div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block ml-1">Adresse Email</label>
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input
              type="email"
              placeholder="admin@pointel.com"
              className="pl-12 h-16 bg-gray-50 border-gray-200 focus:bg-white transition-all text-base rounded-2xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mot de passe</label>
            <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 tracking-tight">Oublié ?</a>
          </div>
          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-12 h-16 bg-gray-50 border-gray-200 focus:bg-white transition-all text-base rounded-2xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-16 text-base font-black uppercase tracking-widest rounded-2xl bg-[#0041c8] hover:bg-[#0036a3] transition-all"
          isLoading={isLoading}
        >
          Accéder au tableau de bord
        </Button>
      </form>

      <div className="mt-12 pt-8 border-t border-gray-100 space-y-8">
        <div className="relative flex justify-center">
          <span className="bg-white px-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] relative z-10">OU CONTINUER AVEC</span>
        </div>

        <div ref={googleBtnRef} className="flex justify-center" />

        <div className="text-center pt-4">
          <p className="text-gray-400 text-sm font-medium">
            Nouveau sur l'atelier ? <a href="#" className="text-blue-600 font-bold hover:underline">Créer un compte</a>
          </p>
        </div>
      </div>

      <div className="mt-auto pt-16 flex items-center justify-center gap-6 opacity-30">
        <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-900 border-b border-transparent hover:border-gray-900 transition-colors h-4">Politique de confidentialité</a>
        <div className="w-1 h-1 rounded-full bg-gray-900"></div>
        <a href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-900 border-b border-transparent hover:border-gray-900 transition-colors h-4">Normes de sécurité</a>
        <div className="w-1 h-1 rounded-full bg-gray-900"></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 h-4 leading-relaxed">V2.4.0</span>
      </div>
    </LoginLayout>
  );
}
