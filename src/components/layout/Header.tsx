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
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className={cn(
              'flex-1 h-full flex items-center justify-start gap-3 uppercase tracking-[0.2em] text-[12px] border-r',
              onLight ? 'border-[#EEEEEE]' : 'border-white/20',
              onLight ? 'hover:bg-brand-border' : 'hover:bg-white/10'
            )}
          >
            {mobileOpen ? <X size={20} strokeWidth={1.25} /> : <Menu size={20} strokeWidth={1.25} />}
            <span>Menu</span>
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
              'w-[56px] h-full flex items-center justify-center border-r',
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
              
              if (item.to === '/catalog') {
                return (
                  <div key={item.to}>
                    <button
                      onClick={() => setCatalogOpen(!catalogOpen)}
                      className={cn(
                        'w-full h-[56px] px-5 flex items-center justify-between uppercase tracking-[0.2em] text-[12px] border-b border-brand-border',
                        active && 'bg-brand-border'
                      )}
                    >
                      {item.label}
                      <ChevronDown size={14} className={cn('transition-transform', catalogOpen && 'rotate-180')} />
                    </button>
                    {catalogOpen && (
                      <div className="bg-brand-border/30">
                        <Link
                          to="/catalog"
                          className="block h-[48px] px-8 flex items-center text-[11px] tracking-[0.2em] uppercase border-b border-brand-border"
                        >
                          Все товары
                        </Link>
                        {categories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/catalog?category=${cat.slug}`}
                            className="block h-[48px] px-8 flex items-center text-[11px] tracking-[0.2em] uppercase border-b border-brand-border last:border-b-0"
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
