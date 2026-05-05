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
        if (active) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
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
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  if (loading)
    return <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Загрузка…</div>;
  if (error || !order)
    return <div className="text-[12px] text-red-700">{error ?? 'Заказ не найден'}</div>;

  return (
    <div>
      <PageHeader
        title={`Заказ #${order.orderNumber}`}
        back={
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-[#808080] hover:text-[#303030] mb-2"
          >
            <ArrowLeft size={12} /> Назад к заказам
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <SectionTitle>Товары</SectionTitle>
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
              <Row label="Промежуточный итог" value={formatPrice(order.subtotal)} />
              <Row label="Доставка" value={formatPrice(order.deliveryPrice)} />
              {order.discount > 0 && <Row label="Скидка" value={`-${formatPrice(order.discount)}`} />}
              <Row label="Итого" value={formatPrice(order.total)} bold />
            </div>
          </Card>

          <Card>
            <SectionTitle>Доставка</SectionTitle>
            <div className="space-y-2 text-[14px]">
              <Row label="Адрес" value={order.address} />
              <Row label="Город" value={order.city} />
              <Row label="Телефон" value={order.phone} />
              <Row label="Получатель" value={order.recipientName ?? '—'} />
              <Row label="Тип" value={order.deliveryType} />
              <Row label="Дата" value={formatDate(order.deliveryDate)} />
              <Row label="Время" value={order.deliveryTime ?? '—'} />
              {order.notes && <Row label="Примечания" value={order.notes} />}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Клиент</SectionTitle>
            <div className="space-y-1 text-[14px]">
              <div className="text-[#303030]">{order.user?.name ?? '—'}</div>
              <div className="text-[#808080]">{order.user?.email}</div>
              <div className="text-[#808080]">{order.user?.phone ?? '—'}</div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Статус</SectionTitle>
            <div className="space-y-4">
              <Select
                value={order.status}
                onChange={(e) => updateField({ status: e.target.value as Order['status'] })}
              >
                <option value="PENDING">Ожидает</option>
                <option value="CONFIRMED">Подтверждён</option>
                <option value="PROCESSING">В обработке</option>
                <option value="DELIVERING">Доставляется</option>
                <option value="DELIVERED">Доставлен</option>
                <option value="CANCELLED">Отменён</option>
              </Select>
              <Select
                value={order.paymentStatus}
                onChange={(e) =>
                  updateField({ paymentStatus: e.target.value as Order['paymentStatus'] })
                }
              >
                <option value="PENDING">Ожидает оплаты</option>
                <option value="PAID">Оплачено</option>
                <option value="FAILED">Ошибка оплаты</option>
                <option value="CANCELLED">Отменено</option>
                <option value="REFUNDED">Возвращено</option>
                <option value="EXPIRED">Истекло</option>
              </Select>
            </div>
          </Card>

          <Card>
            <SectionTitle>Даты</SectionTitle>
            <div className="space-y-1 text-[14px]">
              <Row label="Создан" value={formatDate(order.createdAt)} />
              <Row label="Обновлён" value={formatDate(order.updatedAt)} />
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

