import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';

type Tab = 'personal' | 'delivery' | 'orders';

export function Cabinet() {
  const { user, loading, signOut } = useAuth();
  const [params, setParams] = useSearchParams();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="w-full bg-white pt-[60px] flex items-center justify-center min-h-[400px]">Loading...</div>;
  }

  const initial: Tab =
    params.get('tab') === 'delivery'
      ? 'delivery'
      : params.get('tab') === 'orders'
      ? 'orders'
      : 'personal';
  const [tab, setTab] = useState<Tab>(initial);

  useEffect(() => {
    if (tab !== params.get('tab')) {
      const next = new URLSearchParams(params);
      if (tab === 'personal') next.delete('tab');
      else next.set('tab', tab);
      setParams(next, { replace: true });
    }
  }, [tab, params, setParams]);

  return (
    <div className="w-full bg-white pt-[60px]">
      {/* Hero */}
      <section className="w-full border-b border-[#EEEEEE]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-20 flex flex-col gap-6 md:gap-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] leading-[16px] tracking-[0.2em] uppercase text-[#808080]">
                Welcome back
              </span>
              <h1 className="text-[40px] md:text-[80px] leading-[40px] md:leading-[80px] tracking-[0.02em] text-[#303030]">
                My account
              </h1>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-[#808080] hover:text-[#303030] transition-colors h-10"
            >
              <LogOut size={16} strokeWidth={1.25} />
              Sign out
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#EEEEEE] self-start gap-6 md:gap-10 overflow-x-auto">
            {(
              [
                { key: 'personal' as Tab, label: 'Personal information' },
                { key: 'delivery' as Tab, label: 'Payment and delivery' },
                { key: 'orders' as Tab, label: 'Order history' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`pb-4 text-[14px] tracking-[0.02em] whitespace-nowrap transition-colors border-b-2 ${
                  tab === key
                    ? 'border-[#303030] text-[#303030]'
                    : 'border-transparent text-[#808080] hover:text-[#303030]'
                }`}
              >
                {label}
              </button>
            ))}
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
      {/* Left column - Account info */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-[#303030]">Account information</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] tracking-[0.15em] uppercase text-[#808080]">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 px-4 border border-[#EEEEEE] text-[14px] text-[#303030] outline-none focus:border-[#303030] transition-colors"
              placeholder="Alexander Goodveen"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] tracking-[0.15em] uppercase text-[#808080]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-4 border border-[#EEEEEE] text-[14px] text-[#303030] outline-none focus:border-[#303030] transition-colors"
              placeholder="alexander@goodveen.com"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] tracking-[0.15em] uppercase text-[#808080]">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 px-4 border border-[#EEEEEE] text-[14px] text-[#303030] outline-none focus:border-[#303030] transition-colors"
              placeholder="+998 90 123 45 67"
            />
          </div>
          <button className="h-12 mt-2 px-10 bg-[#303030] text-white text-[12px] tracking-[0.2em] uppercase hover:bg-[#404040] transition-colors self-start">
            Save changes
          </button>
        </div>
      </div>

      {/* Right column - Change password */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-[#303030]">Change password</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] tracking-[0.15em] uppercase text-[#808080]">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 px-4 border border-[#EEEEEE] text-[14px] text-[#303030] outline-none focus:border-[#303030] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] tracking-[0.15em] uppercase text-[#808080]">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 px-4 border border-[#EEEEEE] text-[14px] text-[#303030] outline-none focus:border-[#303030] transition-colors"
              placeholder="Minimum 6 characters"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] tracking-[0.15em] uppercase text-[#808080]">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12 px-4 border border-[#EEEEEE] text-[14px] text-[#303030] outline-none focus:border-[#303030] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button className="h-12 mt-2 px-10 bg-[#303030] text-white text-[12px] tracking-[0.2em] uppercase hover:bg-[#404040] transition-colors self-start">
            Update password
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============= PAYMENT AND DELIVERY ============= */
function DeliveryTab() {
  const [addresses] = useState([
    {
      id: '1',
      label: 'Home',
      address: 'Tashkent, Chilonzor district, Lutfiy street 16, apt 58',
      isDefault: true,
    },
    {
      id: '2',
      label: 'Work',
      address: 'Tashkent, Mirobod, Amir Temur shoh kochasi 12, apt 4',
      isDefault: false,
    },
  ]);

  return (
    <div className="max-w-[800px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-[#303030]">Saved addresses</h2>
        <button className="h-10 px-6 border border-[#303030] text-[12px] tracking-[0.2em] uppercase text-[#303030] hover:bg-[#303030] hover:text-white transition-colors">
          Add new
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-5 border border-[#EEEEEE] flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-medium text-[#303030]">{addr.label}</span>
                {addr.isDefault && (
                  <span className="px-2 py-1 bg-[#F6F6F6] text-[10px] tracking-[0.15em] uppercase text-[#808080]">
                    Default
                  </span>
                )}
              </div>
              <p className="text-[14px] text-[#808080]">{addr.address}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-[12px] tracking-[0.15em] uppercase text-[#808080] hover:text-[#303030] transition-colors">
                Edit
              </button>
              <button className="text-[12px] tracking-[0.15em] uppercase text-[#808080] hover:text-red-500 transition-colors">
                Delete
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
      date: '28 April 2026, 11:02',
      status: 'On the way',
      total: 1560,
      items: [
        {
          name: 'Wild Serenity',
          size: 'L',
          qty: 1,
          price: 780,
          img: 'https://images.unsplash.com/photo-1549007628-9418af83b544?q=80&w=400&auto=format&fit=crop',
        },
        {
          name: 'Urban Poetry',
          size: 'M',
          qty: 2,
          price: 390,
          img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'GV-2025-1011',
      date: '11 October 2025, 14:57',
      status: 'Delivered',
      total: 600,
      items: [
        {
          name: 'Crimson Heart',
          size: 'L',
          qty: 1,
          price: 600,
          img: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=400&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'GV-2025-1004',
      date: '4 October 2025, 14:57',
      status: 'Cancelled',
      total: 450,
      items: [],
    },
  ]);

  return (
    <div className="max-w-[1000px]">
      <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-[#303030] mb-6">Your orders</h2>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-[#EEEEEE]">
            {/* Order header */}
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full p-5 flex items-center justify-between gap-4 hover:bg-[#F6F6F6] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-left">
                <span className="text-[14px] font-medium text-[#303030]">{order.id}</span>
                <span className="text-[12px] text-[#808080]">{order.date}</span>
                <span
                  className={`text-[12px] tracking-[0.15em] uppercase ${
                    order.status === 'On the way'
                      ? 'text-blue-600'
                      : order.status === 'Delivered'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[16px] font-medium text-[#303030]">{order.total} UZS</span>
                <ChevronDown
                  size={20}
                  strokeWidth={1.25}
                  className={`text-[#808080] transition-transform ${
                    expandedOrder === order.id ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Order details */}
            {expandedOrder === order.id && order.items.length > 0 && (
              <div className="border-t border-[#EEEEEE] p-5 bg-[#FAFAFA]">
                <div className="flex flex-col gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-16 h-16 object-cover bg-[#F6F6F6]"
                      />
                      <div className="flex-1">
                        <p className="text-[14px] text-[#303030]">{item.name}</p>
                        <p className="text-[12px] text-[#808080]">
                          Size: {item.size} · Qty: {item.qty}
                        </p>
                      </div>
                      <span className="text-[14px] text-[#303030]">{item.price * item.qty} UZS</span>
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
