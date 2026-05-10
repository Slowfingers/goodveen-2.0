import { useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Minus, X, ShoppingBag, Check } from 'lucide-react';
import { useCartUI, type CartItem } from './CartContext';

export function CartPopup() {
  const { isOpen, close, items, updateQty, removeItem } = useCartUI();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isOpen) return null;

  const inc = (id: string, size: string) => {
    const item = items.find((i) => i.id === id && i.size === size);
    if (item) updateQty(id, size, item.qty + 1);
  };
  const dec = (id: string, size: string) => {
    const item = items.find((i) => i.id === id && i.size === size);
    if (item) updateQty(id, size, Math.max(1, item.qty - 1));
  };
  const remove = (id: string, size: string) => removeItem(id, size);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const delivery = items.length === 0 || subtotal >= 1000 ? 0 : 50;
  const total = subtotal - discount + delivery;
  const isEmpty = items.length === 0;

  const goCheckout = () => {
    if (!agreed) return;
    close();
    navigate('/checkout');
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center md:items-center bg-black/60 backdrop-blur-[2px]"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[800px] md:max-w-[860px] bg-white text-brand-gray shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col max-h-screen md:max-h-[90vh] mt-[60px] md:mt-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-10 h-[64px] md:h-[80px] border-b border-brand-border shrink-0">
          <h2 className="text-[24px] md:text-[32px] font-light leading-none tracking-[0.01em] text-brand-gray">
            Корзина
            {!isEmpty && (
              <span className="text-brand-gray-light text-[14px] md:text-[16px] tracking-[0.2em] uppercase ml-3 md:ml-4">
                {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'}
              </span>
            )}
          </h2>
          <button
            onClick={close}
            aria-label="Закрыть корзину"
            className="w-10 h-10 flex items-center justify-center text-brand-gray-light hover:text-brand-gray transition-colors"
          >
            <X size={22} strokeWidth={1.25} />
          </button>
        </div>

        {/* Body */}
        {isEmpty ? (
          <div className="flex flex-col items-center text-center gap-6 md:gap-8 py-16 md:py-24 px-5">
            <div className="w-16 h-16 md:w-20 md:h-20 border border-brand-border flex items-center justify-center text-brand-gray-light">
              <ShoppingBag size={28} strokeWidth={1.25} />
            </div>
            <div className="flex flex-col gap-3 max-w-[420px]">
              <h3 className="text-[24px] md:text-[32px] font-light leading-none tracking-[0.01em] text-brand-gray">
                Ваша корзина пуста
              </h3>
              <p className="text-[14px] text-brand-gray-light leading-[22px]">
                Откройте для себя букеты ручной работы, растения и аксессуары — каждый создан на заказ в нашей студии.
              </p>
            </div>
            <Link
              to="/catalog"
              onClick={close}
              className="h-12 px-8 bg-brand-gray text-white flex items-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors"
            >
Посмотреть каталог
              <ArrowRight size={16} strokeWidth={1.25} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 md:px-10 py-2 md:py-4">
              <div className="flex flex-col">
                {items.map((item) => (
                  <CartRow
                    key={`${item.id}-${item.size}`}
                    item={item}
                    onInc={() => inc(item.id, item.size)}
                    onDec={() => dec(item.id, item.size)}
                    onRemove={() => remove(item.id, item.size)}
                    onClose={close}
                  />
                ))}
              </div>

              {/* Promo + summary */}
              <div className="flex flex-col gap-4 pt-6 md:pt-8 mt-4 md:mt-6 border-t border-brand-border">
                <div className="flex items-stretch border border-brand-border max-w-[380px]">
                  <input
                    type="text"
                    placeholder="Промокод"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="flex-1 px-4 text-[13px] outline-none placeholder:text-brand-gray-light"
                  />
                  <button
                    onClick={() => setPromoApplied(promo.trim().length > 0)}
                    className="h-11 px-4 bg-brand-gray text-white text-[11px] tracking-[0.2em] uppercase hover:bg-black transition-colors"
                  >
Применить
                  </button>
                </div>

                <div className="flex flex-col gap-2 max-w-[380px] md:self-end md:items-end md:w-[320px] pt-2">
                  <Row label="Промежуточный итог" value={`${subtotal.toLocaleString()} UZS`} />
                  {promoApplied && (
                    <Row
                      label="Промо (-10%)"
                      value={`− ${discount.toLocaleString()} UZS`}
                      accent
                    />
                  )}
                  <Row
                    label="Доставка"
                    value={delivery === 0 ? 'Бесплатно' : `${delivery.toLocaleString()} UZS`}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-brand-border px-5 md:px-10 py-5 md:py-6 flex flex-col gap-4 shrink-0 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-[12px] tracking-[0.2em] uppercase text-brand-gray">Итого</span>
                <span className="text-[24px] md:text-[28px] font-light text-brand-gray">
                  {total.toLocaleString()}
                  <span className="text-brand-gray-light text-[14px] ml-1">UZS</span>
                </span>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <span
                  onClick={() => setAgreed((v) => !v)}
                  className={`w-5 h-5 mt-0.5 border flex items-center justify-center shrink-0 ${
                    agreed ? 'bg-brand-gray border-brand-gray' : 'border-brand-border'
                  }`}
                >
                  {agreed && <Check size={14} strokeWidth={2} className="text-white" />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="text-[12px] leading-[16px] text-brand-gray-light">
Я согласен с политикой обработки персональных данных и условиями Goodveen.
                </span>
              </label>

              <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-3">
                <button
                  onClick={close}
                  className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors h-11 px-4"
                >
Продолжить покупки
                </button>
                <button
                  onClick={goCheckout}
                  disabled={!agreed}
                  className={`h-12 md:h-14 px-8 flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] transition-colors ${
                    agreed
                      ? 'bg-brand-gray text-white hover:bg-black'
                      : 'bg-brand-border text-brand-gray-light cursor-not-allowed'
                  }`}
                >
Оформить заказ
                  <ArrowRight size={16} strokeWidth={1.25} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface CartRowProps {
  item: CartItem;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
  onClose: () => void;
  key?: string | number;
}
function CartRow({ item, onInc, onDec, onRemove, onClose }: CartRowProps) {
  const total = item.price * item.qty;
  return (
    <div className="flex items-stretch gap-4 md:gap-5 py-4 md:py-5 border-b border-brand-border">
      <div className="relative w-[88px] h-[88px] md:w-[112px] md:h-[112px] overflow-hidden bg-brand-border shrink-0">
        <img src={item.img} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <Link
              to={`/product/${item.slug}`}
              onClick={onClose}
              className="text-[13px] md:text-[14px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors truncate"
            >
              {item.name}
            </Link>
            <p className="text-[12px] md:text-[13px] text-brand-gray-light">
Размер {item.size}
            </p>
            <p className="text-[12px] md:text-[13px] text-brand-gray-light">
              {item.price.toLocaleString()} UZS
            </p>
          </div>
          <button
            onClick={onRemove}
            aria-label="Удалить"
            className="w-7 h-7 flex items-center justify-center text-brand-gray-light hover:text-brand-gray transition-colors shrink-0"
          >
            <X size={18} strokeWidth={1.25} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center border border-brand-border h-9 md:h-10">
            <button
              onClick={onDec}
              className="w-9 md:w-10 h-full flex items-center justify-center hover:bg-brand-border/40"
              aria-label="Уменьшить"
            >
              <Minus size={14} strokeWidth={1.5} />
            </button>
            <span className="w-8 md:w-10 text-center text-[13px]">{item.qty}</span>
            <button
              onClick={onInc}
              className="w-9 md:w-10 h-full flex items-center justify-center hover:bg-brand-border/40"
              aria-label="Увеличить"
            >
              <Plus size={14} strokeWidth={1.5} />
            </button>
          </div>
          <span className="text-[14px] md:text-[15px] text-brand-gray">
            {total.toLocaleString()} UZS
          </span>
        </div>
      </div>
    </div>
  );
}

interface RowProps { label: string; value: ReactNode; accent?: boolean }
function Row({ label, value, accent }: RowProps) {
  return (
    <div className="flex items-center justify-between text-[13px] md:text-[14px] gap-6">
      <span className="text-brand-gray-light">{label}</span>
      <span className={accent ? 'text-brand-taupe' : 'text-brand-gray'}>{value}</span>
    </div>
  );
}
