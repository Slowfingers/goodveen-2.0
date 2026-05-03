import { useEffect, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  Box,
  LogOut,
  Truck,
  Check,
  ArrowRight,
  Package,
  Clock,
  MapPin,
  Plus,
  Home,
  Briefcase,
  Star,
} from 'lucide-react';

type Tab = 'profile' | 'orders' | 'addresses';

interface Address {
  id: string;
  label: string;
  icon: 'home' | 'work' | 'other';
  city: string;
  street: string;
  house: string;
  apt: string;
  isDefault: boolean;
}

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'home',
    label: 'Home',
    icon: 'home',
    city: 'Tashkent',
    street: 'Chilonzor district, Lutfiy street',
    house: '16',
    apt: '58',
    isDefault: true,
  },
  {
    id: 'studio',
    label: 'Atelier',
    icon: 'work',
    city: 'Tashkent',
    street: 'Mirobod, Amir Temur shoh ko‘chasi',
    house: '12',
    apt: '4',
    isDefault: false,
  },
];

const ORDERS = [
  {
    id: 'GV-2026-0428',
    date: '28 April 2026, 11:02',
    status: 'on-the-way' as const,
    total: 1560,
    items: [
      {
        id: 'wild-serenity',
        name: 'Wild Serenity',
        size: 'L',
        qty: 1,
        img: 'https://images.unsplash.com/photo-1549007628-9418af83b544?q=80&w=2400&auto=format&fit=crop',
      },
      {
        id: 'urban-poetry',
        name: 'Urban Poetry',
        size: 'M',
        qty: 2,
        img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2400&auto=format&fit=crop',
      },
    ],
    delivery: {
      method: 'Same-day courier',
      address: 'Tashkent, Mirobod 12, apt 4',
      eta: 'Today, 14:00 — 16:00',
      progress: 2, // 0..3
    },
  },
  {
    id: 'GV-2025-1011',
    date: '11 October 2025, 14:57',
    status: 'delivered' as const,
    total: 600,
    items: [
      {
        id: 'crimson-heart',
        name: 'Crimson Heart',
        size: 'L',
        qty: 1,
        img: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop',
      },
    ],
    delivery: {
      method: 'Pickup from atelier',
      address: 'Mirobod 12',
      eta: 'Picked up 11 Oct, 16:20',
      progress: 3,
    },
  },
  {
    id: 'GV-2025-1004',
    date: '4 October 2025, 14:57',
    status: 'cancelled' as const,
    total: 0,
    items: [],
    delivery: null,
  },
];

