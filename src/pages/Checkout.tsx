import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartUI } from '../components/cart/CartContext';
import { useAuth, useAuthUI } from '../components/auth/AuthContext';
import { Check, X } from 'lucide-react';

type Delivery = 'pickup' | 'address';
type Payment = 'click' | 'payme' | 'uzum' | 'card' | 'cash';

export function Checkout() {
  const cartUI = useCartUI();
  const { user } = useAuth();
  const authUI = useAuthUI();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Goodveen - Checkout';
  }, []);

  // Personal information
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Sync with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Payment
  const [payment, setPayment] = useState<Payment>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExp, setCardExp] = useState('');

  // Delivery
  const [delivery, setDelivery] = useState<Delivery>('address');
  const [country, setCountry] = useState('Uzbekistan');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [comments, setComments] = useState('');

  // Agreement
  const [agreed, setAgreed] = useState(false);

  // Order confirmation
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const subtotal = cartUI.items.reduce((s, i) => s + i.price * i.qty, 0);
  const deliveryFee = 0; // Free delivery
  const total = subtotal + deliveryFee;

  const handleCompleteCheckout = () => {
    // Generate order number
    const orderNum = `#${Math.floor(Math.random() * 9000000) + 1000000}`;
    setOrderNumber(orderNum);
    setOrderPlaced(true);
    
    // Clear cart
    cartUI.items.forEach(item => {
      cartUI.remove(item.id, item.size);
    });
  };

  if (orderPlaced) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-5">
        <div className="relative w-full max-w-[370px] md:max-w-[580px] bg-white p-10 shadow-[0_40px_80px_rgba(0,0,0,0.32)]">
          <button
            onClick={() => navigate('/')}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-brand-gray-light hover:text-brand-gray transition-colors"
          >
            <X size={20} strokeWidth={1.25} />
          </button>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">
                The order has been placed
              </h2>
              <p className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">
                Our manager will contact you to discuss the details
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <h3 className="text-[20px] leading-[26px] tracking-[0.02em] text-brand-gray">
                  Order {orderNumber}
                </h3>
                <div className="flex items-center gap-2 text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">
                  <span>Created</span>
                  <span className="text-[#EEEEEE]">•</span>
                  <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {cartUI.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-5 border border-[#D0D0D0]">
                    <div className="w-[120px] h-[120px] bg-cover bg-center" style={{ backgroundImage: `url(${item.img})` }} />
                    <div className="flex-1 flex items-center gap-5 pr-3">
                      <div className="flex-1 flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                          <div className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-brand-gray">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-[14px] leading-[16px] tracking-[0.02em] text-[#808080]">
                            <span>{item.size}</span>
                            <span className="text-[#EEEEEE]">•</span>
                            <span>{item.price.toLocaleString()} uzs</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">
                            x{item.qty}
                          </span>
                          <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">
                            {(item.price * item.qty).toLocaleString()} uzs
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center justify-between gap-2 w-full md:w-[280px]">
                  <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Items subtotal:</span>
                  <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">{subtotal.toLocaleString()} uzs</span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full md:w-[280px]">
                  <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Delivery:</span>
                  <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Free</span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full md:w-[280px]">
                  <span className="text-[20px] leading-[26px] tracking-[0.02em] text-brand-gray">Grand Total:</span>
                  <span className="text-[20px] leading-[26px] tracking-[0.02em] text-brand-gray">{total.toLocaleString()} uzs</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/cabinet?tab=orders')}
              className="w-full h-[56px] flex items-center justify-center bg-brand-gray text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase hover:bg-black transition-colors"
            >
              Check order status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white pt-[60px]">
      <section className="w-full flex justify-center py-10 md:py-20 px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col gap-10">
          <h1 className="text-[36px] leading-[36px] tracking-[0.02em] text-brand-gray">Checkout</h1>

          {/* New customer / I have an account toggle */}
          {!user && (
            <div className="flex items-center gap-10">
              <button
                onClick={() => authUI.open('register')}
                className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-brand-gray border-b border-brand-gray pb-3"
              >
                New customer
              </button>
              <button
                onClick={() => authUI.open('login')}
                className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-brand-gray pb-3"
              >
                I have an account
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left column - Forms */}
            <div className="flex-1 flex flex-col gap-10">
              {/* Personal information */}
              <div className="flex flex-col gap-3">
                <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">Personal information</h2>
                <InputField label="Your name" value={name} onChange={setName} placeholder="Alexander" />
                <InputField label="Email" value={email} onChange={setEmail} placeholder="Alexander@samplemail.com" type="email" />
                <InputField label="Phone number" value={phone} onChange={setPhone} placeholder="+998 90 123 45 67" />
              </div>

              {/* Payment information */}
              <div className="flex flex-col gap-3">
                <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">Payment information</h2>
                
                <PaymentOption
                  label="Click"
                  icon="/click-logo.png"
                  active={payment === 'click'}
                  onClick={() => setPayment('click')}
                />
                <PaymentOption
                  label="Payme"
                  icon="/payme-logo.png"
                  active={payment === 'payme'}
                  onClick={() => setPayment('payme')}
                />
                <PaymentOption
                  label="Uzum"
                  icon="/uzum-logo.png"
                  active={payment === 'uzum'}
                  onClick={() => setPayment('uzum')}
                />
                
                <div className={`flex flex-col border ${payment === 'card' ? 'border-[#585858]' : 'border-[#EEEEEE]'}`}>
                  <button
                    onClick={() => setPayment('card')}
                    className="flex items-center gap-4 p-4 border-b border-[#EEEEEE]"
                  >
                    <div className="w-[58px] h-[40px] flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#BABABA] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                      </div>
                    </div>
                    <span className="flex-1 text-left text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Bank card</span>
                    {payment === 'card' && (
                      <Check size={20} strokeWidth={1.25} className="text-brand-gray" />
                    )}
                  </button>
                  
                  {payment === 'card' && (
                    <div className="flex flex-col gap-3 p-5">
                      <InputField label="Card number" value={cardNumber} onChange={setCardNumber} placeholder="0000 0000 0000 0000" />
                      <InputField label="Card name" value={cardName} onChange={setCardName} placeholder="ALEXANDER GOODVEEN" />
                      <div className="flex gap-3">
                        <InputField label="Valid thru" value={cardExp} onChange={setCardExp} placeholder="MM/YY" />
                        <div className="flex-1 opacity-0 pointer-events-none">
                          <InputField label="CVV" value="" onChange={() => {}} placeholder="•••" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <PaymentOption
                  label="Cash on delivery"
                  icon="/cash-icon.png"
                  active={payment === 'cash'}
                  onClick={() => setPayment('cash')}
                />
              </div>

              {/* Delivery information */}
              <div className="flex flex-col gap-3">
                <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">Delivery information</h2>
                
                <DeliveryOption
                  label="Pickup from store"
                  icon="/store-icon.png"
                  active={delivery === 'pickup'}
                  onClick={() => setDelivery('pickup')}
                />
                
                <div className={`flex flex-col border ${delivery === 'address' ? 'border-[#585858]' : 'border-[#EEEEEE]'}`}>
                  <button
                    onClick={() => setDelivery('address')}
                    className="flex items-center gap-4 p-4 border-b border-[#EEEEEE]"
                  >
                    <div className="w-[58px] h-[40px] flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#BABABA] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                    </div>
                    <span className="flex-1 text-left text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Address delivery</span>
                    {delivery === 'address' && (
                      <Check size={20} strokeWidth={1.25} className="text-brand-gray" />
                    )}
                  </button>
                  
                  {delivery === 'address' && (
                    <div className="flex flex-col gap-3 p-5">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <InputField label="Country" value={country} onChange={setCountry} placeholder="Uzbekistan" />
                        </div>
                        <div className="flex-1">
                          <InputField label="City" value={city} onChange={setCity} placeholder="Tashkent" />
                        </div>
                      </div>
                      <InputField label="Address" value={address} onChange={setAddress} placeholder="Chilonzor tumani, Lutfiy street" />
                      <div className="flex gap-3">
                        <InputField label="House number" value={house} onChange={setHouse} placeholder="16" />
                        <InputField label="Apartment number" value={apartment} onChange={setApartment} placeholder="58" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-[#EEEEEE] p-4">
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Comments"
                    className="w-full text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Right column - Order details */}
            <div className="w-full lg:w-[660px] bg-[#F6F6F6] p-10 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">Order details</h2>
                <button
                  onClick={() => cartUI.open()}
                  className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-brand-gray hover:underline"
                >
                  Edit Order
                </button>
              </div>

              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-3">
                  {cartUI.items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-start gap-5 border border-[#D0D0D0] bg-white">
                      <div className="w-[120px] h-[120px] bg-cover bg-center" style={{ backgroundImage: `url(${item.img})` }} />
                      <div className="flex-1 flex items-center gap-5 p-5">
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-brand-gray">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 text-[14px] leading-[16px] tracking-[0.02em] text-[#808080]">
                            <span>{item.size}</span>
                            <span className="text-[#EEEEEE]">•</span>
                            <span>{item.price.toLocaleString()} uzs</span>
                          </div>
                        </div>
                        <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">x{item.qty}</span>
                        <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">
                          {(item.price * item.qty).toLocaleString()} uzs
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center justify-between gap-2 w-[280px]">
                    <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Items subtotal:</span>
                    <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">{subtotal.toLocaleString()} uzs</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 w-[280px]">
                    <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Delivery:</span>
                    <span className="text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">Free</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 w-[280px]">
                    <span className="text-[20px] leading-[26px] tracking-[0.02em] text-brand-gray">Grand Total:</span>
                    <span className="text-[20px] leading-[26px] tracking-[0.02em] text-brand-gray">{total.toLocaleString()} uzs</span>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setAgreed(!agreed)}
                    className={`w-5 h-5 flex items-center justify-center ${agreed ? 'bg-brand-gray' : 'bg-white border border-[#EEEEEE]'}`}
                  >
                    {agreed && <Check size={16} strokeWidth={2} className="text-white" />}
                  </div>
                  <span className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray">
                    I agree with the personal data processing policy
                  </span>
                </label>

                <button
                  onClick={handleCompleteCheckout}
                  disabled={!agreed}
                  className="w-full h-[56px] flex items-center justify-center bg-brand-gray text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper components
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

function InputField({ label, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1 border border-[#EEEEEE] bg-white p-4">
      <label className="text-[12px] leading-[14px] tracking-[0.02em] text-[#808080]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-[14px] leading-[16px] tracking-[0.02em] text-brand-gray outline-none bg-transparent"
      />
    </div>
  );
}

interface PaymentOptionProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

function PaymentOption({ label, icon, active, onClick }: PaymentOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border ${active ? 'border-[#585858]' : 'border-[#EEEEEE]'} bg-white`}
    >
      <div className="w-[58px] h-[40px] flex items-center justify-center opacity-50">
        {/* Icon placeholder */}
        <div className="w-full h-full bg-[#D0D0D0]" />
      </div>
      <span className="flex-1 text-left text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">{label}</span>
    </button>
  );
}

interface DeliveryOptionProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

function DeliveryOption({ label, icon, active, onClick }: DeliveryOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 p-4 border ${active ? 'border-[#585858]' : 'border-[#EEEEEE]'} bg-white`}
    >
      <div className="w-[58px] h-[40px] flex items-center justify-center">
        <div className="w-9 h-9 rounded-full bg-[#BABABA] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
      </div>
      <span className="flex-1 text-left text-[16px] leading-[22px] tracking-[0.02em] text-brand-gray">{label}</span>
    </button>
  );
}
