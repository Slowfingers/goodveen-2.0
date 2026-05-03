import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ordersApi } from '../../../lib/api';
import type { Order } from '../../../lib/api/types';
import { Card, PageHeader, SectionTitle, Select } from '../../ui/form';
import { formatDate, formatPrice } from '../../ui/utils';

export function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const o = await ordersApi.getById(id);
        if (active) setOrder(o);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const updateField = async (patch: { status?: Order['status']; paymentStatus?: Order['paymentStatus'] }) => {
    if (!order) return;
    try {
      const updated = await ordersApi.update(order.id, patch);
      setOrder(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  if (loading)
    return <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Loading…</div>;
  if (error || !order)
    return <div className="text-[12px] text-red-700">{error ?? 'Order not found'}</div>;

  return (
    <div>
      <PageHeader
        title={`Order #${order.orderNumber}`}
        back={
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-[#808080] hover:text-[#303030] mb-2"
          >
            <ArrowLeft size={12} /> Back to orders
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <SectionTitle>Items</SectionTitle>
            <div className="divide-y divide-[#EEE]">
              {order.items?.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-3 text-[14px]">
                  <div>
                    <div className="text-[#303030]">{it.productName}</div>
                    <div className="text-[12px] text-[#808080]">
                      {it.sizeName} · {it.quantity} × {formatPrice(it.price)}
                    </div>
                  </div>
                  <div className="text-[#303030]">{formatPrice(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-[#EEE] space-y-1 text-[14px]">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Delivery" value={formatPrice(order.deliveryPrice)} />
              {order.discount > 0 && <Row label="Discount" value={`-${formatPrice(order.discount)}`} />}
              <Row label="Total" value={formatPrice(order.total)} bold />
            </div>
          </Card>

          <Card>
            <SectionTitle>Delivery</SectionTitle>
            <div className="space-y-2 text-[14px]">
              <Row label="Address" value={order.address} />
              <Row label="City" value={order.city} />
              <Row label="Phone" value={order.phone} />
              <Row label="Recipient" value={order.recipientName ?? '—'} />
              <Row label="Type" value={order.deliveryType} />
              <Row label="Date" value={formatDate(order.deliveryDate)} />
              <Row label="Time" value={order.deliveryTime ?? '—'} />
              {order.notes && <Row label="Notes" value={order.notes} />}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Customer</SectionTitle>
            <div className="space-y-1 text-[14px]">
              <div className="text-[#303030]">{order.user?.name ?? '—'}</div>
              <div className="text-[#808080]">{order.user?.email}</div>
              <div className="text-[#808080]">{order.user?.phone ?? '—'}</div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Status</SectionTitle>
            <div className="space-y-4">
              <Select
                value={order.status}
                onChange={(e) => updateField({ status: e.target.value as Order['status'] })}
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="DELIVERING">Delivering</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </Select>
              <Select
                value={order.paymentStatus}
                onChange={(e) =>
                  updateField({ paymentStatus: e.target.value as Order['paymentStatus'] })
                }
              >
                <option value="PENDING">Payment pending</option>
                <option value="PROCESSING">Payment processing</option>
                <option value="COMPLETED">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
                <option value="EXPIRED">Expired</option>
              </Select>
            </div>
          </Card>

          <Card>
            <SectionTitle>Dates</SectionTitle>
            <div className="space-y-1 text-[14px]">
              <Row label="Created" value={formatDate(order.createdAt)} />
              <Row label="Updated" value={formatDate(order.updatedAt)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#808080] text-[12px] uppercase tracking-[0.18em]">{label}</span>
      <span className={`text-[#303030] ${bold ? 'text-[15px]' : ''}`}>{value}</span>
    </div>
  );
}

