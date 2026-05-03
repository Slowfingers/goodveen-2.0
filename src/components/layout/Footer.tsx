import { Link } from 'react-router-dom';
import { Instagram, Send, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-brand-taupe py-[60px] md:py-[120px] px-5 md:px-10 relative overflow-hidden">
      {/* Background pattern placeholder */}
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] z-0 pointer-events-none" />

      <div className="max-w-[1360px] mx-auto flex flex-col gap-10 md:gap-20 relative z-10 items-center md:items-stretch">
        <Link to="/" className="block">
          <img
            src="/logo.png"
            alt="Goodveen"
            className="w-[350px] h-[42px] md:w-[1000px] md:h-[118px] object-contain brightness-0 invert"
          />
        </Link>

        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-10 items-center md:items-stretch w-full">
          <nav className="flex flex-wrap gap-5 md:gap-10 items-center justify-center md:justify-start">
            {[
              { to: '/', label: 'Goodveen' },
              { to: '/catalog', label: 'Catalog' },
              { to: '/events', label: 'Events' },
              { to: '/workshop', label: 'Workshop' },
              { to: '/contact', label: 'Contact us' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-white uppercase tracking-[0.2em] text-[12px] hover:opacity-80 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-5">
            <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full border border-white/80 flex items-center justify-center text-white hover:bg-white hover:text-brand-taupe transition-colors">
              <Instagram size={14} strokeWidth={1.5} />
            </a>
            <a href="#" aria-label="Telegram" className="w-8 h-8 rounded-full border border-white/80 flex items-center justify-center text-white hover:bg-white hover:text-brand-taupe transition-colors">
              <Send size={14} strokeWidth={1.5} />
            </a>
            <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full border border-white/80 flex items-center justify-center text-white hover:bg-white hover:text-brand-taupe transition-colors">
              <Facebook size={14} strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <p className="text-white text-[12px] md:text-[14px] tracking-[0.02em] leading-[16px] max-w-md text-center md:text-left">
          A creative floral studio where design meets emotion — crafting artistic bouquets and bespoke arrangements with a signature touch of style.
        </p>

        <div className="text-white uppercase tracking-[0.2em] text-[12px] md:text-[14px] text-center md:text-left w-full">
          © Goodveen 2026
        </div>
      </div>
    </footer>
  );
}
