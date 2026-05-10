import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';

type Tab = 'personal' | 'delivery' | 'orders';

export function Cabinet() {
  const { user, loading, signOut } = useAuth();
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
        {tab === 'personal' && <PersonalTab user={user!} />}
        {tab === 'delivery' && <DeliveryTab />}
        {tab === 'orders' && <OrdersTab />}
      </section>
    </div>
  );
}

/* ============= PERSONAL INFORMATION ============= */
function PersonalTab({ user }: { user: any }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

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
            <div className="flex items-center gap-0.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                className="flex-1 text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
                placeholder="Александр"
              />
              {name && <span className="w-px h-[15px] bg-brand-border" />}
            </div>
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

          {/* Email Field */}
          <div className="flex flex-col justify-center px-4 py-[10px] pb-[6px] gap-1 h-14 bg-white border border-brand-border">
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="alexander@samplemail.com"
            />
          </div>

          <button className="h-14 px-10 mt-3 bg-brand-gray text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase hover:bg-black transition-colors self-start">
            Сохранить изменения
          </button>
        </div>
      </div>

      {/* Right column - Change password */}
      <div className="flex flex-col gap-5 relative">
        <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray">
          Смена пароля
        </h2>
        <div className="flex flex-col gap-3">
          {/* Current Password Field */}
          <div
            className={`flex flex-col justify-center px-4 py-2 pb-[6px] gap-1 h-14 bg-white border ${
              passwordError ? 'border-brand-taupe' : 'border-brand-border'
            }`}
          >
            <label className="text-[12px] leading-[14px] tracking-[0.02em] text-brand-gray-light">
              Текущий пароль
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordError(false);
              }}
              onBlur={() => {
                if (currentPassword && currentPassword.length < 6) {
                  setPasswordError(true);
                }
              }}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* New Password Field */}
          <div className="flex flex-col justify-center px-4 py-2 gap-1 h-14 bg-white border border-brand-border">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="Новый пароль"
            />
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col justify-center px-4 py-2 gap-1 h-14 bg-white border border-brand-border">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
              placeholder="Повторите новый пароль"
            />
          </div>

          <button
            className={`h-14 px-10 mt-3 text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase transition-colors self-start ${
              currentPassword && newPassword && confirmPassword
                ? 'bg-brand-gray hover:bg-black'
                : 'bg-brand-border cursor-not-allowed'
            }`}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Сменить пароль
          </button>
        </div>

        {/* Error Tooltip */}
        {passwordError && (
          <div className="absolute left-[670px] top-[144px] hidden lg:flex items-center gap-2 px-4 py-2 bg-brand-taupe shadow-lg">
            <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-brand-taupe" />
            <span className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray whitespace-nowrap">
              Это поле обязательно
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============= PAYMENT AND DELIVERY ============= */
function DeliveryTab() {
  const [addresses] = useState([
    {
      id: '1',
      label: 'Дом',
      address: 'Ташкент, Чиланзарский район, улица Лутфий 16, кв. 58',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Работа',
      address: 'Ташкент, Мирабад, улица Амира Темура 12, кв. 4',
      isDefault: false,
    },
  ]);

  return (
    <div className="max-w-[800px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray">
          Сохранённые адреса
        </h2>
        <button className="h-10 px-6 border border-brand-gray text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:bg-brand-gray hover:text-white transition-colors self-start sm:self-auto">
          Добавить новый
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-4 md:p-5 border border-brand-border flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[14px] font-medium text-brand-gray">{addr.label}</span>
                {addr.isDefault && (
                  <span className="px-2 py-1 bg-brand-border text-[10px] tracking-[0.15em] uppercase text-brand-gray-light">
                    По умолчанию
                  </span>
                )}
              </div>
              <p className="text-[13px] md:text-[14px] text-brand-gray-light leading-[18px] md:leading-[20px]">{addr.address}</p>
            </div>
            <div className="flex gap-4 md:gap-2 md:flex-col lg:flex-row">
              <button className="text-[12px] tracking-[0.15em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors">
                Изменить
              </button>
              <button className="text-[12px] tracking-[0.15em] uppercase text-brand-gray-light hover:text-red-500 transition-colors">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============= ORDER HISTORY ============= */
function OrdersTab() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders] = useState([
    {
      id: 'GV-2026-0428',
      date: '28 апреля 2026, 11:02',
      status: 'В пути',
      total: 1560000,
      items: [
        {
          name: 'Дикая безмятежность',
          size: 'L',
          qty: 1,
          price: 780000,
          img: 'https://images.unsplash.com/photo-1549007628-9418af83b544?q=80&w=400&auto=format&fit=crop',
        },
        {
          name: 'Городская поэзия',
          size: 'M',
          qty: 2,
          price: 390000,
          img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'GV-2025-1011',
      date: '11 октября 2025, 14:57',
      status: 'Доставлен',
      total: 600000,
      items: [
        {
          name: 'Багровое сердце',
          size: 'L',
          qty: 1,
          price: 600000,
          img: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'GV-2025-1004',
      date: '4 октября 2025, 14:57',
      status: 'Отменён',
      total: 450000,
      items: [],
    },
  ]);

  return (
    <div className="max-w-[1000px]">
      <h2 className="text-[24px] md:text-[36px] leading-[32px] md:leading-[36px] tracking-[0.02em] text-brand-gray mb-6">
        Ваши заказы
      </h2>

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
                  <span className="text-[14px] font-medium text-brand-gray">{order.id}</span>
                  <span
                    className={`text-[11px] md:text-[12px] tracking-[0.15em] uppercase ${
                      order.status === 'В пути'
                        ? 'text-blue-600'
                        : order.status === 'Доставлен'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <span className="text-[11px] md:text-[12px] text-brand-gray-light">{order.date}</span>
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
            {expandedOrder === order.id && order.items.length > 0 && (
              <div className="border-t border-brand-border p-4 md:p-5 bg-brand-border/20">
                <div className="flex flex-col gap-3 md:gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 md:gap-4">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-14 h-14 md:w-16 md:h-16 object-cover bg-brand-border flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] md:text-[14px] text-brand-gray truncate">{item.name}</p>
                        <p className="text-[11px] md:text-[12px] text-brand-gray-light">
                          Размер: {item.size} · Кол-во: {item.qty}
                        </p>
                      </div>
                      <span className="text-[13px] md:text-[14px] text-brand-gray whitespace-nowrap">
                        {(item.price * item.qty).toLocaleString()} UZS
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
