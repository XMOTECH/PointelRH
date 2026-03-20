import { useNavigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';

export function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = (role: string) => {
    if (role === 'employee') navigate('/clock-in');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-10">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-5 text-white font-extrabold text-2xl">
            P
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Content de vous revoir</h1>
          <p className="text-gray-500 text-sm">Accédez à votre espace Pointel RH</p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Propulsé par <span className="font-bold text-gray-900">Pointel Technology</span>
          </p>
        </div>
      </div>
    </div>
  );
}
