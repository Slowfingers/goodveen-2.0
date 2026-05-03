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
      <section className="relative w-full h-[420px] md:h-[640px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1549420078-d4469796bb82?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-black/70 to-transparent" />

        <div className="h-[84px]" />
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-16 flex flex-col items-center text-center gap-4 md:gap-6">
          <span className="text-white/85 text-[11px] md:text-[12px] tracking-[0.25em] uppercase">
            Get in touch
          </span>
          <h1 className="text-white text-[48px] md:text-[80px] leading-none tracking-[0.02em] font-light">
            Contact us
          </h1>
          <p className="text-white/85 text-[14px] md:text-[16px] max-w-[640px]">
            Questions, custom orders, partnerships — we read every message and respond within a day.
          </p>
        </div>
      </section>

      {/* ===== INFO + FORM ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] grid grid-cols-1 lg:grid-cols-[1fr_540px] gap-12 lg:gap-20">
          {/* Info column */}
          <div className="flex flex-col gap-10 md:gap-12">
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
            <div className="flex flex-col gap-4 pt-4 border-t border-brand-border">
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

          {/* Form column */}
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
                className="w-full bg-brand-border/30 p-6 md:p-10 flex flex-col gap-5 md:gap-6 border border-brand-border"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                    Drop us a line
                  </span>
                  <h2 className="text-[28px] md:text-[36px] font-light leading-[1.1] tracking-[0.01em] text-brand-gray">
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
      </section>

      {/* ===== MAP ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                Visit us
              </span>
              <h2 className="text-[32px] md:text-[48px] font-light leading-[1.05] tracking-[0.01em] text-brand-gray mt-2">
                Find the studio
              </h2>
            </div>
            <a
              href="https://maps.google.com/?q=Tashkent+Mirobod"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors"
            >
              Open in Maps
              <ArrowRight size={16} strokeWidth={1.25} />
            </a>
          </div>
          <div className="relative w-full h-[320px] md:h-[560px] overflow-hidden border border-brand-border bg-brand-border/30">
            <img
              src="https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=2400&auto=format&fit=crop"
              alt="Studio location"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
              <span className="w-12 h-12 rounded-full bg-brand-gray flex items-center justify-center text-white shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                <MapPin size={20} strokeWidth={1.25} />
              </span>
              <span className="bg-white text-brand-gray text-[12px] tracking-[0.15em] uppercase px-3 py-1.5">
                Goodveen Atelier
              </span>
            </div>
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