export function Cabinet() {
  const [params, setParams] = useSearchParams();
  const initial: Tab =
    params.get('tab') === 'orders'
      ? 'orders'
      : params.get('tab') === 'addresses'
      ? 'addresses'
      : 'profile';
  const [tab, setTab] = useState<Tab>(initial);

  useEffect(() => {
    // Sync URL when changing tab via UI
    if (tab !== params.get('tab')) {
      const next = new URLSearchParams(params);
      if (tab === 'profile') next.delete('tab');
      else next.set('tab', tab);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="w-full bg-white pt-[60px]">
      {/* Hero / heading */}
      <section className="w-full border-b border-brand-border">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-[80px] flex flex-col gap-6 md:gap-10">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                Welcome back
              </span>
              <h1 className="text-[40px] md:text-[80px] leading-none tracking-[0.01em] font-light text-brand-gray">
                My account
              </h1>
            </div>
            <button className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors h-10">
              Logout
              <LogOut size={16} strokeWidth={1.25} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-brand-border self-start gap-6 md:gap-10 overflow-x-auto">
            {(
              [
                { key: 'profile' as Tab, label: 'Profile' },
                { key: 'orders' as Tab, label: 'Orders & Delivery' },
                { key: 'addresses' as Tab, label: 'Addresses' },
              ]
            ).map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative h-12 text-[12px] md:text-[13px] tracking-[0.2em] uppercase transition-colors shrink-0 ${
                    active ? 'text-brand-gray' : 'text-brand-gray-light hover:text-brand-gray'
                  }`}
                >
                  {t.label}
                  <span
                    className={`absolute -bottom-px left-0 right-0 h-px ${
                      active ? 'bg-brand-gray' : 'bg-transparent'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-[1440px] mx-auto px-5 md:px-10 py-10 md:py-[80px]">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'addresses' && <AddressesTab />}
      </section>
    </div>
  );
}

/* ============= PROFILE ============= */

function ProfileTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
      {/* Left column */}
      <div className="flex flex-col gap-10 md:gap-12">
        <Block title="Personal information" action={<EditButton />}>
          <Field label="Your name" value="Alexander Smith" />
          <Field label="Email" value="alexander@goodveen.com" />
          <Field label="Phone number" value="+998 90 123 45 67" />
        </Block>

        <Block title="Change password">
          <PasswordField label="Current password" placeholder="••••••••" />
          <PasswordField label="New password" placeholder="Create a new password" />
          <button className="h-12 self-start px-6 bg-brand-gray text-white tracking-[0.25em] text-[12px] uppercase hover:bg-black transition-colors">
            Save password
          </button>
        </Block>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-10 md:gap-12">
        <Block title="Payment details">
          <p className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">My cards</p>
          <Card brand="UNIVERSALBANK" last4="3889" exp="08/27" />
          <Card brand="NBU" last4="1207" exp="11/26" removed />
          <button className="h-12 self-start px-6 bg-brand-gray text-white tracking-[0.25em] text-[12px] uppercase hover:bg-black transition-colors">
            Add new card
          </button>
        </Block>
      </div>
    </div>
  );
}

interface BlockProps { title: string; children: ReactNode; action?: ReactNode }
function Block({ title, children, action }: BlockProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-brand-border pb-3">
        <h2 className="text-[20px] md:text-[24px] font-light text-brand-gray tracking-[0.01em]">
          {title}
        </h2>
        {action}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function EditButton() {
  return (
    <button className="text-brand-gray-light hover:text-brand-gray transition-colors w-9 h-9 flex items-center justify-center">
      <Pencil size={16} strokeWidth={1.25} />
    </button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 border border-brand-border bg-white">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <span className="text-[14px] text-brand-gray">{value}</span>
    </div>
  );
}

function PasswordField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex flex-col gap-1 px-4 py-3 border border-brand-border bg-white focus-within:border-brand-gray transition-colors">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <input
        type="password"
        placeholder={placeholder}
        className="text-[14px] text-brand-gray bg-transparent outline-none placeholder:text-brand-gray-light/60"
      />
    </label>
  );
}

interface CardProps { brand: string; last4: string; exp: string; removed?: boolean }
function Card({ brand, last4, exp, removed }: CardProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border ${
        removed ? 'border-brand-border bg-brand-border/30' : 'border-brand-gray-light/40'
      }`}
    >
      <div className={`flex flex-col gap-0.5 ${removed ? 'opacity-50' : ''}`}>
        <span className="text-[13px] tracking-[0.15em] text-brand-gray">{brand}</span>
        <span className="text-[11px] text-brand-gray-light">Exp {exp}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-[14px] tracking-[0.2em] ${removed ? 'opacity-50' : 'text-brand-gray'}`}>
          •••• {last4}
        </span>
        {removed ? (
          <button className="text-[11px] tracking-[0.2em] uppercase text-brand-gray underline hover:no-underline">
            Restore
          </button>
        ) : (
          <button className="text-brand-gray-light hover:text-brand-taupe transition-colors w-9 h-9 flex items-center justify-center">
            <Trash2 size={16} strokeWidth={1.25} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============= ORDERS ============= */

function OrdersTab() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {ORDERS.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

type Order = (typeof ORDERS)[number];
interface OrderCardProps { order: Order; key?: string | number }
function OrderCard({ order }: OrderCardProps) {
  const isActive = order.status === 'on-the-way';
  const isCancelled = order.status === 'cancelled';
  return (
    <article
      className={`border ${
        isCancelled ? 'border-brand-taupe/40' : 'border-brand-border'
      } flex flex-col`}
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 border-b border-brand-border bg-brand-border/30">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">
            {order.date}
          </span>
          <h3
            className={`text-[16px] md:text-[18px] tracking-[0.05em] text-brand-gray ${
              isCancelled ? 'line-through opacity-60' : ''
            }`}
          >
            Order #{order.id}
          </h3>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-5">
          <span
            className={`text-[16px] md:text-[18px] font-light ${
              isCancelled ? 'text-brand-taupe' : 'text-brand-gray'
            }`}
          >
            {order.total.toLocaleString()} 000 UZS
          </span>
          <StatusBadge status={order.status} />
        </div>
      </header>

      {/* Body */}
      {order.items.length > 0 && (
        <div className="flex flex-wrap gap-5 md:gap-8 p-5 md:p-6">
          {order.items.map((it) => (
            <Link
              key={it.id}
              to={`/product/${it.id}`}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden border border-brand-border shrink-0">
                <img
                  src={it.img}
                  alt={it.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray group-hover:text-brand-taupe transition-colors">
                  {it.name}
                </span>
                <span className="text-[11px] text-brand-gray-light">
                  Size {it.size} · {it.qty} pc
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Delivery tracker */}
      {order.delivery && isActive && (
        <div className="border-t border-brand-border px-5 md:px-6 py-5 md:py-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">
                Delivery
              </span>
              <span className="text-[14px] md:text-[15px] text-brand-gray">
                {order.delivery.method}
              </span>
              <span className="text-[12px] md:text-[13px] text-brand-gray-light">
                {order.delivery.address}
              </span>
            </div>
            <div className="flex flex-col md:items-end gap-1">
              <span className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">
                Estimated
              </span>
              <span className="text-[14px] md:text-[15px] text-brand-gray">
                {order.delivery.eta}
              </span>
            </div>
          </div>

          <Tracker progress={order.delivery.progress} />
        </div>
      )}

      {/* Footer actions */}
      {!isCancelled && order.items.length > 0 && (
        <footer className="border-t border-brand-border px-5 md:px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center md:justify-end gap-2 md:gap-3">
          {isActive && (
            <button className="h-11 px-5 border border-brand-border text-brand-gray text-[12px] tracking-[0.2em] uppercase hover:bg-brand-border/40 transition-colors">
              Contact courier
            </button>
          )}
          <Link
            to={`/product/${order.items[0].id}`}
            className="h-11 px-5 bg-brand-gray text-white flex items-center justify-center gap-3 text-[12px] tracking-[0.2em] uppercase hover:bg-black transition-colors"
          >
            {isActive ? 'View invoice' : 'Order again'}
            <ArrowRight size={16} strokeWidth={1.25} />
          </Link>
        </footer>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: 'on-the-way' | 'delivered' | 'cancelled' }) {
  const map = {
    'on-the-way': {
      icon: <Truck size={14} strokeWidth={1.5} />,
      label: 'On the way',
      cls: 'bg-brand-taupe/20 text-brand-taupe',
    },
    delivered: {
      icon: <Check size={14} strokeWidth={1.5} />,
      label: 'Delivered',
      cls: 'bg-brand-border text-brand-gray',
    },
    cancelled: {
      icon: <Box size={14} strokeWidth={1.5} />,
      label: 'Cancelled',
      cls: 'bg-transparent text-brand-taupe border border-brand-taupe/40',
    },
  } as const;
  const s = map[status];
  return (
    <span className={`flex items-center gap-2 px-3 py-1 text-[11px] tracking-[0.2em] uppercase ${s.cls}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function Tracker({ progress }: { progress: number }) {
  const steps = [
    { label: 'Confirmed', icon: <Check size={14} strokeWidth={1.5} /> },
    { label: 'Arranging', icon: <Package size={14} strokeWidth={1.5} /> },
    { label: 'On the way', icon: <Truck size={14} strokeWidth={1.5} /> },
    { label: 'Delivered', icon: <Clock size={14} strokeWidth={1.5} /> },
  ];
  return (
    <ol className="flex items-center gap-1 md:gap-3">
      {steps.map((s, i) => {
        const active = i <= progress;
        const isLast = i === steps.length - 1;
        return (
          <li key={s.label} className="flex-1 flex items-center gap-1 md:gap-3">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border ${
                  active
                    ? 'bg-brand-gray text-white border-brand-gray'
                    : 'border-brand-border text-brand-gray-light'
                }`}
              >
                {s.icon}
              </span>
              <span
                className={`text-[10px] md:text-[11px] tracking-[0.15em] uppercase whitespace-nowrap ${
                  active ? 'text-brand-gray' : 'text-brand-gray-light'
                }`}
              >
                {s.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={`flex-1 h-px mb-6 ${
                  i < progress ? 'bg-brand-gray' : 'bg-brand-border'
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ============= ADDRESSES ============= */

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const setDefault = (id: string) =>
    setAddresses((cur) => cur.map((a) => ({ ...a, isDefault: a.id === id })));
  const remove = (id: string) =>
    setAddresses((cur) => {
      const filtered = cur.filter((a) => a.id !== id);
      // ensure at least one default
      if (!filtered.some((a) => a.isDefault) && filtered.length > 0) {
        filtered[0] = { ...filtered[0], isDefault: true };
      }
      return filtered;
    });
  const save = (next: Address) => {
    setAddresses((cur) => {
      const exists = cur.some((a) => a.id === next.id);
      let updated = exists
        ? cur.map((a) => (a.id === next.id ? next : a))
        : [...cur, next];
      if (next.isDefault) updated = updated.map((a) => ({ ...a, isDefault: a.id === next.id }));
      if (!updated.some((a) => a.isDefault) && updated.length > 0) {
        updated[0] = { ...updated[0], isDefault: true };
      }
      return updated;
    });
    setEditingId(null);
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h2 className="text-[24px] md:text-[32px] font-light text-brand-gray tracking-[0.01em]">
            Saved addresses
          </h2>
          <p className="text-[13px] text-brand-gray-light">
            Add as many delivery points as you like — pick one at checkout in a single tap.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="h-12 px-6 bg-brand-gray text-white tracking-[0.25em] text-[12px] uppercase hover:bg-black transition-colors flex items-center gap-3"
        >
          <Plus size={16} strokeWidth={1.25} />
          Add address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {addresses.map((a) =>
          editingId === a.id ? (
            <AddressEditor key={a.id} initial={a} onSave={save} onCancel={() => setEditingId(null)} />
          ) : (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setEditingId(a.id)}
              onDelete={() => remove(a.id)}
              onSetDefault={() => setDefault(a.id)}
            />
          )
        )}
        {adding && (
          <AddressEditor
            initial={emptyAddress()}
            onSave={save}
            onCancel={() => setAdding(false)}
          />
        )}
      </div>
    </div>
  );
}

function emptyAddress(): Address {
  return {
    id: 'addr-' + Date.now(),
    label: '',
    icon: 'home',
    city: 'Tashkent',
    street: '',
    house: '',
    apt: '',
    isDefault: false,
  };
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  key?: string | number;
}
function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
  return (
    <article
      className={`border ${
        address.isDefault ? 'border-brand-gray' : 'border-brand-border'
      } bg-white p-6 md:p-8 flex flex-col gap-5`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 border border-brand-border flex items-center justify-center text-brand-gray">
            <AddressIcon icon={address.icon} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[15px] md:text-[16px] tracking-[0.05em] text-brand-gray">
              {address.label || 'Untitled'}
            </span>
            <span className="text-[12px] text-brand-gray-light">{address.city}</span>
          </div>
        </div>
        {address.isDefault && (
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-brand-gray bg-brand-border/50 px-2 py-1">
            <Star size={12} strokeWidth={1.5} className="fill-brand-gray" />
            Default
          </span>
        )}
      </header>

      <div className="flex flex-col gap-1.5 text-[14px] text-brand-gray">
        <div className="flex items-start gap-2 text-brand-gray-light">
          <MapPin size={14} strokeWidth={1.25} className="mt-1 shrink-0" />
          <span>
            {address.street}
            {(address.house || address.apt) && ', '}
            {address.house && `house ${address.house}`}
            {address.house && address.apt && ', '}
            {address.apt && `apt ${address.apt}`}
          </span>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 pt-4 border-t border-brand-border">
        <button
          onClick={onEdit}
          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors flex items-center gap-2"
        >
          <Pencil size={14} strokeWidth={1.25} />
          Edit
        </button>
        <div className="flex items-center gap-3">
          {!address.isDefault && (
            <button
              onClick={onSetDefault}
              className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors"
            >
              Set as default
            </button>
          )}
          <button
            onClick={onDelete}
            aria-label="Remove"
            className="w-8 h-8 flex items-center justify-center text-brand-gray-light hover:text-brand-taupe transition-colors"
          >
            <Trash2 size={16} strokeWidth={1.25} />
          </button>
        </div>
      </footer>
    </article>
  );
}

function AddressIcon({ icon }: { icon: 'home' | 'work' | 'other' }) {
  if (icon === 'work') return <Briefcase size={18} strokeWidth={1.25} />;
  if (icon === 'other') return <MapPin size={18} strokeWidth={1.25} />;
  return <Home size={18} strokeWidth={1.25} />;
}

interface AddressEditorProps {
  initial: Address;
  onSave: (next: Address) => void;
  onCancel: () => void;
  key?: string | number;
}
function AddressEditor({ initial, onSave, onCancel }: AddressEditorProps) {
  const [draft, setDraft] = useState<Address>(initial);
  const update = <K extends keyof Address>(key: K, value: Address[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <article className="border border-brand-gray bg-white p-6 md:p-8 flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-[18px] md:text-[20px] font-light text-brand-gray tracking-[0.01em]">
          {initial.label ? 'Edit address' : 'New address'}
        </h3>
        <div className="flex items-center gap-2">
          {(['home', 'work', 'other'] as const).map((i) => (
            <button
              key={i}
              onClick={() => update('icon', i)}
              aria-label={i}
              className={`w-9 h-9 border flex items-center justify-center transition-colors ${
                draft.icon === i
                  ? 'border-brand-gray text-brand-gray bg-brand-border/40'
                  : 'border-brand-border text-brand-gray-light hover:text-brand-gray'
              }`}
            >
              <AddressIcon icon={i} />
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-3">
        <EditField
          label="Label"
          value={draft.label}
          onChange={(v) => update('label', v)}
          placeholder="Home / Office / Studio"
        />
        <div className="grid grid-cols-2 gap-3">
          <EditField label="City" value={draft.city} onChange={(v) => update('city', v)} />
          <EditField
            label="Street, district"
            value={draft.street}
            onChange={(v) => update('street', v)}
            placeholder="Mirobod, Lutfiy"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <EditField
            label="House"
            value={draft.house}
            onChange={(v) => update('house', v)}
            placeholder="16"
          />
          <EditField
            label="Apartment"
            value={draft.apt}
            onChange={(v) => update('apt', v)}
            placeholder="58"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <span
            onClick={() => update('isDefault', !draft.isDefault)}
            className={`w-5 h-5 border flex items-center justify-center shrink-0 ${
              draft.isDefault ? 'bg-brand-gray border-brand-gray' : 'border-brand-border'
            }`}
          >
            {draft.isDefault && <Check size={14} strokeWidth={2} className="text-white" />}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={draft.isDefault}
            onChange={(e) => update('isDefault', e.target.checked)}
          />
          <span className="text-[13px] text-brand-gray-light">Use as default delivery address</span>
        </label>
      </div>

      <footer className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
        <button
          onClick={onCancel}
          className="h-11 px-5 text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(draft)}
          className="h-11 px-6 bg-brand-gray text-white text-[12px] tracking-[0.2em] uppercase hover:bg-black transition-colors flex items-center gap-3"
        >
          Save
          <ArrowRight size={16} strokeWidth={1.25} />
        </button>
      </footer>
    </article>
  );
}

interface EditFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
function EditField({ label, value, onChange, placeholder }: EditFieldProps) {
  return (
    <label className="flex flex-col gap-1 px-4 py-3 border border-brand-border bg-white focus-within:border-brand-gray transition-colors">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="text-[14px] text-brand-gray bg-transparent outline-none placeholder:text-brand-gray-light/60"
      />
    </label>
  );
}
