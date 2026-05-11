import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X, Eye, EyeOff, Check, Mail } from 'lucide-react';
import { useAuthUI, useAuth } from './AuthContext';
import { authApi } from '../../lib/api';

export function AuthPopup() {
  const { mode, close, setMode } = useAuthUI();
  if (!mode) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start md:items-center justify-center bg-black/60 backdrop-blur-[2px] overflow-y-auto py-10 md:py-16 px-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[480px] md:max-w-[520px] bg-white text-brand-gray shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col mt-[60px] md:mt-0"
      >
        <button
          onClick={close}
          aria-label="Close"
          className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center text-brand-gray-light hover:text-brand-gray transition-colors z-10"
        >
          <X size={22} strokeWidth={1.25} />
        </button>

        <div className="px-6 md:px-10 pt-12 md:pt-14 pb-8 md:pb-10 flex flex-col gap-8">
          {mode === 'login' && <LoginView onSwitch={setMode} />}
          {mode === 'register' && <RegisterView onSwitch={setMode} />}
          {mode === 'password-reset' && <ResetView onSwitch={setMode} />}
        </div>
      </div>
    </div>
  );
}

/* ===== LOGIN ===== */
function LoginView({ onSwitch }: { onSwitch: (m: 'register' | 'password-reset') => void }) {
  const { close } = useAuthUI();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Введите корректный email');
    if (password.length < 6) return setError('Пароль должен быть не менее 6 символов');
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      close();
    } catch (e: any) {
      if (e.status === 401 || e.status === 409) {
        setError('Неверный email или пароль');
      } else {
        setError('Ошибка входа. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        eyebrow="С возвращением"
        title="Вход"
        subtitle="Войдите, чтобы сохранить избранные букеты, адреса и историю заказов."
      />
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field
          label="Email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError(null);
          }}
          placeholder="alexander@goodveen.com"
          type="email"
        />
        <Field
          label="Пароль"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError(null);
          }}
          placeholder="••••••••"
          type={showPwd ? 'text' : 'password'}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="text-brand-gray-light hover:text-brand-gray transition-colors"
            >
              {showPwd ? <EyeOff size={16} strokeWidth={1.25} /> : <Eye size={16} strokeWidth={1.25} />}
            </button>
          }
        />
        {error && <p className="text-[12px] text-brand-taupe">{error}</p>}

        <div className="flex items-center justify-between gap-3 pt-1">
          <Checkbox checked={remember} onChange={setRemember} label="Запомнить меня" />
          <button
            type="button"
            onClick={() => onSwitch('password-reset')}
            className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors"
          >
            Забыли?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-12 mt-3 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Вход...' : 'Войти'}
          <ArrowRight size={16} strokeWidth={1.25} />
        </button>
      </form>

      <Footer>
        Впервые в Goodveen?{' '}
        <button
          onClick={() => onSwitch('register')}
          className="text-brand-gray underline hover:no-underline"
        >
          Создать аккаунт
        </button>
      </Footer>
    </>
  );
}

/* ===== REGISTER ===== */
function RegisterView({ onSwitch }: { onSwitch: (m: 'login') => void }) {
  const { close } = useAuthUI();
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) return setError('Введите ваше имя');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Введите корректный email');
    if (password.length < 6) return setError('Пароль должен быть не менее 6 символов');
    if (!agreed) return setError('Примите условия использования');
    setError(null);
    setLoading(true);
    try {
      await authApi.register(email, password, name);
      await signIn(email, password);
      close();
    } catch (e: any) {
      if (e.status === 409) {
        setError('Этот email уже зарегистрирован');
      } else {
        setError('Ошибка регистрации. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header
        eyebrow="Присоединяйтесь к студии"
        title="Создать аккаунт"
        subtitle="Сохраните свои данные, отслеживайте заказы и получайте бонусы с первого букета."
      />
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field
          label="Ваше имя"
          value={name}
          onChange={(v) => {
            setName(v);
            setError(null);
          }}
          placeholder="Александр"
        />
        <Field
          label="Email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError(null);
          }}
          placeholder="alexander@goodveen.com"
          type="email"
        />
        <Field
          label="Пароль"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError(null);
          }}
          placeholder="Минимум 6 символов"
          type={showPwd ? 'text' : 'password'}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              className="text-brand-gray-light hover:text-brand-gray transition-colors"
            >
              {showPwd ? <EyeOff size={16} strokeWidth={1.25} /> : <Eye size={16} strokeWidth={1.25} />}
            </button>
          }
        />
        {error && <p className="text-[12px] text-brand-taupe">{error}</p>}

        <Checkbox
          checked={agreed}
          onChange={setAgreed}
          label={
            <span>
              Я согласен с{' '}
              <Link to="/terms" className="text-brand-gray underline hover:no-underline">
                условиями
              </Link>{' '}
              и{' '}
              <Link to="/privacy" className="text-brand-gray underline hover:no-underline">
                политикой конфиденциальности
              </Link>
              .
            </span>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="h-12 mt-3 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Создание...' : 'Создать аккаунт'}
          <ArrowRight size={16} strokeWidth={1.25} />
        </button>
      </form>

      <Footer>
        Уже есть аккаунт?{' '}
        <button
          onClick={() => onSwitch('login')}
          className="text-brand-gray underline hover:no-underline"
        >
          Войти
        </button>
      </Footer>
    </>
  );
}

