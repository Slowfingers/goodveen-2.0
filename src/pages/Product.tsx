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
} from 'lucide-react';
import { useCartUI } from '@/src/components/cart/CartContext';
import { productsApi } from '../lib/api';
import type { Product as ApiProduct, ProductSize } from '../lib/api/types';

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1549007628-9418af83b544?q=80&w=2400&auto=format&fit=crop';

const STATIC_DELIVERY = [
  'Same-day delivery in Tashkent (orders before 14:00)',
  'Hand-delivered in signature Goodveen wrap',
  'Optional handwritten card included',
  'Live tracking via Telegram bot',
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
    'composition',
  );
  const [wishlisted, setWishlisted] = useState(false);
  const cartUI = useCartUI();

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
        setRelated(
          all
            .filter((x) => x.id !== p!.id && x.categoryId === p!.categoryId)
            .slice(0, 4)
            .map((x) => ({
              slug: x.slug,
              title: x.name,
              desc: x.description ?? '',
              img: x.images?.[0]?.url ?? FALLBACK_IMG,
            })),
        );
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
        Loading…
      </div>
    );
  }
  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center gap-4">
        <h2 className="text-[28px] md:text-[40px] font-light tracking-[0.02em] text-brand-gray">
          Product not found
        </h2>
        <Link
          to="/catalog"
          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray"
        >
          ← Back to catalog
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
            {product.category?.name ?? 'Catalog'}
          </Link>
          <ArrowRight size={12} className="mx-3 opacity-50" />
          <span className="text-brand-gray truncate">{product.name}</span>
        </div>
      </div>

      {/* ===== PRODUCT HERO ===== */}
      <section className="w-full border-b border-brand-border">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_560px]">
          {/* Gallery */}
          <div className="relative bg-[#F7F5F2] order-2 lg:order-1">
            <div className="relative w-full h-[420px] md:h-[640px] lg:h-[860px] overflow-hidden">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted((v) => !v)}
                aria-label="Add to wishlist"
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
                aria-label="Previous image"
                onClick={() =>
                  setActiveImg((i) => (i - 1 + images.length) % images.length)
                }
                className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 w-9 h-[80px] border border-white/60 bg-white/70 backdrop-blur-sm flex items-center justify-center"
              >
                <ArrowLeft size={20} strokeWidth={1.25} className="text-brand-gray" />
              </button>
              <button
                aria-label="Next image"
                onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 w-9 h-[80px] border border-white/60 bg-white/70 backdrop-blur-sm flex items-center justify-center"
              >
                <ArrowRight size={20} strokeWidth={1.25} className="text-brand-gray" />
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
          <div className="order-1 lg:order-2 lg:border-l border-brand-border flex flex-col">
            <div className="px-5 md:px-10 py-8 md:py-12 flex flex-col gap-8 md:gap-10 border-b border-brand-border">
              <div className="flex flex-col gap-3 md:gap-4">
                <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
                  {product.category?.name ?? product.flowerTypes[0] ?? 'Arrangement'}
                </span>
                <h1 className="text-[44px] md:text-[64px] leading-[1.05] tracking-[0.01em] font-light text-brand-gray">
                  {product.name}
                </h1>
                <p className="text-[14px] md:text-[15px] leading-[22px] md:leading-[24px] text-brand-gray-light">
                  {product.description}
                </p>
              </div>

              {/* Color */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
                    Palette
                  </span>
                  <span className="text-[12px] text-brand-gray">{color}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => {
                    const active = c === color;
                    return (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        aria-label={c}
                        className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase border transition-all ${
                          active
                            ? 'border-brand-gray bg-brand-gray text-white'
                            : 'border-brand-border text-brand-gray hover:border-brand-gray'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
                    Size
                  </span>
                  <span className="text-[12px] text-brand-gray-light">{activeSize?.height}</span>
                </div>
                <div className="grid grid-cols-4 border border-brand-border">
                  {sizes.map((s) => {
                    const active = s.id === selectedSizeId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSizeId(s.id)}
                        disabled={!s.isAvailable}
                        className={`flex flex-col items-center justify-center gap-1 py-3 md:py-4 border-r last:border-r-0 border-brand-border transition-colors ${
                          !s.isAvailable
                            ? 'opacity-35 cursor-not-allowed text-brand-gray'
                            : active
                            ? 'bg-brand-gray text-white'
                            : 'text-brand-gray hover:bg-brand-border/40'
                        }`}
                      >
                        <span className="text-[18px] md:text-[20px] font-light">{s.name}</span>
                        {s.height && (
                          <span className="text-[10px] md:text-[11px] tracking-[0.15em] uppercase opacity-80">
                            {s.height}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity + Price */}
              <div className="flex items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
                    Quantity
                  </span>
                  <div className="flex items-center border border-brand-border">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-brand-border/40"
                      aria-label="Decrease"
                    >
                      <Minus size={14} strokeWidth={1.5} />
                    </button>
                    <span className="w-12 text-center text-[14px]">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(99, q + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-brand-border/40"
                      aria-label="Increase"
                    >
                      <Plus size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
                    Total
                  </span>
                  <span className="text-[28px] md:text-[32px] font-light leading-none text-brand-gray">
                    {totalPrice.toLocaleString()}<span className="text-brand-gray-light text-[14px] ml-1">000 UZS</span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  to="/cart"
                  className="w-full h-14 bg-brand-gray text-white flex items-center justify-center gap-3 uppercase tracking-[0.25em] text-[12px] hover:bg-black transition-colors"
                >
                  Add to cart
                  <ArrowRight size={16} strokeWidth={1.25} />
                </Link>
                <Link
                  to="/checkout"
                  className="w-full h-14 border border-brand-gray text-brand-gray flex items-center justify-center uppercase tracking-[0.25em] text-[12px] hover:bg-brand-border/40 transition-colors"
                >
                  Buy now
                </Link>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-brand-border">
                <Badge icon={<Sparkles size={16} strokeWidth={1.25} />} label="Hand-arranged" />
                <Badge icon={<Leaf size={16} strokeWidth={1.25} />} label="Fresh daily" />
                <Badge icon={<Truck size={16} strokeWidth={1.25} />} label="Same-day delivery" />
                <Badge icon={<ShieldCheck size={16} strokeWidth={1.25} />} label="Freshness guarantee" />
              </div>
            </div>

            {/* Accordions */}
            <div className="flex flex-col">
              <Accordion
                title="Composition"
                open={openAccordion === 'composition'}
                onClick={() =>
                  setOpenAccordion((v) => (v === 'composition' ? null : 'composition'))
                }
              >
                <ul className="flex flex-col gap-2">
                  {product.composition.map((c) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 text-[14px] text-brand-gray-light"
                    >
                      <Check
                        size={14}
                        strokeWidth={1.5}
                        className="text-brand-taupe mt-1 shrink-0"
                      />
                      {c}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion
                title="Care tips"
                open={openAccordion === 'care'}
                onClick={() => setOpenAccordion((v) => (v === 'care' ? null : 'care'))}
              >
                <ul className="flex flex-col gap-2">
                  {product.careTips.map((c) => (
                    <li key={c} className="text-[14px] text-brand-gray-light">
                      — {c}
                    </li>
                  ))}
                </ul>
              </Accordion>
              <Accordion
                title="Delivery"
                open={openAccordion === 'delivery'}
                onClick={() => setOpenAccordion((v) => (v === 'delivery' ? null : 'delivery'))}
              >
                <ul className="flex flex-col gap-2">
                  {STATIC_DELIVERY.map((c) => (
                    <li key={c} className="text-[14px] text-brand-gray-light">
                      — {c}
                    </li>
                  ))}
                </ul>
              </Accordion>
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
            <span className="text-brand-gray-light text-[12px] ml-1">000 UZS</span>
          </span>
        </div>
        <button
          onClick={cartUI.open}
          className="h-12 px-5 bg-brand-gray text-white flex items-center gap-2 uppercase tracking-[0.2em] text-[12px] hover:bg-black transition-colors shrink-0"
        >
          Add to cart
          <ArrowRight size={16} strokeWidth={1.25} />
        </button>
      </div>

      {/* ===== STORY ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
          <div className="flex flex-col gap-6 md:gap-8">
            <span className="text-[11px] md:text-[12px] tracking-[0.25em] uppercase text-brand-gray-light">
              The Story
            </span>
            <h2 className="text-[40px] md:text-[64px] leading-[1.05] tracking-[0.01em] font-light text-brand-gray">
              Tonal harmony,<br />sculpted by hand.
            </h2>
            <p className="text-[15px] md:text-[16px] leading-[24px] md:leading-[26px] text-brand-gray-light max-w-[520px]">
              {product.description}
            </p>
            <Link
              to="/workshop"
              className="self-start flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors"
            >
              Visit the Workshop
              <ArrowRight size={18} strokeWidth={1.25} />
            </Link>
          </div>
          <div className="relative h-[320px] md:h-[560px] overflow-hidden">
            <img
              src={images[1] ?? images[0]}
              alt="In the interior"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ===== IN INTERIOR ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-[40px] md:text-[64px] font-light leading-[1.05] tracking-[0.01em] text-brand-gray">
              In the interior
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-2">
              How Wild Serenity lives in real spaces
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 md:h-[640px]">
            {images.slice(0, 4).map((img) => (
              <div key={img} className="relative h-[280px] md:h-full overflow-hidden">
                <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RELATED ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[40px] md:text-[64px] font-light leading-[1.05] tracking-[0.01em] text-brand-gray">
                You may also like
              </h2>
              <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-2">
                More from {product.category?.name ?? 'the collection'}
              </p>
            </div>
            <Link
              to="/catalog"
              className="hidden md:flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors"
            >
              Explore the full collection
              <ArrowRight size={18} strokeWidth={1.25} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10 md:h-[480px]">
            {related.map((p) => (
              <Link
                key={p.slug}
                to={`/product/${p.slug}`}
                className="relative group overflow-hidden flex flex-col justify-end p-3 md:p-5 h-[260px] md:h-full"
              >
                <img
                  src={p.img}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <h4 className="relative z-10 text-white text-[11px] md:text-[12px] tracking-[0.2em] uppercase mb-1 md:mb-2 truncate">
                  {p.title}
                </h4>
                <p className="relative z-10 text-white text-[11px] md:text-[12px] leading-[14px] md:leading-[16px] opacity-90 line-clamp-2">
                  {p.desc}
                </p>
              </Link>
            ))}
          </div>
          <Link
            to="/catalog"
            className="md:hidden self-center flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray"
          >
            Explore the full collection
            <ArrowRight size={18} strokeWidth={1.25} />
          </Link>
        </div>
      </section>
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
