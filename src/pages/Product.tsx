import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Heart,
  Plus,
  Minus,
  Check,
  Truck,
  Sparkles,
  Leaf,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useCartUI } from '@/src/components/cart/CartContext';
import { productsApi } from '../lib/api';
import type { Product as ApiProduct, ProductSize } from '../lib/api/types';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1549007628-9418af83b544?q=80&w=2400&auto=format&fit=crop';

const STATIC_DELIVERY = [
  'Доставка в день заказа по Ташкенту (заказы до 14:00)',
  'Доставка вручную в фирменной упаковке Goodveen',
  'Опциональная рукописная открытка',
  'Отслеживание в реальном времени через Telegram бот',
];

interface RelatedItem {
  slug: string;
  title: string;
  desc: string;
  img: string;
}

export function Product() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [color, setColor] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<'composition' | 'care' | 'delivery' | null>(
    'care',
  );
  const [wishlisted, setWishlisted] = useState(false);
  const cartUI = useCartUI();

  const addToCart = () => {
    if (!product || !activeSize) return;
    cartUI.addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      size: activeSize.name,
      qty: qty,
      price: activeSize.price,
      img: images[0],
    });
    cartUI.open();
  };

  useEffect(() => {
    document.title = product ? `Goodveen - ${product.name}` : 'Goodveen - Товар';
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setNotFound(false);
    setActiveImg(0);
    (async () => {
      try {
        let p: ApiProduct | null = null;
        try {
          p = await productsApi.getBySlug(id);
        } catch {
          try {
            p = await productsApi.getById(id);
          } catch {
            p = null;
          }
        }
        if (!active) return;
        if (!p) { setNotFound(true); return; }
        setProduct(p);
        const availableSize = p.sizes?.find((s) => s.isAvailable) ?? p.sizes?.[0];
        if (availableSize) setSelectedSizeId(availableSize.id);
        if (p.colors?.[0]) setColor(p.colors[0]);

        const all = await productsApi.list({ onlyActive: true });
        if (!active) return;
        
        // Find products with similar colors (color palette recommendations)
        const colorMatches = all
          .filter((x) => x.id !== p!.id)
          .map((x) => {
            const matchingColors = x.colors?.filter((c) => p!.colors?.includes(c)) ?? [];
            return { product: x, matchCount: matchingColors.length };
          })
          .filter((x) => x.matchCount > 0)
          .sort((a, b) => b.matchCount - a.matchCount)
          .slice(0, 8)
          .map((x) => ({
            slug: x.product.slug,
            title: x.product.name,
            desc: x.product.description ?? '',
            img: x.product.images?.[0]?.url ?? FALLBACK_IMG,
          }));
        
        setRelated(colorMatches);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  const images = useMemo(
    () => (product?.images?.length ? product.images.map((i) => i.url) : [FALLBACK_IMG]),
    [product],
  );
  const sizes: ProductSize[] = useMemo(
    () => product?.sizes?.slice().sort((a, b) => a.sortOrder - b.sortOrder) ?? [],
    [product],
  );
  const activeSize = sizes.find((s) => s.id === selectedSizeId) ?? sizes[0];
  const totalPrice = (activeSize?.price ?? 0) * qty;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
        Загрузка…
      </div>
    );
  }
  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center gap-4">
        <h2 className="text-[28px] md:text-[40px] font-light tracking-[0.02em] text-brand-gray">
          Товар не найден
        </h2>
        <Link
          to="/catalog"
          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray"
        >
          ← Вернуться в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white pb-[80px] lg:pb-0">
      {/* ===== TOP BAR (breadcrumbs) ===== */}
      <div className="w-full border-b border-brand-border pt-[60px]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-[56px] flex items-center text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
          <Link to="/" className="hover:text-brand-gray transition-colors">
            Goodveen
          </Link>
          <ArrowRight size={12} className="mx-3 opacity-50" />
          <Link to="/catalog" className="hover:text-brand-gray transition-colors">
            {product.category?.name ?? 'Каталог'}
          </Link>
          <ArrowRight size={12} className="mx-3 opacity-50" />
          <span className="text-brand-gray truncate">{product.name}</span>
        </div>
      </div>

      {/* ===== PRODUCT HERO ===== */}
      <section className="w-full border-b border-brand-border">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
          {/* Gallery */}
          <div className="relative bg-[#F7F5F2] order-1 lg:order-1 lg:flex-1">
            <div className="relative w-full h-[420px] md:h-[640px] lg:h-[1000px] overflow-hidden">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted((v) => !v)}
                aria-label="Добавить в избранное"
                className="absolute top-5 right-5 md:top-8 md:right-8 w-12 h-12 bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart
                  size={20}
                  strokeWidth={1.25}
                  className={wishlisted ? 'fill-brand-taupe text-brand-taupe' : 'text-brand-gray'}
                />
              </button>

              {/* Arrows (mobile) */}
              <button
                aria-label="Предыдущее изображение"
                onClick={() =>
                  setActiveImg((i) => (i - 1 + images.length) % images.length)
                }
                className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[60px] flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <svg width="16" height="41" viewBox="0 0 16 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6094 0.286621L0.609375 20.2864L14.6094 40.2866" stroke="#D0D0D0"/>
                </svg>
              </button>
              <button
                aria-label="Следующее изображение"
                onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 w-8 h-[60px] flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <svg width="16" height="41" viewBox="0 0 16 41" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
                  <path d="M14.6094 0.286621L0.609375 20.2864L14.6094 40.2866" stroke="#D0D0D0"/>
                </svg>
              </button>

              {/* Counter */}
              <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8 text-[11px] md:text-[12px] tracking-[0.25em] text-white uppercase mix-blend-difference">
                {String(activeImg + 1).padStart(2, '0')} /{' '}
                {String(images.length).padStart(2, '0')}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 p-3 md:p-5 bg-white border-t border-brand-border">
              {images.map((img, idx) => (
                <button
                  key={img}
                  onClick={() => setActiveImg(idx)}
                  className={`relative h-[70px] md:h-[110px] overflow-hidden border transition-colors ${
                    activeImg === idx ? 'border-brand-gray' : 'border-transparent hover:border-brand-border'
                  }`}
                >
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info column */}
          <div className="order-2 lg:order-2 lg:border-l border-brand-border flex flex-col lg:w-[600px] lg:flex-shrink-0">
            <div className="px-5 md:px-10 py-8 md:py-[80px] flex flex-col gap-5 border-b border-brand-border">

              {/* 1. Название + описание */}
              <div className="flex flex-col gap-5">
                <h1 className="text-[40px] md:text-[48px] leading-[1.0] tracking-[0.02em] font-light text-brand-gray">
                  {product.name}
                </h1>
                <p className="text-[14px] md:text-[16px] leading-[22px] text-brand-gray">
                  {product.description}
                </p>
              </div>

              {/* 2. Аккордеон «Состав» */}
              <div className="border border-[#D0D0D0]">
                <button
                  onClick={() => setOpenAccordion((v) => (v === 'composition' ? null : 'composition'))}
                  className="w-full px-5 h-[60px] md:h-[80px] flex items-center justify-between"
                >
                  <span className="text-[20px] md:text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">
                    Состав
                  </span>
                  <span className="text-[#D0D0D0]">
                    {openAccordion === 'composition'
                      ? <Minus size={20} strokeWidth={1} />
                      : <Plus size={20} strokeWidth={1} />}
                  </span>
                </button>
                {openAccordion === 'composition' && (
                  <div className="px-5 pb-5">
                    <ul className="flex flex-col gap-2">
                      {product.composition.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-[14px] md:text-[16px] leading-[22px] text-brand-gray">
                          <Check size={14} strokeWidth={1.5} className="text-brand-taupe mt-1 shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 3. Аккордеон «Советы по уходу» */}
              <div className="border border-[#D0D0D0]">
                <button
                  onClick={() => setOpenAccordion((v) => (v === 'care' ? null : 'care'))}
                  className="w-full px-5 h-[60px] md:h-[80px] flex items-center justify-between"
                >
                  <span className="text-[20px] md:text-[24px] leading-[32px] tracking-[0.02em] text-brand-gray">
                    Советы по уходу
                  </span>
                  <span className="text-[#D0D0D0]">
                    {openAccordion === 'care'
                      ? <Minus size={20} strokeWidth={1} />
                      : <Plus size={20} strokeWidth={1} />}
                  </span>
                </button>
                {openAccordion === 'care' && (
                  <div className="px-5 pb-5">
                    <ul className="flex flex-col gap-2">
                      {product.careTips.length > 0
                        ? product.careTips.map((c) => (
                            <li key={c} className="text-[14px] md:text-[16px] leading-[22px] text-brand-gray">{c}</li>
                          ))
                        : STATIC_DELIVERY.map((c) => (
                            <li key={c} className="text-[14px] md:text-[16px] leading-[22px] text-brand-gray">{c}</li>
                          ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 4. Бейджи */}
              <div className="flex flex-col gap-3">
                <Badge icon={<Sparkles size={16} strokeWidth={1.25} />} label="Ручная работа" />
                <Badge icon={<Leaf size={16} strokeWidth={1.25} />} label="Свежие ежедневно" />
                <Badge icon={<Truck size={16} strokeWidth={1.25} />} label="Доставка в день заказа" />
                <Badge icon={<ShieldCheck size={16} strokeWidth={1.25} />} label="Собственный сад" />
              </div>

              {/* 5. Карточки размеров */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map((s) => {
                    const active = s.id === selectedSizeId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSizeId(s.id)}
                        disabled={!s.isAvailable}
                        className={`flex flex-col items-center justify-center gap-1 py-4 transition-all ${
                          !s.isAvailable
                            ? 'opacity-35 cursor-not-allowed border border-[#EEEEEE]'
                            : active
                            ? 'border-2 border-[#303030] bg-white'
                            : 'border border-[#EEEEEE] hover:border-[#D0D0D0]'
                        }`}
                      >
                        <span className={`text-[18px] md:text-[20px] leading-[26px] tracking-[0.02em] ${
                          active ? 'text-brand-gray' : 'text-brand-gray'
                        }`}>{s.name}</span>
                        <span className={`text-[14px] md:text-[16px] leading-[22px] tracking-[0.02em] ${
                          active ? 'text-brand-gray' : 'text-[#808080]'
                        }`}>
                          {s.price.toLocaleString()}
                        </span>
                        {s.height && (
                          <span className="text-[11px] md:text-[12px] tracking-[0.02em] text-[#808080]">
                            {s.height}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 6. Кнопка добавить в корзину */}
                <button
                  onClick={addToCart}
                  className="w-full h-14 bg-[#303030] text-white flex items-center justify-center uppercase tracking-[0.2em] text-[14px] hover:bg-black transition-colors"
                >
                  Добавить в корзину
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE STICKY ADD TO CART ===== */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-brand-border px-4 py-3 flex items-center gap-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)]">
        <div className="flex-1 flex flex-col leading-tight min-w-0">
          <span className="text-[10px] tracking-[0.2em] uppercase text-brand-gray-light truncate">
            {product.name}{activeSize ? ` · ${activeSize.name}` : ''}
          </span>
          <span className="text-[18px] font-light text-brand-gray">
            {totalPrice.toLocaleString()}
            <span className="text-brand-gray-light text-[12px] ml-1">сум</span>
          </span>
        </div>
        <button
          onClick={addToCart}
          className="h-12 px-5 bg-brand-gray text-white flex items-center gap-2 uppercase tracking-[0.2em] text-[12px] hover:bg-black transition-colors shrink-0"
        >
          Добавить в корзину
          <ShoppingBag size={16} strokeWidth={1.25} />
        </button>
      </div>

      {/* ===== COMPLEMENTARY (Эта коллекция идеально дополняет) ===== */}
      {related.length > 0 && (
        <section className="w-full px-5 md:px-10 py-[40px] border-b border-brand-border">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-10">
            {/* 3 small cards */}
            <div className="flex flex-row gap-0 flex-shrink-0">
              {related.slice(0, 3).map((p) => (
                <Link
                  key={p.slug}
                  to={`/product/${p.slug}`}
                  className="relative flex flex-col justify-end p-5 gap-2 w-[200px] md:w-[280px] h-[280px] overflow-hidden group flex-shrink-0"
                >
                  <img
                    src={p.img}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/48 via-transparent to-transparent" />
                  <h4 className="relative z-10 text-white text-[12px] md:text-[14px] tracking-[0.2em] uppercase truncate">
                    {p.title}
                  </h4>
                  <p className="relative z-10 text-white text-[11px] md:text-[12px] leading-[14px] opacity-90 line-clamp-2">
                    {p.desc}
                  </p>
                </Link>
              ))}
            </div>
            {/* Text */}
            <h3 className="text-[28px] md:text-[36px] leading-[1.0] tracking-[0.02em] text-brand-gray">
              Эта коллекция идеально дополняет
            </h3>
          </div>
        </section>
      )}

      {/* ===== RELATED (Color Palette Recommendations) ===== */}
      {related.length > 0 && (
        <section className="w-full px-5 md:px-10 py-[80px]">
          <div className="max-w-[1440px] mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-[40px] md:text-[48px] leading-[1.0] tracking-[0.02em] text-brand-gray">
                Похожая цветовая палитра
              </h2>
              <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase">
                Товары с теми же оттенками
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 h-auto md:h-[400px]">
              {related.map((p, idx) => {
                const hasBorder = idx % 2 === 0;
                return hasBorder ? (
                  <Link
                    key={p.slug}
                    to={`/product/${p.slug}`}
                    className="group flex flex-col border border-brand-gray/30 overflow-hidden h-[340px] md:h-full"
                  >
                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={p.img}
                        alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 flex flex-col gap-2 border-t border-brand-gray/30">
                      <h4 className="text-[12px] md:text-[14px] tracking-[0.2em] uppercase text-brand-gray truncate">
                        {p.title}
                      </h4>
                      <p className="text-[11px] md:text-[12px] leading-[14px] text-brand-gray line-clamp-2">
                        {p.desc}
                      </p>
                    </div>
                  </Link>
                ) : (
                  <Link
                    key={p.slug}
                    to={`/product/${p.slug}`}
                    className="relative group overflow-hidden flex flex-col justify-end p-5 h-[340px] md:h-full"
                  >
                    <img
                      src={p.img}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <h4 className="relative z-10 text-white text-[12px] md:text-[14px] tracking-[0.2em] uppercase mb-2 truncate">
                      {p.title}
                    </h4>
                    <p className="relative z-10 text-white text-[11px] md:text-[12px] leading-[14px] opacity-90 line-clamp-2">
                      {p.desc}
                    </p>
                  </Link>
                );
              })}
            </div>
            <Link
              to="/catalog"
              className="self-start flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors"
            >
              Смотреть всю коллекцию
              <ArrowRight size={18} strokeWidth={1.25} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

interface BadgeProps { icon: ReactNode; label: string }
function Badge({ icon, label }: BadgeProps) {
  return (
    <div className="flex items-center gap-3 text-brand-gray">
      <span className="text-brand-taupe">{icon}</span>
      <span className="text-[12px] tracking-[0.05em]">{label}</span>
    </div>
  );
}

interface AccordionProps {
  title: string;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
}
function Accordion({ title, open, onClick, children }: AccordionProps) {
  return (
    <div className="border-b border-brand-border last:border-b-0">
      <button
        onClick={onClick}
        className="w-full px-5 md:px-10 h-[64px] md:h-[72px] flex items-center justify-between text-left hover:bg-brand-border/30 transition-colors"
      >
        <span className="text-[16px] md:text-[18px] font-light text-brand-gray tracking-[0.02em]">
          {title}
        </span>
        <span className="text-brand-gray-light">
          {open ? <Minus size={18} strokeWidth={1.25} /> : <Plus size={18} strokeWidth={1.25} />}
        </span>
      </button>
      {open && (
        <div className="px-5 md:px-10 pb-6 md:pb-8 pt-1">{children}</div>
      )}
    </div>
  );
}
