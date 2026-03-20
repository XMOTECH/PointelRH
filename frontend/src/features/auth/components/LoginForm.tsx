import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

interface LoginFormProps {
  onSuccess: (role: string) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await login(email, password);
      onSuccess(user.role);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="relative">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          type="email"
          label="ADRESSE EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@entreprise.com"
          className="pl-10"
          required
        />
      </div>

      <div className="relative">
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-700 uppercase tracking-wide">
            Mot de passe
          </label>
          <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Oublié ?</a>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-10"
            required
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="w-full" isLoading={loading}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  );
}
