import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { authApi } from '../lib/api';

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Goodveen - Восстановление пароля';
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Отсутствует токен восстановления');
      return;
    }
    if (newPassword.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err?.message || 'Ошибка сброса пароля. Возможно, ссылка устарела.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white">
        <div className="max-w-md w-full flex flex-col gap-6 text-center">
          <h1 className="text-[32px] md:text-[48px] leading-tight text-brand-gray">
            Неверная ссылка
          </h1>
          <p className="text-[14px] text-brand-gray-light">
            Ссылка для восстановления пароля недействительна. Пожалуйста, запросите новую.
          </p>
          <Link
            to="/"
            className="h-12 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-white">
        <div className="max-w-md w-full flex flex-col gap-6 items-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-gray flex items-center justify-center">
            <Check size={32} strokeWidth={1.5} className="text-white" />
          </div>
          <h1 className="text-[32px] md:text-[48px] leading-tight text-brand-gray">
            Пароль изменён
          </h1>
          <p className="text-[14px] text-brand-gray-light">
            Ваш пароль успешно изменён. Сейчас вы будете перенаправлены на главную страницу.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-white">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-[32px] md:text-[48px] leading-tight text-brand-gray">
            Новый пароль
          </h1>
          <p className="text-[14px] text-brand-gray-light">
            Введите новый пароль для вашего аккаунта Goodveen.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col justify-center px-4 py-2 gap-1 h-14 bg-white border border-brand-border">
              <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
                Новый пароль
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError(null);
                }}
                className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
                placeholder="Минимум 6 символов"
                required
              />
            </div>

            <div className="flex flex-col justify-center px-4 py-2 gap-1 h-14 bg-white border border-brand-border">
              <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
                Повторите пароль
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 mt-2 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Сохранение…' : 'Сохранить пароль'}
            {!loading && <ArrowRight size={16} strokeWidth={1.25} />}
          </button>
        </form>

        <p className="text-[12px] text-brand-gray-light text-center">
          <Link to="/" className="text-brand-gray underline hover:no-underline">
            Вернуться на главную
          </Link>
        </p>
      </div>
    </div>
  );
}
