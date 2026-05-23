import { useEffect, useState, useRef } from 'react';
import { ArrowRight, ShoppingBag, VolumeX, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesApi, productsApi, eventsApi, pagesApi } from '../lib/api';
import type { Category, Product as ApiProduct, Event, PageSetting } from '../lib/api/types';
import { useCartUI } from '../components/cart/CartContext';

type FeaturedProduct = { slug: string; name: string; description: string; img: string };

function formatEventDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [highlights, setHighlights] = useState<Event[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const [cats, prods, evts] = await Promise.all([
        categoriesApi.list(true).catch(() => [] as Category[]),
        productsApi.list({ onlyActive: true }).catch(() => [] as ApiProduct[]),
        eventsApi.list({ onlyPublished: true }).catch(() => [] as Event[]),
      ]);
      if (cats.length) setCategories(cats);
      if (prods.length)
        setFeaturedProducts(
          prods.slice(0, 7).map((p) => ({
            slug: p.slug,
            name: p.name,
            description: p.description ?? '',
            img: p.images?.[0]?.url ?? '',
          })),
        );
      if (evts.length) setHighlights(evts.slice(0, 3));
    })();
  }, []);

  useEffect(() => {
    document.title = 'Goodveen';
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.volume = 0.5;
    const onLoaded = () => setVideoLoaded(true);
    v.addEventListener('loadeddata', onLoaded);
    v.play().catch(() => undefined);
    return () => v.removeEventListener('loadeddata', onLoaded);
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !isMuted;
    setIsMuted(next);
    v.muted = next;
    if (!next) v.play().catch(() => undefined);
  };

  return (
    <div className="w-full relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[90vh] md:h-[960px] -mt-[60px] overflow-hidden bg-[#303030]">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/vid.mp4" type="video/mp4" />
        </video>

        {/* Logo — bottom-left */}
        <div className="absolute left-5 bottom-5 md:left-10 md:bottom-10 z-20">
          <img
            src="/logo.png"
            alt="Goodveen"
            className="w-[350px] h-[42px] md:w-[1000px] md:h-[118px] object-contain"
          />
        </div>

        {/* Mute / unmute */}
        {videoLoaded && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="absolute bottom-[25px] right-5 md:bottom-[75px] md:right-10 z-20 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            {isMuted ? (
              <VolumeX className="w-3 h-3 md:w-4 md:h-4" strokeWidth={1.5} />
            ) : (
              <Volume2 className="w-3 h-3 md:w-4 md:h-4" strokeWidth={1.5} />
            )}
          </button>
        )}
      </section>

      {/* ===== DISCOVER (CATEGORIES) ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full items-end">
            <h2 className="text-[48px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-right w-full text-brand-gray">
              Откройте для себя
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase text-right w-full mt-1">
              Мир Goodveen
            </p>
          </div>

          {categories[0] && (
            <Link
              to={`/catalog?category=${categories[0].slug}`}
              className="relative w-full h-[280px] md:h-[480px] group overflow-hidden flex items-end p-5 md:p-10"
            >
              {categories[0].image && (
                <img
                  src={categories[0].image}
                  alt={categories[0].name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h3 className="relative z-10 text-white text-[32px] md:text-[48px] leading-none tracking-[0.02em] font-normal">
                {categories[0].name}
              </h3>
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 md:h-[360px]">
            {categories.slice(1, 4).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="relative group overflow-hidden flex items-end justify-center p-6 md:p-10 h-[200px] md:h-auto"
              >
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="relative z-10 text-white text-[28px] md:text-[36px] leading-none tracking-[0.02em] font-normal">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CRAFTED BY HAND (CATALOG) ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full">
            <h2 className="text-[40px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-brand-gray">
              Создано вручную
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
              Сформировано страстью, вдохновлено искусством
            </p>
          </div>

          {/* Grid 4 cols */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-10 md:auto-rows-[400px]">
            {featuredProducts.slice(0, 7).map((product, index) => (
              <CardWhite
                key={`product-${product.slug}-${index}`}
                slug={product.slug ?? '#'}
                title={product.name ?? ''}
                desc={product.description ?? ''}
                img={product.img ?? ''}
              />
            ))}
            {featuredProducts.length > 0 && (
              <Link
                to="/catalog"
                className="relative flex items-end justify-end p-5 group border border-transparent hover:border-brand-border transition-colors h-[240px] md:h-[400px]"
              >
                <span className="absolute right-0 bottom-0 h-[180px] w-px bg-[#D0D0D0] hidden md:block" />
                <span className="absolute right-0 bottom-0 w-[80%] h-px bg-[#D0D0D0] hidden md:block" />
                <span className="relative z-10 text-right text-[12px] tracking-[0.2em] uppercase text-brand-gray group-hover:text-brand-taupe transition-colors">
                  Смотреть всю коллекцию
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== HIGHLIGHTS ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10 items-center">
          <div className="flex flex-col items-center">
            <h2 className="text-[48px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-brand-gray text-center">
              Избранное
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase text-center mt-1">
              Прошедшие и предстоящие события
            </p>
          </div>

          <div className="relative w-full h-[280px] md:h-[480px] overflow-hidden flex justify-center items-center">
            <div 
              className="flex gap-5 md:gap-10 items-center w-max relative z-0 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(calc(-${highlightIndex * 100}% - ${highlightIndex * (window.innerWidth >= 768 ? 40 : 20)}px))` }}
            >
              {highlights.map((e, i) => (
                <div key={`highlight-${e.id}-${i}`} className="shrink-0">
                  <HighlightCard
                    slug={e.slug}
                    muted={i !== highlightIndex}
                    title={e.title}
                    desc={e.description ?? ''}
                    date={formatEventDate(e.publishedAt)}
                    img={e.image ?? ''}
                  />
                </div>
              ))}
            </div>

            {highlights.length > 1 && (
              <>
                <button
                  onClick={() => setHighlightIndex((prev) => (prev > 0 ? prev - 1 : highlights.length - 1))}
                  aria-label="Previous"
                  className="absolute left-0 md:left-5 top-1/2 -translate-y-1/2 w-8 h-[60px] md:w-9 md:h-[100px] flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white transition-colors pointer-events-auto z-10"
                >
                  <svg width="16" height="41" viewBox="0 0 16 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.6094 0.286621L0.609375 20.2864L14.6094 40.2866" stroke="#D0D0D0"/>
                  </svg>
                </button>
                <button
                  onClick={() => setHighlightIndex((prev) => (prev < highlights.length - 1 ? prev + 1 : 0))}
                  aria-label="Next"
                  className="absolute right-0 md:right-5 top-1/2 -translate-y-1/2 w-8 h-[60px] md:w-9 md:h-[100px] flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white transition-colors pointer-events-auto z-10"
                >
                  <svg width="16" height="41" viewBox="0 0 16 41" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'scaleX(-1)' }}>
                    <path d="M14.6094 0.286621L0.609375 20.2864L14.6094 40.2866" stroke="#D0D0D0"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function CardImage({
  slug,
  title,
  desc,
  img,
  full = false,
}: {
  slug: string;
  title: string;
  desc: string;
  img: string;
  full?: boolean;
}) {
  return (
    <Link
      to={slug !== '#' ? `/product/${slug}` : '/catalog'}
      className={`relative group overflow-hidden flex flex-col justify-end p-5 h-[280px] md:h-auto ${full ? 'md:h-full' : ''}`}
    >
      <img
        src={img || 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2400&auto=format&fit=crop'}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <h4 className="relative z-10 text-white text-[12px] tracking-[0.2em] uppercase mb-2">{title}</h4>
      <p className="relative z-10 text-white text-[12px] leading-[16px] opacity-90 max-w-[270px]">
        {desc}
      </p>
    </Link>
  );
}

function CardWhite({ slug, title, desc, img }: { slug: string; title: string; desc: string; img: string; key?: string | number }) {
  return (
    <Link
      to={slug !== '#' ? `/product/${slug}` : '/catalog'}
      className="border border-[#D0D0D0] flex flex-col group hover:shadow-md transition-shadow md:h-full"
    >
      <div className="relative overflow-hidden border-b border-[#D0D0D0] aspect-[4/3] md:aspect-auto md:flex-1">
        <img
          src={img || 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2400&auto=format&fit=crop'}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5 bg-white flex flex-col gap-2 md:h-[120px]">
        <h4 className="text-brand-gray text-[12px] tracking-[0.2em] uppercase truncate">{title}</h4>
        <p className="text-brand-gray-light text-[12px] leading-[16px] line-clamp-2">{desc}</p>
      </div>
    </Link>
  );
}

function HighlightCard({
  slug,
  title,
  desc,
  date,
  img,
  muted = false,
}: {
  slug: string;
  title: string;
  desc: string;
  date: string;
  img: string;
  muted?: boolean;
}) {
  return (
    <Link
      to={`/events/${slug}`}
      className="relative w-[280px] h-[280px] md:w-[800px] md:h-[480px] overflow-hidden flex flex-col justify-end p-5 shrink-0"
    >
      {img && <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />}
      <h4 className="relative z-10 text-white text-[12px] tracking-[0.2em] uppercase mb-1">
        {title}
      </h4>
      <p className="relative z-10 text-white text-[12px] leading-[16px] opacity-90 mb-1">{desc}</p>
      <p className="relative z-10 text-white text-[12px] opacity-80">{date}</p>
    </Link>
  );
}
