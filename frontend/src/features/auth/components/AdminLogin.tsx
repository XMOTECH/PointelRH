import { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoginLayout } from './LoginLayout';
import { GoogleKeycloakButton } from './GoogleKeycloakButton';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => void;
  onGoogleLogin: (idToken: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AdminLogin({ onLogin, isLoading, error }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <LoginLayout 
      roleBadge="Administrateur" 
      title="Console d'Administration LuminaRH"
      subtitle="Espace réservé aux administrateurs système et RH."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Adresse Email Administrateur
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="email"
              placeholder="admin@entreprise.com"
              className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mot de passe
            </label>
            <a href="#forgot" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="password"
              placeholder="••••••••"
              className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          isLoading={isLoading}
        >
          <span>Accéder à la console</span>
          <ArrowRight size={18} />
        </Button>
      </form>

      <div className="space-y-4 pt-2">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80"></div>
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">Ou continuez avec</span>
          </div>
        </div>

        <GoogleKeycloakButton />
      </div>
    </LoginLayout>
  );
}
