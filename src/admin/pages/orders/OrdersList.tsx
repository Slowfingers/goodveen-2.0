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
      <PageHeader title="Orders">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | Order['status'])}
        >
          <option value="all">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="DELIVERING">Delivering</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F7F4EF] text-left text-[11px] uppercase tracking-[0.2em] text-[#808080]">
              <th className="px-6 py-3 w-36">Order #</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3 w-32">Date</th>
              <th className="px-6 py-3 w-32">Total</th>
              <th className="px-6 py-3 w-32">Status</th>
              <th className="px-6 py-3 w-32">Payment</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={6}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={6}>
                  No orders.
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
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-[#808080]">
                  {o.paymentStatus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
