import { useEffect, useState } from 'react';
import { Clock, MapPin, Phone, Instagram, Send, Facebook } from 'lucide-react';
import { pagesApi } from '../lib/api';

export function Contact() {
  useEffect(() => {
    document.title = 'Goodveen - Контакты';
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [contactData, setContactData] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pagesApi.getContact().then(setContactData).catch(console.error);
  }, []);

  const submit = () => {
    if (name.trim().length < 2) return setError('Enter your name');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Enter a valid email');
    if (message.trim().length < 5) return setError('Tell us a little more');
    setError(null);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative h-[480px] md:h-[680px] -mt-[60px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=2400&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col px-5 md:px-10 py-10 md:py-20 gap-2">
          <h1 className="text-[48px] md:text-[80px] leading-[48px] md:leading-[80px] tracking-[0.02em] text-white">Contact us</h1>
          <p className="text-[14px] leading-[16px] tracking-[0.2em] uppercase text-white">Get in touch</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full flex justify-center bg-white py-10 md:py-20 px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col md:flex-row gap-10 md:gap-5">
          {/* Left Column: Contact Info + Form */}
          <div className="flex flex-col gap-10 w-full md:w-[560px] md:shrink-0">
            {/* Contact Info */}
            <div className="flex flex-col gap-5">
              {/* Address */}
              <div className="flex items-center gap-4">
                <MapPin size={32} strokeWidth={1.25} className="text-[#D0D0D0] flex-shrink-0" />
                <span className="text-[16px] md:text-[20px] leading-[22px] md:leading-[26px] tracking-[0.02em] text-[#303030]">Tashkent, Uzbekiston Ovozi st., 2/1</span>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-4">
                <Phone size={32} strokeWidth={1.25} className="text-[#D0D0D0] flex-shrink-0" />
                <div className="flex flex-col gap-3">
                  <a href="tel:+998712339780" className="text-[16px] md:text-[20px] leading-[22px] md:leading-[26px] tracking-[0.02em] text-[#303030] hover:text-[#F5A5C8] transition-colors">+998 71 233 97 80</a>
                  <a href="tel:+998999559090" className="text-[16px] md:text-[20px] leading-[22px] md:leading-[26px] tracking-[0.02em] text-[#303030] hover:text-[#F5A5C8] transition-colors">+998 99 955 90 90</a>
                  <a href="tel:+998711200604" className="text-[16px] md:text-[20px] leading-[22px] md:leading-[26px] tracking-[0.02em] text-[#303030] hover:text-[#F5A5C8] transition-colors">+998 71 120 06 04</a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-4">
                <Clock size={32} strokeWidth={1.25} className="text-[#D0D0D0] flex-shrink-0" />
                <span className="text-[16px] md:text-[20px] leading-[22px] md:leading-[26px] tracking-[0.02em] text-[#303030]">Every day · 09:00 — 21:00</span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-5 pl-12">
                {contactData?.instagram && (
                  <a href={contactData.instagram} target="_blank" rel="noopener noreferrer" className="text-[#303030] hover:text-[#F5A5C8] transition-colors">
                    <Instagram size={32} strokeWidth={1.25} />
                  </a>
                )}
                {contactData?.telegram && (
                  <a href={contactData.telegram} target="_blank" rel="noopener noreferrer" className="text-[#303030] hover:text-[#F5A5C8] transition-colors">
                    <Send size={32} strokeWidth={1.25} />
                  </a>
                )}
                {contactData?.facebook && (
                  <a href={contactData.facebook} target="_blank" rel="noopener noreferrer" className="text-[#303030] hover:text-[#F5A5C8] transition-colors">
                    <Facebook size={32} strokeWidth={1.25} />
                  </a>
                )}
              </div>
            </div>

            {/* Map (Mobile only) */}
            <div className="md:hidden w-full h-[400px] bg-[#F6F6F6] relative overflow-hidden">
              <iframe src="https://yandex.uz/map-widget/v1/?ll=69.285971%2C41.310924&mode=poi&poi%5Bpoint%5D=69.286308%2C41.310684&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D25254128497&z=17" width="100%" height="100%" style={{ border: 0 }} allowFullScreen title="Goodveen Location" />
            </div>

            {/* Contact Form */}
            <div className="flex flex-col gap-5 p-5 md:p-10 bg-[#F6F6F6]">
              <h2 className="text-[24px] leading-[32px] tracking-[0.02em] text-[#303030]">Drop us a line</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col justify-center px-4 py-2 h-14 bg-white border border-[#EEEEEE]">
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(null); }} className="text-[14px] leading-[16px] tracking-[0.02em] text-[#303030] bg-transparent outline-none placeholder:text-[#808080]" placeholder="Your name" />
                </div>
                <div className="flex flex-col justify-center px-4 py-2 h-14 bg-white border border-[#EEEEEE]">
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(null); }} className="text-[14px] leading-[16px] tracking-[0.02em] text-[#303030] bg-transparent outline-none placeholder:text-[#808080]" placeholder="Email" />
                </div>
                <div className="flex flex-col justify-center px-4 py-2 h-14 bg-white border border-[#EEEEEE]">
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-[14px] leading-[16px] tracking-[0.02em] text-[#303030] bg-transparent outline-none placeholder:text-[#808080]" placeholder="Phone number" />
                </div>
                <div className="flex flex-col px-4 py-3 h-[120px] bg-white border border-[#EEEEEE]">
                  <textarea value={message} onChange={(e) => { setMessage(e.target.value); setError(null); }} className="flex-1 text-[14px] leading-[16px] tracking-[0.02em] text-[#303030] bg-transparent outline-none resize-none placeholder:text-[#808080]" placeholder="Your message" />
                </div>
                {error && <p className="text-[12px] text-red-500">{error}</p>}
                <button onClick={submit} disabled={!name || !email || !message} className="w-full md:w-fit h-14 px-10 bg-[#303030] text-white text-[14px] leading-[16px] tracking-[0.2em] uppercase hover:bg-[#404040] transition-colors disabled:bg-[#D0D0D0] disabled:cursor-not-allowed">
                  {sent ? 'Message sent!' : 'Send message'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Map (Desktop only) */}
          <div className="hidden md:flex flex-1 min-h-[500px] bg-[#F6F6F6] relative overflow-hidden">
            <iframe src="https://yandex.uz/map-widget/v1/?ll=69.285971%2C41.310924&mode=poi&poi%5Bpoint%5D=69.286308%2C41.310684&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D25254128497&z=17" width="100%" height="100%" style={{ border: 0 }} allowFullScreen title="Goodveen Location" className="absolute inset-0" />
          </div>
        </div>
      </section>
    </div>
  );
}
