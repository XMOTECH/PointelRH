import { useState, useRef, useEffect } from 'react';
import { Mail, Lock, ArrowRight, LifeBuoy } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoginLayout } from './LoginLayout';
import { useGoogleLogin } from '../hooks/useGoogleLogin';

interface EmployeeLoginProps {
  onLogin: (email: string, pass: string) => void;
  onGoogleLogin: (idToken: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function EmployeeLogin({ onLogin, onGoogleLogin, isLoading, error }: EmployeeLoginProps) {
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
      <div className="mb-20">
        <h2 className="text-3xl font-bold tracking-tighter">Pointel</h2>
      </div>

      <div className="space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
          L'Excellence Opérationnelle au service de vos talents.
        </h1>
        <p className="text-lg text-white/80 max-w-md leading-relaxed">
          Simplifiez la gestion de vos ressources humaines avec une interface conçue pour la précision et l'efficacité.
        </p>
      </div>

      <div className="mt-auto flex items-center gap-4 pt-12">
        <div className="flex -space-x-3">
          <img
            src="/antigravity/brain/bd768e35-4931-4be1-b494-aa68dee416a2/employee_avatars_1774438068618.png"
            alt="Employés"
            className="w-24 h-10 object-cover rounded-full border-2 border-white shadow-sm"
          />
        </div>
        <p className="text-sm font-medium text-white/90">
          + de 500 entreprises nous font confiance
        </p>
      </div>
    </>
  );

  return (
    <LoginLayout leftContent={LeftContent} leftBgClass="bg-[#0041c8]">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bon retour</h2>
        <p className="text-gray-500">Veuillez entrer vos identifiants pour accéder à votre tableau de bord.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Email Professionnel</label>
          <div className="relative group">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="nom@entreprise.com"
              className="pl-11 h-14 bg-gray-50 border-gray-200 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Mot de passe</label>
          </div>
          <div className="relative group">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-11 h-14 bg-gray-50 border-gray-200 focus:bg-white transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary/20" />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Se souvenir de moi</span>
          </label>
          <a href="#" className="text-sm font-bold text-primary hover:underline underline-offset-4">
            Mot de passe oublié ?
          </a>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2"
          isLoading={isLoading}
        >
          Connexion <ArrowRight size={20} />
        </Button>
      </form>

      <div className="mt-12 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 tracking-widest font-bold">Ou continuer avec</span>
          </div>
        </div>

        <div ref={googleBtnRef} className="flex justify-center" />

        <button className="w-full py-4 flex items-center justify-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold group">
          <LifeBuoy size={20} className="group-hover:rotate-12 transition-transform" />
          Support Technique
        </button>
      </div>
    </LoginLayout>
  );
}
