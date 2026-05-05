import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, ordersApi, productsApi, usersApi } from '../../lib/api';

interface Counts {
  products: number;
  events: number;
  orders: number;
  users: number;
  pendingOrders: number;
}

export function Dashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [products, events, orders, users] = await Promise.all([
          productsApi.list(),
          eventsApi.list(),
          ordersApi.listAdmin(),
          usersApi.list(),
        ]);
        if (!active) return;
        setCounts({
          products: products.length,
          events: events.length,
          orders: orders.length,
          users: users.length,
          pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
        });
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="text-[28px] tracking-[0.04em] text-[#303030] mb-8">Главная</h1>

      {error && (
        <div className="text-[12px] text-red-700 bg-red-50 border border-red-100 px-3 py-2 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Stat label="Товары" value={counts?.products} to="/admin/products" />
        <Stat label="События" value={counts?.events} to="/admin/events" />
        <Stat label="Заказы" value={counts?.orders} to="/admin/orders" />
        <Stat label="Ожидают обработки" value={counts?.pendingOrders} to="/admin/orders" highlight />
        <Stat label="Пользователи" value={counts?.users} to="/admin/users" />
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-4">
        <QuickAction
          title="Добавить товар"
          description="Создать букет, растение или аксессуар."
          to="/admin/products/new"
        />
        <QuickAction
          title="Опубликовать событие"
          description="Добавить историю или новость в журнал."
          to="/admin/events/new"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  to,
  highlight,
}: {
  label: string;
  value: number | undefined;
  to: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`block bg-white border ${
        highlight ? 'border-[#303030]' : 'border-[#EEE]'
      } px-5 py-5 hover:border-[#303030] transition`}
    >
      <div className="text-[11px] tracking-[0.18em] uppercase text-[#808080]">{label}</div>
      <div className="mt-2 text-[28px] text-[#303030]">{value ?? '—'}</div>
    </Link>
  );
}

function QuickAction({
  title,
  description,
  to,
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="block bg-white border border-[#EEE] px-6 py-5 hover:border-[#303030] transition"
    >
      <div className="text-[15px] text-[#303030]">{title}</div>
      <div className="text-[12px] text-[#808080] mt-1">{description}</div>
    </Link>
  );
}
