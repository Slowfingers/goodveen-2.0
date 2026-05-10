import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export function AdminLogin() {
  const { signIn, profile, loading, isAdmin } = useAdminAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (loading) return <FullScreenLoader />;
  if (profile && isAdmin) return <Navigate to={from} replace />;
  if (profile && !isAdmin) {
    return (
      <FullScreenMessage
        title="Доступ запрещён"
        body={`Аккаунт ${profile.email} не является администраторским.`}
      />
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      const e = err as any;
      if (e?.status === 401) {
        setError('Неверный email или пароль');
      } else if (e?.status === 403) {
        setError('Доступ запрещён');
      } else {
        setError('Ошибка входа. Попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white border border-[#EEE] p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <div className="text-[24px] tracking-[0.18em] uppercase text-[#303030]">Goodveen</div>
          <div className="text-[12px] tracking-[0.24em] uppercase text-[#808080] mt-1">
            Админ-панель
          </div>
        </div>

        <label className="block text-[12px] uppercase tracking-[0.18em] text-[#808080] mb-2">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-[#EEE] px-3 py-3 mb-5 text-[14px] focus:border-[#303030] outline-none"
        />

        <label className="block text-[12px] uppercase tracking-[0.18em] text-[#808080] mb-2">
          Пароль
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-[#EEE] px-3 py-3 mb-6 text-[14px] focus:border-[#303030] outline-none"
        />

        {error && (
          <div className="text-[12px] text-red-700 bg-red-50 border border-red-100 px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#303030] text-white py-3 text-[12px] tracking-[0.24em] uppercase disabled:opacity-60"
        >
          {submitting ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center text-[12px] tracking-[0.2em] uppercase text-[#808080]">
      Загрузка…
    </div>
  );
}

function FullScreenMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-[#F7F4EF] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-[20px] uppercase tracking-[0.18em] text-[#303030] mb-2">{title}</div>
      <div className="text-[14px] text-[#808080] max-w-md">{body}</div>
    </div>
  );
}
