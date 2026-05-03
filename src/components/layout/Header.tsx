import { Link, useLocation } from 'react-router-dom';
import { User, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import { useCartUI } from '../cart/CartContext';
import { useAuthUI } from '../auth/AuthContext';

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/', label: 'Goodveen' },
  { to: '/catalog', label: 'Catalog' },
  { to: '/events', label: 'Events' },
  { to: '/workshop', label: 'Workshop' },
  { to: '/contact', label: 'Contact us' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const cartUI = useCartUI();
  const authUI = useAuthUI();
  const heroRoutes = ['/', '/catalog'];
  const isHero = heroRoutes.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const onLight = isScrolled || !isHero;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        onLight ? 'bg-white text-brand-gray border-b border-brand-border' : 'text-white'
      )}
    >
      <div
        className={cn(
          'w-full max-w-[1440px] mx-auto px-5 md:px-10 h-[60px] flex items-stretch',
          !onLight && 'bg-gradient-to-b from-black/40 to-transparent'
        )}
      >
        {/* Desktop nav */}
        <nav className="hidden md:flex h-full items-stretch w-full">
          {NAV_ITEMS.map((item) => {
            // Goodveen (home) entry never shows an active state — it acts as the brand link.
            const active =
              item.to === '/' ? false : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex-1 h-full flex items-center justify-center uppercase tracking-[0.2em] text-[12px] transition-colors',
                  active
                    ? 'bg-white text-brand-gray'
                    : onLight
                    ? 'hover:bg-brand-border'
                    : 'hover:bg-white/10'
                )}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="w-px self-stretch bg-current opacity-20" />
          <button
            className={cn(
              'w-[60px] h-full flex items-center justify-center uppercase tracking-[0.2em] text-[12px] transition-colors',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
          >
            RU
          </button>
          <div className="w-px self-stretch bg-current opacity-20" />
          <button
            onClick={() => authUI.open('login')}
            className={cn(
              'w-[60px] h-full flex items-center justify-center transition-colors',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Account"
          >
            <User size={20} strokeWidth={1.25} />
          </button>
          <div className="w-px self-stretch bg-current opacity-20" />
          <button
            onClick={cartUI.open}
            className={cn(
              'w-[60px] h-full flex items-center justify-center transition-colors',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.25} />
          </button>
        </nav>

        {/* Mobile bar */}
        <div className="flex md:hidden h-full w-full items-stretch">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className={cn(
              'flex-1 h-full flex items-center justify-start gap-3 uppercase tracking-[0.2em] text-[12px]',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
            <span>Menu</span>
          </button>
          <div className="w-px self-stretch bg-current opacity-20" />
          <button
            onClick={() => authUI.open('login')}
            className={cn(
              'w-[56px] h-full flex items-center justify-center',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Account"
          >
            <User size={20} strokeWidth={1.25} />
          </button>
          <div className="w-px self-stretch bg-current opacity-20" />
          <button
            onClick={cartUI.open}
            className={cn(
              'w-[56px] h-full flex items-center justify-center',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Cart"
          >
            <ShoppingBag size={20} strokeWidth={1.25} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white text-brand-gray border-b border-brand-border">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item) => {
              const active =
                item.to === '/' ? false : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'h-[56px] px-5 flex items-center uppercase tracking-[0.2em] text-[12px] border-b border-brand-border',
                    active && 'bg-brand-border'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <button className="h-[56px] px-5 flex items-center uppercase tracking-[0.2em] text-[12px] text-left">
              RU
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
