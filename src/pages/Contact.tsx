import { useEffect, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  Instagram,
  Send,
  Facebook,
  Check,
} from 'lucide-react';

export function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('General enquiry');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (name.trim().length < 2) return setError('Enter your name');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email');
    if (message.trim().length < 5) return setError('Tell us a little more');
    if (!agreed) return setError('Please accept the terms');
    setError(null);
    setSent(true);
  };

  return (
    <div className="w-full bg-white">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[340px] md:h-[420px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1549420078-d4469796bb82?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[280px] bg-gradient-to-t from-black/70 to-transparent" />

        <div className="h-[84px]" />
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-8 md:pb-12 flex flex-col items-start gap-3 md:gap-4">
          <span className="text-white/85 text-[11px] md:text-[12px] tracking-[0.25em] uppercase">
            Get in touch
          </span>
          <h1 className="text-white text-[40px] md:text-[64px] leading-[1.05] tracking-[0.01em] font-light">
            Contact us
          </h1>
          <p className="text-white/85 text-[14px] md:text-[15px] max-w-[560px]">
            Questions, custom orders, partnerships — we read every message and respond within a day.
          </p>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <section className="w-full flex justify-center">
        <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0">
          {/* Left: Contacts + Form */}
          <div className="flex flex-col gap-12 md:gap-16 py-[60px] md:py-[80px] px-5 md:px-10 lg:pr-[60px]">
            {/* Contact Info */}
            <div className="flex flex-col gap-8">
            <InfoBlock icon={<MapPin size={20} strokeWidth={1.25} />} title="Atelier">
              <p>Tashkent, Uzbekiston Ovozi street 2/1</p>
              <p className="text-brand-gray-light text-[13px] mt-1">
                Mirobod, near the Botanical garden entrance
              </p>
            </InfoBlock>

            <InfoBlock icon={<Phone size={20} strokeWidth={1.25} />} title="Phones">
              <a href="tel:+998712339780" className="block hover:text-brand-taupe transition-colors">
                +998 71 233 97 80
              </a>
              <a href="tel:+998999559090" className="block hover:text-brand-taupe transition-colors">
                +998 99 955 90 90
              </a>
              <a href="tel:+998711200604" className="block hover:text-brand-taupe transition-colors">
                +998 71 120 06 04
              </a>
            </InfoBlock>

            <InfoBlock icon={<Mail size={20} strokeWidth={1.25} />} title="Email">
              <a
                href="mailto:hello@goodveen.uz"
                className="hover:text-brand-taupe transition-colors"
              >
                hello@goodveen.uz
              </a>
              <p className="text-brand-gray-light text-[13px] mt-1">For wholesale & press</p>
            </InfoBlock>

            <InfoBlock icon={<Clock size={20} strokeWidth={1.25} />} title="Open hours">
              <p>Every day · 09:00 — 21:00</p>
              <p className="text-brand-gray-light text-[13px] mt-1">
                Same-day delivery for orders before 14:00
              </p>
            </InfoBlock>

              {/* Social */}
              <div className="flex flex-col gap-4 pt-6 mt-6 border-t border-brand-border">
                <span className="text-[11px] tracking-[0.25em] uppercase text-brand-gray-light">
                  Follow the studio
                </span>
                <div className="flex gap-3">
                  <SocialIcon href="#" label="Instagram">
                    <Instagram size={18} strokeWidth={1.25} />
                  </SocialIcon>
                  <SocialIcon href="#" label="Telegram">
                    <Send size={18} strokeWidth={1.25} />
                  </SocialIcon>
                  <SocialIcon href="#" label="Facebook">
                    <Facebook size={18} strokeWidth={1.25} />
                  </SocialIcon>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="flex flex-col">
            {sent ? (
              <div className="w-full bg-brand-border/30 p-8 md:p-12 flex flex-col gap-6 md:gap-8 border border-brand-border">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand-gray flex items-center justify-center self-start">
                  <Check size={26} strokeWidth={1.25} className="text-white" />
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                    Thanks for reaching out
                  </span>
                  <h2 className="text-[28px] md:text-[36px] font-light leading-[1.1] tracking-[0.01em] text-brand-gray">
                    Message received.
                  </h2>
                  <p className="text-[14px] text-brand-gray-light leading-[22px]">
                    We'll get back to you at <span className="text-brand-gray">{email}</span>{' '}
                    within one business day.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSent(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setMessage('');
                  }}
                  className="self-start h-11 px-5 border border-brand-gray text-brand-gray text-[12px] tracking-[0.2em] uppercase hover:bg-brand-border/40 transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form
                className="w-full bg-white p-0 flex flex-col gap-5 md:gap-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                    Drop us a line
                  </span>
                  <h2 className="text-[32px] md:text-[42px] font-light leading-[1.05] tracking-[0.01em] text-brand-gray">
                    How can we help?
                  </h2>
                </div>

                {/* Topic chips */}
                <div className="flex flex-wrap gap-2">
                  {['General enquiry', 'Custom order', 'Wholesale', 'Press'].map((t) => {
                    const active = topic === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        className={`h-9 px-4 text-[11px] tracking-[0.15em] uppercase border transition-colors ${
                          active
                            ? 'bg-brand-gray text-white border-brand-gray'
                            : 'border-brand-border text-brand-gray-light hover:text-brand-gray'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                <Field
                  label="Your name"
                  value={name}
                  onChange={(v) => {
                    setName(v);
                    setError(null);
                  }}
                  placeholder="Alexander"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="Email"
                    value={email}
                    onChange={(v) => {
                      setEmail(v);
                      setError(null);
                    }}
                    placeholder="alexander@goodveen.com"
                    type="email"
                  />
                  <Field
                    label="Phone (optional)"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+998 90 123 45 67"
                    type="tel"
                  />
                </div>
                <Textarea
                  label="Your message"
                  value={message}
                  onChange={(v) => {
                    setMessage(v);
                    setError(null);
                  }}
                  placeholder="Tell us a little about your idea, occasion, dates…"
                />

                {error && <p className="text-[12px] text-brand-taupe">{error}</p>}

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
                    I agree with the personal data processing policy.
                  </span>
                </label>

                <button
                  type="submit"
                  className="h-12 self-start px-8 bg-brand-gray text-white flex items-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors"
                >
                  Send message
                  <ArrowRight size={16} strokeWidth={1.25} />
                </button>
              </form>
            )}
            </div>
          </div>

          {/* Right: Map */}
          <div className="relative w-full h-[400px] lg:h-auto bg-[#F5F3EF]">
            <iframe
              src="https://yandex.com/map-widget/v1/?ll=69.279700%2C41.311100&z=16&l=map&pt=69.279700,41.311100,pm2rdm"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title="Goodveen Studio Location"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

interface InfoBlockProps { icon: ReactNode; title: string; children: ReactNode }
function InfoBlock({ icon, title, children }: InfoBlockProps) {
  return (
    <div className="flex gap-4 md:gap-5">
      <span className="w-10 h-10 md:w-11 md:h-11 border border-brand-border flex items-center justify-center text-brand-gray shrink-0">
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] tracking-[0.25em] uppercase text-brand-gray-light">{title}</span>
        <div className="text-[18px] md:text-[20px] font-light text-brand-gray leading-[1.4] tracking-[0.01em]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface FieldProps { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }
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

interface TextareaProps { label: string; value: string; onChange: (v: string) => void; placeholder?: string }
function Textarea({ label, value, onChange, placeholder }: TextareaProps) {
  return (
    <label className="w-full px-4 pt-3 pb-3 border border-brand-border bg-white flex flex-col focus-within:border-brand-gray transition-colors">
      <span className="text-[11px] tracking-[0.15em] uppercase text-brand-gray-light">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full outline-none text-[14px] text-brand-gray bg-transparent placeholder:text-brand-gray-light/60 resize-none"
      />
    </label>
  );
}

interface SocialIconProps { href: string; label: string; children: ReactNode }
function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 md:w-11 md:h-11 border border-brand-border text-brand-gray hover:bg-brand-gray hover:text-white hover:border-brand-gray transition-colors flex items-center justify-center"
    >
      {children}
    </a>
  );
}
