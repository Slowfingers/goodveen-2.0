import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';
import { authApi, ordersApi } from '../lib/api';
import { ApiError } from '../lib/api/client';
import type { Order } from '../lib/api/types';

type Tab = 'personal' | 'delivery' | 'orders';

export function Cabinet() {
  const { user, loading, signOut, refreshUser } = useAuth();
  const [params, setParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initialTab: Tab =
    params.get('tab') === 'delivery'
      ? 'delivery'
      : params.get('tab') === 'orders'
      ? 'orders'
      : 'personal';
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    document.title = 'Goodveen - Личный кабинет';
  }, []);

  useEffect(() => {
    if (tab !== params.get('tab')) {
      const next = new URLSearchParams(params);
      if (tab === 'personal') next.delete('tab');
      else next.set('tab', tab);
      setParams(next, { replace: true });
    }
  }, [tab, params, setParams]);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="w-full bg-white pt-[60px] flex items-center justify-center min-h-[400px]">Загрузка...</div>;
  }

  const tabLabels = {
    personal: 'Личная информация',
    delivery: 'Оплата и доставка',
    orders: 'История заказов',
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section with Background */}
      <section className="relative w-full h-[680px] md:h-[680px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1487070183336-b863922373d4?q=80&w=1600&auto=format&fit=crop)',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
        <div className="absolute bottom-0 left-0 right-0 h-[320px] bg-gradient-to-b from-transparent to-black/40" style={{ backdropFilter: 'blur(10px)' }} />

        {/* Header Content */}
        <div className="absolute bottom-0 left-0 right-0 px-5 md:px-10 pb-10 md:pb-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col gap-5 md:gap-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-[48px] md:text-[80px] leading-[48px] md:leading-[80px] tracking-[0.02em] text-white">
                  Личный кабинет
                </h1>
                <p className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-white hidden md:block">
                  Ваша личная информация, пароль, адрес доставки и история заказов
                </p>
              </div>

              {/* Desktop: Filter-style Tab Buttons */}
              <div className="hidden md:flex gap-0">
                {(['personal', 'delivery', 'orders'] as Tab[]).map((key, idx) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`h-[68px] px-5 flex items-center justify-center text-[12px] tracking-[0.2em] uppercase transition-colors border border-white/20 ${
                      idx > 0 ? '-ml-px' : ''
                    } ${
                      tab === key
                        ? 'bg-white/24 text-white'
                        : 'bg-black/12 text-white hover:bg-white/10'
                    }`}
                    style={{ minWidth: '200px' }}
                  >
                    {tabLabels[key]}
                  </button>
                ))}
              </div>

              {/* Mobile: Single Button with Dropdown */}
              <div className="md:hidden relative">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-full h-[40px] px-3 flex items-center justify-between text-[12px] tracking-[0.2em] uppercase bg-black/12 border border-white/20 text-white"
                >
                  <span>{tabLabels[tab]}</span>
                  <ChevronDown size={20} className={`transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-5 bg-white shadow-[0_40px_80px_rgba(0,0,0,0.32)] z-50">
                    <div className="p-5 flex flex-col gap-5">
                      {(['personal', 'delivery', 'orders'] as Tab[]).map((key) => (
                        <button
                          key={key}
                          onClick={() => {
                            setTab(key);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-3 text-left"
                        >
                          <Check size={16} className={`text-brand-gray ${tab === key ? 'opacity-100' : 'opacity-0'}`} />
                          <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray flex-1">
                            {tabLabels[key]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-20">
        {tab === 'personal' && <PersonalTab user={user!} onRefresh={refreshUser} />}
        {tab === 'delivery' && <DeliveryTab />}
        {tab === 'orders' && <OrdersTab />}
      </section>
    </div>
  );
}

/* ============= PERSONAL INFORMATION ============= */
function PersonalTab({ user, onRefresh }: { user: any; onRefresh: () => Promise<void> }) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [nameFocused, setNameFocused] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await authApi.updateProfile({ name: name.trim() || undefined, phone: phone.trim() || null });
      await onRefresh();
      setProfileMsg({ ok: true, text: 'Изменения сохранены' });
    } catch {
      setProfileMsg({ ok: false, text: 'Ошибка сохранения. Попробуйте позже.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: 'Пароли не совпадают' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ ok: false, text: 'Новый пароль должен быть не менее 6 символов' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg({ ok: true, text: 'Пароль успешно изменён' });
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 401) {
        setPwMsg({ ok: false, text: 'Неверный текущий пароль' });
      } else {
        setPwMsg({ ok: false, text: 'Ошибка смены пароля. Попробуйте позже.' });
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20">
      {/* Left column - Account info */}
      <div className="flex flex-col gap-5">
        <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray">
          Личная информация
        </h2>
        <div className="flex flex-col gap-3">
          {/* Name Field */}
          <div
            className={`flex flex-col justify-center px-4 py-[10px] pb-[6px] gap-1 h-14 bg-white border transition-colors ${
              nameFocused || name ? 'border-brand-gray' : 'border-brand-border'
            }`}
          >
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Ваше имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              className="flex-1 text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="Александр"
            />
          </div>

          {/* Phone Field */}
          <div className="flex flex-col justify-center px-4 py-[10px] pb-[6px] gap-1 h-14 bg-brand-border">
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Номер телефона
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="+998 90 123 45 67"
            />
          </div>

          {/* Email Field (read-only) */}
          <div className="flex flex-col justify-center px-4 py-[10px] pb-[6px] gap-1 h-14 bg-white border border-brand-border opacity-60">
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Email
            </label>
            <span className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray">
              {user.email}
            </span>
          </div>

          {profileMsg && (
            <p className={`text-[12px] ${profileMsg.ok ? 'text-emerald-700' : 'text-red-600'}`}>
              {profileMsg.text}
            </p>
          )}

          <button
            onClick={saveProfile}
            disabled={profileSaving}
            className="h-14 px-10 mt-3 bg-brand-gray text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase hover:bg-black transition-colors self-start disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileSaving ? 'Сохранение…' : 'Сохранить изменения'}
          </button>
        </div>
      </div>

      {/* Right column - Change password */}
      <div className="flex flex-col gap-5">
        <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray">
          Смена пароля
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col justify-center px-4 py-2 pb-[6px] gap-1 h-14 bg-white border border-brand-border">
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Текущий пароль
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setPwMsg(null); }}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col justify-center px-4 py-2 gap-1 h-14 bg-white border border-brand-border">
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Новый пароль
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPwMsg(null); }}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="Минимум 6 символов"
            />
          </div>

          <div className="flex flex-col justify-center px-4 py-2 gap-1 h-14 bg-white border border-brand-border">
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Повторите новый пароль
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPwMsg(null); }}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="••••••••"
            />
          </div>

          {pwMsg && (
            <p className={`text-[12px] ${pwMsg.ok ? 'text-emerald-700' : 'text-red-600'}`}>
              {pwMsg.text}
            </p>
          )}

          <button
            onClick={changePassword}
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            className={`h-14 px-10 mt-3 text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase transition-colors self-start ${
              currentPassword && newPassword && confirmPassword && !pwSaving
                ? 'bg-brand-gray hover:bg-black'
                : 'bg-brand-border cursor-not-allowed'
            }`}
          >
            {pwSaving ? 'Сохранение…' : 'Сменить пароль'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============= PAYMENT AND DELIVERY ============= */
function DeliveryTab() {
  return (
    <div className="max-w-[800px]">
      <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray mb-6">
        Оплата и доставка
      </h2>
      <p className="text-[14px] text-brand-gray-light leading-[22px]">
        Адреса доставки сохраняются автоматически при оформлении заказа. История ваших адресов будет отображаться здесь в ближайшем обновлении.
      </p>
    </div>
  );
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  DELIVERING: 'В пути',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-600',
  CONFIRMED: 'text-blue-600',
  PROCESSING: 'text-blue-600',
  DELIVERING: 'text-blue-600',
  DELIVERED: 'text-emerald-600',
  CANCELLED: 'text-red-600',
};

/* ============= ORDER HISTORY ============= */
function OrdersTab() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    ordersApi.listMine()
      .then((data) => { if (active) setOrders(data); })
      .catch(() => { if (active) setError('Не удалось загрузить заказы.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1000px]">
        <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray mb-6">
          Ваши заказы
        </h2>
        <p className="text-[14px] text-brand-gray-light">Загрузка…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1000px]">
        <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray mb-6">
          Ваши заказы
        </h2>
        <p className="text-[13px] text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px]">
      <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray mb-6">
        Ваши заказы
      </h2>

      {orders.length === 0 && (
        <p className="text-[14px] text-brand-gray-light">У вас пока нет заказов.</p>
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-brand-border">
            {/* Order header */}
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 hover:bg-brand-border/30 transition-colors text-left"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[14px] font-medium text-brand-gray">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`text-[11px] md:text-[12px] tracking-[0.15em] uppercase ${
                      ORDER_STATUS_COLORS[order.status] ?? 'text-brand-gray-light'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <span className="text-[11px] md:text-[12px] text-brand-gray-light">
                  {new Date(order.createdAt).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-[15px] md:text-[16px] font-medium text-brand-gray">
                  {order.total.toLocaleString()} UZS
                </span>
                <ChevronDown
                  size={18}
                  strokeWidth={1.25}
                  className={`text-brand-gray-light transition-transform sm:ml-2 ${
                    expandedOrder === order.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Order details */}
            {expandedOrder === order.id && order.items && order.items.length > 0 && (
              <div className="border-t border-brand-border p-4 md:p-5 bg-brand-border/20">
                <div className="flex flex-col gap-3 md:gap-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 md:gap-4">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-brand-border flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] md:text-[14px] text-brand-gray truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] md:text-[12px] text-brand-gray-light">
                          Размер: {item.sizeName} · Кол-во: {item.quantity}
                        </p>
                      </div>
                      <span className="text-[13px] md:text-[14px] text-brand-gray whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString()} UZS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
