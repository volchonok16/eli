import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/shared/contexts';
import { useLogin } from './hooks/useLogin';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/profile', { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if ('user' in data && data.user) {
            login(data.token, data.user);
          }
          navigate('/profile');
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Ошибка входа');
        },
      },
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="font-display text-4xl text-primary text-center mb-2">Вход</h1>
        <p className="text-text-muted text-center mb-8">Войдите в личный кабинет</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-error text-sm bg-error/5 border border-error/20 p-3">{error}</p>}

          <div>
            <label htmlFor="login-email" className="block text-sm text-text-muted mb-1">Email</label>
            <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm text-text-muted mb-1">Пароль</label>
            <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          </div>

          <button type="submit" disabled={loginMutation.isPending} className="btn-primary w-full">
            {loginMutation.isPending ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-accent hover:text-accent-light transition-colors">Зарегистрироваться</Link>
        </p>
      </motion.div>
    </div>
  );
};
