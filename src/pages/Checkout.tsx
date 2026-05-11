import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCartUI } from '../components/cart/CartContext';
import { useAuth } from '../components/auth/AuthContext';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Smartphone,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

type Step = 'contact' | 'delivery' | 'payment' | 'confirm';

const STEPS: { key: Step; label: string }[] = [
  { key: 'contact', label: 'Контакты' },
  { key: 'delivery', label: 'Доставка' },
  { key: 'payment', label: 'Оплата' },
  { key: 'confirm', label: 'Подтверждение' },
];

type Delivery = 'pickup' | 'address';
type Payment = 'click' | 'payme' | 'uzum' | 'card' | 'cash';

export function Checkout() {
  const cartUI = useCartUI();
  const { user, signIn: authSignIn } = useAuth();
  const [step, setStep] = useState<Step>('contact');

  useEffect(() => {
    document.title = 'Goodveen - Оформление заказа';
  }, []);

  // form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [hasAccount, setHasAccount] = useState<'guest' | 'account'>('guest');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signinLoading, setSigninLoading] = useState(false);

  // Sync form with user data when logged in
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);

  const signIn = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      setSigninError('Введите корректный email');
      return;
    }
    if (signinPassword.length < 6) {
      setSigninError('Пароль должен быть не менее 6 символов');
      return;
    }
    setSigninError(null);
    setSigninLoading(true);
    try {
      await authSignIn(email, signinPassword);
      setSigninPassword('');
    } catch (err: any) {
      setSigninError(err?.message || 'Неверный email или пароль');
    } finally {
      setSigninLoading(false);
    }
  };

  const [delivery, setDelivery] = useState<Delivery>('address');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Tashkent');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00 — 16:00');
  const [comment, setComment] = useState('');

  const [payment, setPayment] = useState<Payment>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const [agreed, setAgreed] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const subtotal = cartUI.items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const stepIdx = STEPS.findIndex((s) => s.key === step);
  const goNext = () => {
    const next = STEPS[stepIdx + 1];
    if (next) setStep(next.key);
  };
  const goPrev = () => {
    const prev = STEPS[stepIdx - 1];
    if (prev) setStep(prev.key);
  };

  // simple validation
  const contactValid = name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && phone.trim().length >= 7;
  const deliveryValid =
    delivery === 'pickup' ||
    (address.trim().length > 3 && date.trim().length > 0);
  const paymentValid =
    payment !== 'card' || (cardNumber.replace(/\s/g, '').length >= 14 && cardExp.length >= 4 && cardCvv.length >= 3);

  return (
    <div className="w-full bg-white">
      {/* Top bar */}
      <div className="w-full border-b border-brand-border pt-[60px]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-[56px] flex items-center text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
          <Link to="/" className="hover:text-brand-gray transition-colors">
            Goodveen
          </Link>
          <ArrowRight size={12} className="mx-3 opacity-50" />
          <Link to="/cart" className="hover:text-brand-gray transition-colors">
            Корзина
          </Link>
          <ArrowRight size={12} className="mx-3 opacity-50" />
          <span className="text-brand-gray">Оформление</span>
        </div>
      </div>

      <section className="w-full flex justify-center py-10 md:py-[80px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col gap-8 md:gap-12">
          <div className="flex flex-col gap-6 md:gap-10">
            <h1 className="text-[40px] md:text-[80px] leading-none tracking-[0.01em] font-light text-brand-gray">
              Оформление заказа
            </h1>
            <Stepper current={stepIdx} onJump={(idx) => idx <= stepIdx && setStep(STEPS[idx].key)} />
          </div>

          {/* Mobile collapsed order summary */}
          {step !== 'confirm' && (
            <div className="lg:hidden border border-brand-border bg-white">
              <button
                onClick={() => setMobileSummaryOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-4 px-5 h-14"
              >
                <div className="flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray">
                  <span>Итого по заказу</span>
                  {mobileSummaryOpen ? (
                    <ChevronUp size={16} strokeWidth={1.25} className="text-brand-gray-light" />
                  ) : (
                    <ChevronDown size={16} strokeWidth={1.25} className="text-brand-gray-light" />
                  )}
                </div>
                <span className="text-[18px] font-light text-brand-gray">
                  {total.toLocaleString()}
                  <span className="text-brand-gray-light text-[12px] ml-1">UZS</span>
                </span>
              </button>
              {mobileSummaryOpen && (
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-brand-border pt-4">
                  <div className="flex flex-col">
                    {cartUI.items.map((it) => (
                      <div
                        key={`${it.id}-${it.size}`}
                        className="flex items-center gap-3 py-2 border-b last:border-b-0 border-brand-border"
                      >
                        <div className="relative w-12 h-12 overflow-hidden bg-brand-border shrink-0">
                          <img
                            src={it.img}
                            alt={it.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-brand-gray truncate">{it.name}</div>
                          <div className="text-[11px] text-brand-gray-light">{it.size}</div>
                        </div>
                        <span className="text-[12px] text-brand-gray shrink-0">
                          {(it.price * it.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1 text-[13px]">
                    <Row label="Промежуточный итог" value={`${subtotal.toLocaleString()} UZS`} />
                    <Row label="Доставка" value="Бесплатно" />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 lg:gap-16">
            {/* Form column */}
            <div className="flex flex-col gap-8 md:gap-12 pb-24 lg:pb-0">
              {step === 'contact' && (
                <SectionBlock title="Контактная информация">
                  {/* Toggle hidden once signed in (checkout-1440-2 logged-in state) */}
                  {!user && (
                    <div className="flex border border-brand-border self-start text-[12px] tracking-[0.2em] uppercase">
                      {(['guest', 'account'] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setHasAccount(v);
                            setSigninError(null);
                          }}
                          className={`h-10 px-5 transition-colors ${
                            hasAccount === v
                              ? 'bg-brand-gray text-white'
                              : 'text-brand-gray-light hover:text-brand-gray'
                          }`}
                        >
                          {v === 'guest' ? 'Новый покупатель' : 'У меня есть аккаунт'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Signed-in summary card */}
                  {user && (
                    <div className="flex items-center justify-between gap-4 p-4 md:p-5 border border-brand-gray bg-brand-border/30">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-full bg-brand-gray text-white flex items-center justify-center shrink-0">
                          <Check size={16} strokeWidth={1.5} />
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">
                            Вы вошли
                          </span>
                          <span className="text-[14px] text-brand-gray truncate">
                            {name || 'Goodveen account'} · {email}
                          </span>
                        </div>
                      </div>
                      <Link
                        to="/cabinet"
                        className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors shrink-0"
                      >
                        Кабинет
                      </Link>
                    </div>
                  )}

                  {/* Guest fields */}
                  {!user && hasAccount === 'guest' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[13px] text-brand-gray-light">
                        Войдите, чтобы автоматически заполнить данные и получать бонусы.
                      </p>
                      <Field label="Ваше имя" value={name} onChange={setName} placeholder="Александр" />
                      <Field
                        label="Email"
                        value={email}
                        onChange={setEmail}
                        placeholder="alexander@goodveen.com"
                        type="email"
                      />
                      <Field
                        label="Номер телефона"
                        value={phone}
                        onChange={setPhone}
                        placeholder="+998 90 123 45 67"
                      />
                    </div>
                  )}

                  {/* Sign-in form */}
                  {!user && hasAccount === 'account' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-[13px] text-brand-gray-light">
                        Войдите, чтобы автоматически заполнить данные и получать бонусы.
                      </p>
                      <Field
                        label="Email"
                        value={email}
                        onChange={(v) => {
                          setEmail(v);
                          setSigninError(null);
                        }}
                        placeholder="alexander@goodveen.com"
                        type="email"
                      />
                      <Field
                        label="Password"
                        value={signinPassword}
                        onChange={(v) => {
                          setSigninPassword(v);
                          setSigninError(null);
                        }}
                        placeholder="••••••••"
                        type="password"
                      />
                      {signinError && (
                        <p className="text-[12px] text-brand-taupe">{signinError}</p>
                      )}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
                        <Link
                          to="/password-reset"
                          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors"
                        >
                          Забыли пароль?
                        </Link>
                        <button
                          onClick={signIn}
                          disabled={signinLoading}
                          className="h-11 px-6 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors self-start md:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {signinLoading ? 'Вход…' : 'Войти'}
                          <ArrowRight size={16} strokeWidth={1.25} />
                        </button>
                      </div>
                    </div>
                  )}
                </SectionBlock>
              )}

              {step === 'delivery' && (
                <>
                  <SectionBlock title="Способ доставки">
                    <div className="flex flex-col gap-3">
                      <DeliveryOption
                        icon={<Store size={20} strokeWidth={1.25} />}
                        label="Самовывоз из студии"
                        desc="Ташкент, Миробод 12 · сегодня после 14:00"
                        price="Бесплатно"
                        active={delivery === 'pickup'}
                        onClick={() => setDelivery('pickup')}
                      />
                      <DeliveryOption
                        icon={<Truck size={20} strokeWidth={1.25} />}
                        label="Доставка по адресу"
                        desc="Бесплатная доставка"
                        price="Бесплатно"
                        active={delivery === 'address'}
                        onClick={() => setDelivery('address')}
                      />
                    </div>
                  </SectionBlock>

                  {delivery !== 'pickup' && (
                    <SectionBlock title="Адрес">
                      <Field label="Город" value={city} onChange={setCity} />
                      <Field
                        label="Улица, дом, квартира"
                        value={address}
                        onChange={setAddress}
                        placeholder="Mirobod 12, apt 4"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Дата" value={date} onChange={setDate} type="date" />
                        <SelectField
                          label="Время"
                          value={time}
                          onChange={setTime}
                          options={[
                            '10:00 — 12:00',
                            '12:00 — 14:00',
                            '14:00 — 16:00',
                            '16:00 — 18:00',
                            '18:00 — 20:00',
                          ]}
                        />
                      </div>
                      <Textarea
                        label="Комментарий для курьера"
                        value={comment}
                        onChange={setComment}
                        placeholder="Код домофона, пожелания…"
                      />
                    </SectionBlock>
                  )}
                </>
              )}

              {step === 'payment' && (
                <SectionBlock title="Оплата">
                  <div className="flex flex-col gap-3">
                    <DeliveryOption
                      icon={<CreditCard size={20} strokeWidth={1.25} />}
                      label="Click"
                      desc="Платёжная система Click"
                      active={payment === 'click'}
                      onClick={() => setPayment('click')}
                    />
                    <DeliveryOption
                      icon={<CreditCard size={20} strokeWidth={1.25} />}
                      label="Payme"
                      desc="Платёжная система Payme"
                      active={payment === 'payme'}
                      onClick={() => setPayment('payme')}
                    />
                    <DeliveryOption
                      icon={<CreditCard size={20} strokeWidth={1.25} />}
                      label="Uzum"
                      desc="Платёжная система Uzum"
                      active={payment === 'uzum'}
                      onClick={() => setPayment('uzum')}
                    />
                    <DeliveryOption
                      icon={<CreditCard size={20} strokeWidth={1.25} />}
                      label="Банковская карта"
                      desc="Visa · Mastercard · UzCard · Humo"
                      active={payment === 'card'}
                      onClick={() => setPayment('card')}
                    />
                    <DeliveryOption
                      icon={<Banknote size={20} strokeWidth={1.25} />}
                      label="Наличными при получении"
                      desc="Оплата курьеру в сумах"
                      active={payment === 'cash'}
                      onClick={() => setPayment('cash')}
                    />
                  </div>

                  {payment === 'card' && (
                    <div className="flex flex-col gap-3 pt-2">
                      <Field
                        label="Номер карты"
                        value={cardNumber}
                        onChange={(v) => setCardNumber(formatCard(v))}
                        placeholder="0000 0000 0000 0000"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Срок"
                          value={cardExp}
                          onChange={(v) => setCardExp(formatExp(v))}
                          placeholder="MM/YY"
                        />
                        <Field
                          label="CVV"
                          value={cardCvv}
                          onChange={(v) => setCardCvv(v.replace(/\D/g, '').slice(0, 4))}
                          placeholder="•••"
                        />
                      </div>
                      <Field label="Имя владельца карты" value={cardName} onChange={setCardName} placeholder="ALEXANDER GOODVEEN" />
                    </div>
                  )}
                </SectionBlock>
              )}

              {/* Confirmation rendered as popup outside the column layout (see below) */}

              {/* Step nav (desktop only — mobile uses sticky bottom bar) */}
              {step !== 'confirm' && (
                <div className="hidden lg:flex items-center justify-between gap-4 pt-4 md:pt-8 border-t border-brand-border">
                  <button
                    onClick={goPrev}
                    disabled={stepIdx === 0}
                    className={`h-12 px-6 flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase transition-colors ${
                      stepIdx === 0
                        ? 'text-brand-gray-light cursor-not-allowed'
                        : 'text-brand-gray hover:text-brand-taupe'
                    }`}
                  >
                    <ArrowLeft size={16} strokeWidth={1.25} />
                    {stepIdx === 0 ? (
                      <Link to="/cart">Вернуться в корзину</Link>
                    ) : (
                      <span>Назад</span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (step === 'contact' && !contactValid) return;
                      if (step === 'delivery' && !deliveryValid) return;
                      if (step === 'payment' && !paymentValid) return;
                      goNext();
                    }}
                    className={`h-12 px-8 flex items-center gap-3 uppercase tracking-[0.25em] text-[12px] transition-colors ${
                      (step === 'contact' && contactValid) ||
                      (step === 'delivery' && deliveryValid) ||
                      (step === 'payment' && paymentValid)
                        ? 'bg-brand-gray text-white hover:bg-black'
                        : 'bg-brand-border text-brand-gray-light cursor-not-allowed'
                    }`}
                  >
                    {step === 'payment' ? 'Оформить заказ' : 'Продолжить'}
                    <ArrowRight size={16} strokeWidth={1.25} />
                  </button>
                </div>
              )}
            </div>

            {/* Summary column (desktop only — mobile uses collapsed bar at top + sticky CTA at bottom) */}
            <aside className="hidden lg:flex flex-col gap-6 lg:sticky lg:top-[80px] lg:self-start">
              <div className="border border-brand-border bg-white p-6 md:p-8 flex flex-col gap-5">
                <h2 className="text-[20px] md:text-[24px] font-light text-brand-gray tracking-[0.01em]">
                  Ваш заказ
                </h2>

                <div className="flex flex-col">
                  {cartUI.items.map((it) => (
                    <div
                      key={`${it.id}-${it.size}`}
                      className="flex items-center gap-4 py-3 border-b last:border-b-0 border-brand-border"
                    >
                      <div className="relative w-16 h-16 overflow-hidden bg-brand-border shrink-0">
                        <img src={it.img} alt={it.name} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] tracking-[0.2em] uppercase text-brand-gray truncate">
                          {it.name}
                        </p>
                        <p className="text-[12px] text-brand-gray-light">
                          Размер {it.size} · ×{it.qty}
                        </p>
                      </div>
                      <span className="text-[13px] text-brand-gray shrink-0">
                        {(it.price * it.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Row label="Промежуточный итог" value={`${subtotal.toLocaleString()} UZS`} />
                  <Row label="Доставка" value="Бесплатно" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-brand-border">
                  <span className="text-[12px] tracking-[0.2em] uppercase text-brand-gray">Итого</span>
                  <span className="text-[24px] md:text-[28px] font-light text-brand-gray">
                    {total.toLocaleString()}
                    <span className="text-brand-gray-light text-[14px] ml-1">UZS</span>
                  </span>
                </div>

                {step !== 'confirm' && (
                  <label className="flex items-start gap-3 cursor-pointer pt-2 border-t border-brand-border">
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
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ===== ORDER CONFIRMATION POPUP ===== */}
      {step === 'confirm' && (
        <div className="fixed inset-0 z-[80] flex items-start md:items-center justify-center bg-black/60 backdrop-blur-[2px] overflow-y-auto py-10 md:py-16 px-4">
          <div className="relative w-full max-w-[720px] bg-white shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col">
            {/* Close (returns to checkout review) */}
            <button
              onClick={() => setStep('payment')}
              aria-label="Закрыть"
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 flex items-center justify-center text-brand-gray-light hover:text-brand-gray transition-colors z-10"
            >
              <X size={22} strokeWidth={1.25} />
            </button>

            <div className="flex flex-col gap-8 md:gap-10 p-6 md:p-12">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-gray flex items-center justify-center">
                <Check size={28} strokeWidth={1.25} className="text-white" />
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                  Заказ принят
                </span>
                <h2 className="text-[28px] md:text-[40px] font-light leading-[1.1] tracking-[0.01em] text-brand-gray">
                  Спасибо, {name || 'друг Goodveen'}.
                </h2>
                <p className="text-[14px] md:text-[15px] text-brand-gray-light leading-[22px] md:leading-[24px] max-w-[520px]">
                  Мы получили ваш заказ и начали создавать его вручную. Уведомление в Telegram с отслеживанием придёт в ближайшее время.
                </p>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-[14px] py-2 border-t border-b border-brand-border md:py-6">
                <Detail label="Доставка">{deliveryLabel(delivery)}</Detail>
                <Detail label="Оплата">{paymentLabel(payment)}</Detail>
                <Detail label="Получатель">{name || '—'}</Detail>
                <Detail label="Телефон">{phone || '—'}</Detail>
                {delivery !== 'pickup' && <Detail label="Адрес">{address || '—'}</Detail>}
                {date && (
                  <Detail label="Когда">
                    {date} · {time}
                  </Detail>
                )}
                <Detail label="Итого">
                  {total.toLocaleString()} UZS
                </Detail>
              </dl>

              <div className="flex flex-col md:flex-row gap-3">
                <Link
                  to="/cabinet?tab=orders"
                  className="h-12 px-8 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors"
                >
                  Отследить заказ
                  <ArrowRight size={16} strokeWidth={1.25} />
                </Link>
                <Link
                  to="/catalog"
                  className="h-12 px-8 border border-brand-gray text-brand-gray flex items-center justify-center uppercase tracking-[0.25em] text-[12px] hover:bg-brand-border/40 transition-colors"
                >
                  Продолжить покупки
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky bottom bar */}
      {step !== 'confirm' && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-brand-border px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
          {stepIdx > 0 && (
            <button
              onClick={goPrev}
              aria-label="Назад"
              className="w-12 h-12 border border-brand-border flex items-center justify-center text-brand-gray hover:bg-brand-border/40 transition-colors shrink-0"
            >
              <ArrowLeft size={18} strokeWidth={1.25} />
            </button>
          )}
          <div className="flex-1 flex flex-col leading-tight">
            <span className="text-[10px] tracking-[0.2em] uppercase text-brand-gray-light">
              Итого
            </span>
            <span className="text-[18px] font-light text-brand-gray">
              {total.toLocaleString()}
              <span className="text-brand-gray-light text-[12px] ml-1">UZS</span>
            </span>
          </div>
          <button
            onClick={() => {
              if (step === 'contact' && !contactValid) return;
              if (step === 'delivery' && !deliveryValid) return;
              if (step === 'payment' && !paymentValid) return;
              goNext();
            }}
            className={`h-12 px-5 flex items-center gap-2 uppercase tracking-[0.2em] text-[12px] transition-colors ${
              (step === 'contact' && contactValid) ||
              (step === 'delivery' && deliveryValid) ||
              (step === 'payment' && paymentValid)
                ? 'bg-brand-gray text-white hover:bg-black'
                : 'bg-brand-border text-brand-gray-light cursor-not-allowed'
            }`}
          >
            {step === 'payment' ? 'Оформить заказ' : 'Продолжить'}
            <ArrowRight size={16} strokeWidth={1.25} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ===== Helpers ===== */

interface StepperProps { current: number; onJump: (idx: number) => void }
function Stepper({ current, onJump }: StepperProps) {
  return (
    <ol className="flex items-center gap-3 md:gap-5 overflow-x-auto pb-1">
      {STEPS.map((s, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={s.key} className="flex items-center gap-3 md:gap-5 shrink-0">
            <button
              onClick={() => onJump(idx)}
              className="flex items-center gap-2 md:gap-3 group"
              disabled={idx > current}
            >
              <span
                className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center border text-[12px] transition-colors ${
                  done
                    ? 'bg-brand-gray border-brand-gray text-white'
                    : active
                    ? 'border-brand-gray text-brand-gray'
                    : 'border-brand-border text-brand-gray-light'
                }`}
              >
                {done ? <Check size={14} strokeWidth={2} /> : idx + 1}
              </span>
              <span
                className={`text-[11px] md:text-[12px] tracking-[0.2em] uppercase ${
                  active ? 'text-brand-gray' : done ? 'text-brand-gray-light' : 'text-brand-gray-light'
                }`}
              >
                {s.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && <span className="w-6 md:w-12 h-px bg-brand-border" />}
          </li>
        );
      })}
    </ol>
  );
}

interface SectionBlockProps { title: string; children: ReactNode }
function SectionBlock({ title, children }: SectionBlockProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[22px] md:text-[28px] font-light text-brand-gray tracking-[0.01em]">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}
function Field({ label, value, onChange, placeholder, type = 'text' }: FieldProps) {
  return (
    <label className="w-full px-4 pt-3 pb-3 border border-brand-border bg-white flex flex-col focus-within:border-brand-gray transition-colors">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none text-[14px] text-brand-gray bg-transparent placeholder:text-brand-gray-light/60"
      />
    </label>
  );
}

interface SelectFieldProps { label: string; value: string; onChange: (v: string) => void; options: string[] }
function SelectField({ label, value, onChange, options }: SelectFieldProps) {
  return (
    <label className="w-full px-4 pt-3 pb-2 border border-brand-border bg-white flex flex-col focus-within:border-brand-gray transition-colors">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full outline-none text-[14px] text-brand-gray bg-transparent"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

interface TextareaProps { label: string; value: string; onChange: (v: string) => void; placeholder?: string }
function Textarea({ label, value, onChange, placeholder }: TextareaProps) {
  return (
    <label className="w-full px-4 pt-3 pb-3 border border-brand-border bg-white flex flex-col focus-within:border-brand-gray transition-colors">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full outline-none text-[14px] text-brand-gray bg-transparent placeholder:text-brand-gray-light/60 resize-none"
      />
    </label>
  );
}

interface DeliveryOptionProps {
  icon: ReactNode;
  label: string;
  desc: string;
  price?: string;
  active: boolean;
  onClick: () => void;
}
function DeliveryOption({ icon, label, desc, price, active, onClick }: DeliveryOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-5 border flex items-center gap-4 text-left transition-colors ${
        active ? 'border-brand-gray bg-brand-border/30' : 'border-brand-border hover:border-brand-gray-light'
      }`}
    >
      <span
        className={`w-10 h-10 flex items-center justify-center border ${
          active ? 'border-brand-gray text-brand-gray' : 'border-brand-border text-brand-gray-light'
        }`}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] tracking-[0.05em] text-brand-gray">{label}</p>
        <p className="text-[12px] text-brand-gray-light truncate">{desc}</p>
      </div>
      {price && <span className="text-[13px] text-brand-gray shrink-0 hidden md:block">{price}</span>}
      <span
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
          active ? 'border-brand-gray' : 'border-brand-border'
        }`}
      >
        {active && <span className="w-2.5 h-2.5 rounded-full bg-brand-gray" />}
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between text-[13px] md:text-[14px]">
      <span className="text-brand-gray-light">{label}</span>
      <span className="text-brand-gray">{value}</span>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">{label}</dt>
      <dd className="text-[14px] text-brand-gray">{children}</dd>
    </div>
  );
}

function deliveryLabel(d: Delivery) {
  return d === 'pickup' ? 'Самовывоз из студии' : 'Доставка по адресу';
}
function paymentLabel(p: Payment) {
  if (p === 'click') return 'Click';
  if (p === 'payme') return 'Payme';
  if (p === 'uzum') return 'Uzum';
  if (p === 'card') return 'Банковская карта';
  return 'Наличными при получении';
}
function formatCard(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}
function formatExp(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length < 3) return d;
  return d.slice(0, 2) + '/' + d.slice(2);
}