/* ===== PASSWORD RESET ===== */
function ResetView({ onSwitch }: { onSwitch: (m: 'login') => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Введите корректный email');
    setError(null);
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setSent(true);
    } catch {
      setError('Ошибка отправки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand-gray flex items-center justify-center self-start">
          <Mail size={24} strokeWidth={1.25} className="text-white" />
        </div>
        <Header
          eyebrow="Проверьте почту"
          title="Ссылка отправлена"
          subtitle={`Мы отправили ссылку для восстановления на ${email}. Перейдите по ней в течение 30 минут, чтобы установить новый пароль.`}
        />
        <button
          onClick={() => onSwitch('login')}
          className="h-12 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors"
        >
          Вернуться ко входу
        </button>
        <Footer>
          Не получили письмо?{' '}
          <button
            onClick={() => setSent(false)}
            className="text-brand-gray underline hover:no-underline"
          >
            Попробовать другой адрес
          </button>
        </Footer>
      </>
    );
  }

  return (
    <>
      <Header
        eyebrow="Забыли пароль?"
        title="Восстановить"
        subtitle="Введите email, привязанный к вашему аккаунту Goodveen, и мы отправим вам ссылку для восстановления."
      />
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field
          label="Email"
          value={email}
          onChange={(v) => {
            setEmail(v);
            setError(null);
          }}
          placeholder="alexander@goodveen.com"
          type="email"
        />
        {error && <p className="text-[12px] text-brand-taupe">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="h-12 mt-3 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Отправка…' : 'Отправить ссылку'}
          {!loading && <ArrowRight size={16} strokeWidth={1.25} />}
        </button>
      </form>

      <Footer>
        Вспомнили пароль?{' '}
        <button
          onClick={() => onSwitch('login')}
          className="text-brand-gray underline hover:no-underline"
        >
          Войти
        </button>
      </Footer>
    </>
  );
}

/* ===== Helpers ===== */

interface HeaderBlockProps { eyebrow: string; title: string; subtitle: string }
function Header({ eyebrow, title, subtitle }: HeaderBlockProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
        {eyebrow}
      </span>
      <h2 className="text-[32px] md:text-[40px] leading-[1.05] tracking-[0.01em] font-light text-brand-gray">
        {title}
      </h2>
      <p className="text-[13px] md:text-[14px] leading-[20px] md:leading-[22px] text-brand-gray-light">
        {subtitle}
      </p>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  rightIcon?: ReactNode;
}
function Field({ label, value, onChange, placeholder, type = 'text', rightIcon }: FieldProps) {
  return (
    <label className="w-full px-4 pt-3 pb-3 border border-brand-border bg-white flex items-stretch focus-within:border-brand-gray transition-colors">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full outline-none text-[14px] text-brand-gray bg-transparent placeholder:text-brand-gray-light/60"
        />
      </div>
      {rightIcon && <div className="flex items-center pl-3 shrink-0">{rightIcon}</div>}
    </label>
  );
}

interface CheckboxProps { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }
function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <span
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 mt-0.5 border flex items-center justify-center shrink-0 ${
          checked ? 'bg-brand-gray border-brand-gray' : 'border-brand-border'
        }`}
      >
        {checked && <Check size={14} strokeWidth={2} className="text-white" />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-[12px] leading-[16px] text-brand-gray-light">{label}</span>
    </label>
  );
}

function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] tracking-[0.25em] uppercase text-brand-gray-light">
      <span className="flex-1 h-px bg-brand-border" />
      <span>{children}</span>
      <span className="flex-1 h-px bg-brand-border" />
    </div>
  );
}

function SocialRow() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {['Google', 'Apple', 'Telegram'].map((p) => (
        <button
          key={p}
          className="h-11 border border-brand-border text-[12px] tracking-[0.15em] uppercase text-brand-gray hover:bg-brand-border/40 transition-colors"
        >
          {p}
        </button>
      ))}
    </div>
  );
}

function Footer({ children }: { children: ReactNode }) {
  return (
    <div className="text-center text-[12px] text-brand-gray-light">{children}</div>
  );
}
