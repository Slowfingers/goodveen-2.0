import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import { useCartUI } from '../cart/CartContext';
import { useAuthUI, useAuth } from '../auth/AuthContext';
import { categoriesApi } from '@/src/lib/api';
import type { Category } from '@/src/lib/api/types';

const NAV_ITEMS: { to: string; label: string }[] = [
  { to: '/', label: 'Goodveen' },
  { to: '/catalog', label: 'Каталог' },
  { to: '/events', label: 'События' },
  { to: '/workshop', label: 'Мастерская' },
  { to: '/contact', label: 'Контакты' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const cartUI = useCartUI();
  const authUI = useAuthUI();
  const { user } = useAuth();
  const heroRoutes = ['/', '/catalog'];
  const isHero = heroRoutes.includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    categoriesApi.list(true).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setCatalogOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const onLight = isScrolled || !isHero;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        onLight ? 'bg-white text-brand-gray' : 'text-white'
      )}
    >
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-px',
        onLight ? 'bg-[#EEEEEE]' : 'bg-white/20'
      )} />
      <div
        className={cn(
          'w-full h-[60px] flex items-stretch',
          !onLight && 'bg-gradient-to-b from-black/40 to-transparent'
        )}
      >
        {/* Desktop nav */}
        <nav className="hidden md:flex h-full items-stretch w-full">
          {NAV_ITEMS.map((item, index) => {
            // Goodveen (home) entry never shows an active state — it acts as the brand link.
            const active =
              item.to === '/' ? false : location.pathname.startsWith(item.to);
            const isLast = index === NAV_ITEMS.length - 1;
            
            if (item.to === '/catalog') {
              return (
                <div key={item.to} className="flex-1 h-full relative">
                  <button
                    onClick={() => setCatalogOpen(!catalogOpen)}
                    className={cn(
                      'w-full h-full flex items-center justify-center gap-1 uppercase tracking-[0.2em] text-[12px] transition-colors border-r',
                      onLight ? 'border-[#EEEEEE]' : 'border-white/20',
                      active
                        ? 'bg-white text-brand-gray'
                        : onLight
                        ? 'hover:bg-brand-border'
                        : 'hover:bg-white/10'
                    )}
                  >
                    {item.label}
                    <ChevronDown size={14} className={cn('transition-transform', catalogOpen && 'rotate-180')} />
                  </button>
                  {catalogOpen && (
                    <div className="absolute top-full left-0 right-0 bg-white text-brand-gray shadow-lg z-50 border-t border-brand-border">
                      <Link
                        to="/catalog"
                        className="block px-5 py-3 text-[12px] tracking-[0.2em] uppercase hover:bg-brand-border transition-colors border-b border-brand-border"
                      >
                        Все товары
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/catalog?category=${cat.slug}`}
                          className="block px-5 py-3 text-[12px] tracking-[0.2em] uppercase hover:bg-brand-border transition-colors border-b border-brand-border last:border-b-0"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex-1 h-full flex items-center justify-center uppercase tracking-[0.2em] text-[12px] transition-colors border-r',
                  onLight ? 'border-[#EEEEEE]' : 'border-white/20',
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

          <button
            className={cn(
              'w-[60px] h-full flex items-center justify-center uppercase tracking-[0.2em] text-[12px] transition-colors border-r',
              onLight ? 'border-[#EEEEEE]' : 'border-white/20',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
          >
            RU
          </button>
          <button
            onClick={() => {
              if (user) {
                navigate('/cabinet');
              } else {
                authUI.open('login');
              }
            }}
            className={cn(
              'w-[60px] h-full flex items-center justify-center transition-colors border-r',
              onLight ? 'border-[#EEEEEE]' : 'border-white/20',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Account"
          >
            <User size={20} strokeWidth={1.25} />
          </button>
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
          {/* Logo */}
          <Link
            to="/"
            className={cn(
              'flex-1 h-full flex items-center px-5 uppercase tracking-[0.2em] text-[12px]',
              onLight ? 'text-brand-gray' : 'text-white'
            )}
          >
            Goodveen
          </Link>
          {/* Cart */}
          <button
            onClick={cartUI.open}
            className={cn(
              'w-[56px] h-full flex items-center justify-center border-x',
              onLight ? 'border-[#EEEEEE]' : 'border-white/20',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Корзина"
          >
            <ShoppingBag size={20} strokeWidth={1.25} />
          </button>
          {/* Account */}
          <button
            onClick={() => { if (user) { navigate('/cabinet'); } else { authUI.open('login'); } }}
            className={cn(
              'w-[56px] h-full flex items-center justify-center border-r',
              onLight ? 'border-[#EEEEEE]' : 'border-white/20',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
            aria-label="Аккаунт"
          >
            <User size={20} strokeWidth={1.25} />
          </button>
          {/* Burger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Меню"
            className={cn(
              'w-[56px] h-full flex items-center justify-center border-r',
              onLight ? 'border-[#EEEEEE]' : 'border-white/20',
              mobileOpen ? 'bg-white text-brand-gray' : onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
          </button>
        </div>
      </div>

      {/* Mobile overlay (click outside to close) */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-[56px] z-40 bg-black/30"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white text-brand-gray shadow-[0px_40px_80px_rgba(0,0,0,0.32)] z-50">
          <div className="flex flex-col gap-10 p-10">
            {/* Language switcher */}
            <div className="flex items-center gap-[60px] pb-5 border-b border-[#D0D0D0]">
              <button className="text-[12px] tracking-[0.2em] uppercase text-[#BABABA]">Рус</button>
              <button className="text-[12px] tracking-[0.2em] uppercase text-brand-gray">ENG</button>
              <button className="text-[12px] tracking-[0.2em] uppercase text-brand-gray">O'zB</button>
            </div>

            {/* Catalog expandable */}
            <div className="flex flex-col gap-5">
              <div className="bg-[#F6F6F6] px-4 py-3">
                <button
                  onClick={() => setCatalogOpen(!catalogOpen)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="text-[16px] tracking-[0.02em] text-brand-gray">Каталог</span>
                  <ChevronDown size={20} strokeWidth={1} className={cn('text-brand-gray transition-transform', catalogOpen && 'rotate-180')} />
                </button>
                {catalogOpen && (
                  <div className="mt-3 flex flex-col gap-2">
                    <Link to="/catalog" className="text-[14px] tracking-[0.02em] text-brand-gray py-1">
                      Все товары
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/catalog?category=${cat.slug}`}
                        className="text-[14px] tracking-[0.02em] text-brand-gray py-1"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Nav links */}
              <div className="flex flex-col items-center gap-10">
                <Link to="/events" className="text-[14px] tracking-[0.2em] uppercase text-brand-gray">
                  События
                </Link>
                <Link to="/workshop" className="text-[14px] tracking-[0.2em] uppercase text-brand-gray">
                  Мастерская
                </Link>
                <Link to="/contact" className="text-[14px] tracking-[0.2em] uppercase text-brand-gray">
                  Контакты
                </Link>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-10">
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center text-brand-gray">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="6" y="6" width="20" height="20" rx="5" stroke="#303030" strokeWidth="1.5"/><circle cx="16" cy="16" r="5" stroke="#303030" strokeWidth="1.5"/><circle cx="22" cy="10" r="1" fill="#303030"/></svg>
              </a>
              <a href="#" aria-label="Telegram" className="w-8 h-8 flex items-center justify-center text-brand-gray">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M26 7L5 15.5L13 17.5L17 25L20 18L26 7Z" stroke="#303030" strokeWidth="1.5" strokeLinejoin="round"/><path d="M13 17.5L17 21.5" stroke="#303030" strokeWidth="1.5"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center text-brand-gray">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M18 6H15C13.3 6 12 7.3 12 9V13H9V17H12V26H16V17H19L20 13H16V9C16 8.4 16.4 8 17 8H20V6H18Z" stroke="#303030" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
