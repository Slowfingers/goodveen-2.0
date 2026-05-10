import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../../lib/api';
import type { Order } from '../../../lib/api/types';
import { Card, PageHeader, Select } from '../../ui/form';
import { formatDate, formatPrice } from '../../ui/utils';

const STATUS_COLORS: Record<Order['status'], string> = {
  PENDING: 'text-[#7A5C2A]',
  CONFIRMED: 'text-blue-700',
  PROCESSING: 'text-blue-700',
  DELIVERING: 'text-amber-700',
  DELIVERED: 'text-emerald-700',
  CANCELLED: 'text-red-600',
};

const STATUS_LABELS: Record<Order['status'], string> = {
  PENDING: 'Ожидает',
  CONFIRMED: 'Подтверждён',
  PROCESSING: 'В обработке',
  DELIVERING: 'Доставляется',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
};

const PAYMENT_STATUS_LABELS: Record<Order['paymentStatus'], string> = {
  PENDING: 'Ожидает оплаты',
  PROCESSING: 'Обрабатывается',
  COMPLETED: 'Оплачено',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменено',
  REFUNDED: 'Возвращено',
  EXPIRED: 'Истекло',
};

export function OrdersList() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const refresh = async () => {
    setLoading(true);
    setItems(await ordersApi.listAdmin());
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const filtered = items.filter((o) => statusFilter === 'all' || o.status === statusFilter);

  return (
    <div>
      <PageHeader title="Заказы">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | Order['status'])}
        >
          <option value="all">Все статусы</option>
          <option value="PENDING">Ожидает</option>
          <option value="CONFIRMED">Подтверждён</option>
          <option value="PROCESSING">В обработке</option>
          <option value="DELIVERING">Доставляется</option>
          <option value="DELIVERED">Доставлен</option>
          <option value="CANCELLED">Отменён</option>
        </Select>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F7F4EF] text-left text-[11px] uppercase tracking-[0.2em] text-[#808080]">
              <th className="px-6 py-3 w-36">Заказ #</th>
              <th className="px-6 py-3">Клиент</th>
              <th className="px-6 py-3 w-32">Дата</th>
              <th className="px-6 py-3 w-32">Сумма</th>
              <th className="px-6 py-3 w-32">Статус</th>
              <th className="px-6 py-3 w-32">Оплата</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={6}>
                  Загрузка…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={6}>
                  Нет заказов.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-[#EEE] hover:bg-[#FAFAF7]">
                <td className="px-6 py-3 font-mono text-[12px]">
                  <Link to={`/admin/orders/${o.id}`} className="text-[#303030]">
                    #{o.orderNumber}
                  </Link>
                </td>
                <td className="px-6 py-3 text-[#303030]">
                  {o.user?.name ?? '—'}
                  <div className="text-[11px] text-[#808080]">{o.user?.email}</div>
                </td>
                <td className="px-6 py-3 text-[#808080]">{formatDate(o.createdAt)}</td>
                <td className="px-6 py-3 text-[#303030]">{formatPrice(o.total)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`text-[11px] uppercase tracking-[0.18em] ${STATUS_COLORS[o.status]}`}
                  >
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#808080]">
                  {PAYMENT_STATUS_LABELS[o.paymentStatus] ?? o.paymentStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
