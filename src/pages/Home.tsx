import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categoriesApi, productsApi, eventsApi } from '../lib/api';
import type { Category, Product, Event as ApiEvent } from '../lib/api/types';

const FALLBACK_CATEGORIES = [
  { id: 'bouquets', name: 'Bouquets', slug: 'bouquets', image: 'https://images.unsplash.com/photo-1526047932273-341f2a588b39?q=80&w=2670&auto=format&fit=crop', description: null, isActive: true, sortOrder: 0, createdAt: '', updatedAt: '' },
  { id: 'flowers',  name: 'Flowers',  slug: 'flowers',  image: 'https://images.unsplash.com/photo-1507290439931-a861cf509832?q=80&w=2400&auto=format&fit=crop', description: null, isActive: true, sortOrder: 1, createdAt: '', updatedAt: '' },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1505934884246-9b65d8aabd58?q=80&w=2400&auto=format&fit=crop', description: null, isActive: true, sortOrder: 2, createdAt: '', updatedAt: '' },
  { id: 'plants', name: 'Plants', slug: 'plants', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=2400&auto=format&fit=crop', description: null, isActive: true, sortOrder: 3, createdAt: '', updatedAt: '' },
] satisfies Category[];

const FALLBACK_PRODUCTS = [
  { slug: '#', name: 'Golden Hour Muse', description: 'Soft peach and champagne blooms glowing with sunset warmth.', img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2400&auto=format&fit=crop' },
  { slug: '#', name: 'Wild Serenity',    description: 'Lavender, peonies, and thistles — effortless harmony.',        img: 'https://images.unsplash.com/photo-1549007628-9418af83b544?q=80&w=2400&auto=format&fit=crop' },
  { slug: '#', name: 'Urban Poetry',     description: 'Sculptural whites and silvers — modern, bold, poetic.',         img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2400&auto=format&fit=crop' },
  { slug: '#', name: 'Whispered Bloom',  description: 'Soft pastels and trailing greenery — a quiet grace.',           img: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?q=80&w=2400&auto=format&fit=crop' },
  { slug: '#', name: 'Midnight Reverie', description: 'Deep red roses and black calla lilies — nocturnal elegance.',    img: 'https://images.unsplash.com/photo-1549420078-d4469796bb82?q=80&w=2400&auto=format&fit=crop' },
  { slug: '#', name: 'Wild Serenity II', description: 'Lavender, peonies, and thistles — effortless harmony.',        img: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop' },
  { slug: '#', name: 'Golden Hour II',   description: 'Soft peach and champagne blooms glowing with sunset warmth.', img: 'https://images.unsplash.com/photo-1502422770281-2292f700eb1b?q=80&w=2400&auto=format&fit=crop' },
] as const;

type FeaturedProduct = { slug: string; name: string; description: string; img: string };

const FALLBACK_HIGHLIGHTS = [
  { id: '1', slug: 'bloom-craft', title: 'Bloom & Craft Workshop',           excerpt: 'An intimate masterclass in creating artful floral compositions.', publishedAt: '2025-10-28T00:00:00Z', image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop' },
  { id: '2', slug: 'art-design-fair', title: 'Goodveen at Art & Design Fair', excerpt: 'Where floristry meets contemporary art and design.',              publishedAt: '2025-10-28T00:00:00Z', image: 'https://images.unsplash.com/photo-1605388019623-66e8ad9c8141?q=80&w=2400&auto=format&fit=crop' },
  { id: '3', slug: 'summer-launch',   title: 'Summer Collection Launch',     excerpt: 'A celebration of color, texture, and seasonal beauty.',           publishedAt: '2025-09-15T00:00:00Z', image: 'https://images.unsplash.com/photo-1502422770281-2292f700eb1b?q=80&w=2400&auto=format&fit=crop' },
] as { id: string; slug: string; title: string; excerpt: string | null; publishedAt: string | null; image: string | null }[];

function formatEventDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([...FALLBACK_PRODUCTS]);
  const [highlights, setHighlights] = useState(FALLBACK_HIGHLIGHTS);

  useEffect(() => {
    (async () => {
      const [cats, prods, evts] = await Promise.all([
        categoriesApi.list(true).catch(() => [] as Category[]),
        productsApi.list({ onlyActive: true }).catch(() => [] as Product[]),
        eventsApi.list({ onlyPublished: true }).catch(() => [] as ApiEvent[]),
      ]);
      if (cats.length) setCategories(cats);
      if (prods.length)
        setFeaturedProducts(
          prods.slice(0, 7).map((p) => ({
            slug: p.slug,
            name: p.name,
            description: p.description ?? '',
            img: p.images?.[0]?.url ?? FALLBACK_PRODUCTS[0].img,
          })),
        );
      if (evts.length)
        setHighlights(
          evts.slice(0, 3).map((e) => ({
            id: e.id,
            slug: e.slug,
            title: e.title,
            excerpt: e.description ?? null,
            publishedAt: e.publishedAt ?? null,
            image: e.image ?? null,
          })),
        );
    })();
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
            className="absolute bottom-5 right-5 md:bottom-10 md:right-10 z-20 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 md:w-6 md:h-6" strokeWidth={1.5} />
            ) : (
              <Volume2 className="w-4 h-4 md:w-6 md:h-6" strokeWidth={1.5} />
            )}
          </button>
        )}
      </section>

      {/* ===== DISCOVER (CATEGORIES) ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full items-end">
            <h2 className="text-[48px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-right w-full text-brand-gray">
              Discover
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase text-right w-full mt-1">
              A world of goodveen
            </p>
          </div>

          {categories[0] && (
            <Link
              to={`/catalog?category=${categories[0].slug}`}
              className="relative w-full h-[280px] md:h-[480px] group overflow-hidden flex items-end p-5 md:p-10"
            >
              <img
                src={categories[0].image ?? FALLBACK_CATEGORIES[0].image}
                alt={categories[0].name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
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
                <img
                  src={cat.image ?? FALLBACK_CATEGORIES[i + 1]?.image ?? ''}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
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
              Crafted by hand
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
              Shaped by passion, and inspired by art
            </p>
          </div>

          {/* Mosaic 4 cols * 3 rows desktop / 1 col mobile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-10 md:auto-rows-[400px]">
            {/* Row 1 */}
            <CardImage
              slug={featuredProducts[0]?.slug ?? '#'}
              title={featuredProducts[0]?.name ?? ''}
              desc={featuredProducts[0]?.description ?? ''}
              img={featuredProducts[0]?.img ?? ''}
            />
            <CardWhite
              slug={featuredProducts[1]?.slug ?? '#'}
              title={featuredProducts[1]?.name ?? ''}
              desc={featuredProducts[1]?.description ?? ''}
              img={featuredProducts[1]?.img ?? ''}
            />
            <div className="hidden md:block" />
            <CardImage
              slug={featuredProducts[2]?.slug ?? '#'}
              title={featuredProducts[2]?.name ?? ''}
              desc={featuredProducts[2]?.description ?? ''}
              img={featuredProducts[2]?.img ?? ''}
            />

            {/* Row 2 */}
            <div className="hidden md:block" />
            <CardImage
              slug={featuredProducts[3]?.slug ?? '#'}
              title={featuredProducts[3]?.name ?? ''}
              desc={featuredProducts[3]?.description ?? ''}
              img={featuredProducts[3]?.img ?? ''}
            />
            <div className="md:col-span-2">
              <CardImage
                slug={featuredProducts[4]?.slug ?? '#'}
                title={featuredProducts[4]?.name ?? ''}
                desc={featuredProducts[4]?.description ?? ''}
                img={featuredProducts[4]?.img ?? ''}
                full
              />
            </div>

            {/* Row 3 */}
            <CardWhite
              slug={featuredProducts[5]?.slug ?? '#'}
              title={featuredProducts[5]?.name ?? ''}
              desc={featuredProducts[5]?.description ?? ''}
              img={featuredProducts[5]?.img ?? ''}
            />
            <CardImage
              slug={featuredProducts[6]?.slug ?? '#'}
              title={featuredProducts[6]?.name ?? ''}
              desc={featuredProducts[6]?.description ?? ''}
              img={featuredProducts[6]?.img ?? ''}
            />
            <Link
              to="/catalog"
              className="relative flex items-end justify-end p-5 group border border-transparent hover:border-brand-border transition-colors h-[120px] md:h-auto"
            >
              <span className="absolute right-0 bottom-0 h-[180px] w-px bg-[#D0D0D0] hidden md:block" />
              <span className="absolute right-0 bottom-0 w-[80%] h-px bg-[#D0D0D0] hidden md:block" />
              <span className="relative z-10 flex items-center gap-3 md:gap-4 text-[12px] tracking-[0.2em] uppercase text-brand-gray group-hover:text-brand-taupe transition-colors">
                Explore the full collection
                <ArrowRight size={20} strokeWidth={1.25} />
              </span>
            </Link>
            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      {/* ===== HIGHLIGHTS ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10 items-center">
          <div className="flex flex-col items-center">
            <h2 className="text-[48px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-brand-gray text-center">
              Highlights
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase text-center mt-1">
              From past and upcoming events
            </p>
          </div>

          <div className="relative w-full h-[280px] md:h-[480px] overflow-hidden flex justify-center items-center">
            <div className="flex gap-5 md:gap-10 items-center justify-center w-max">
              {highlights.map((e, i) => (
                <HighlightCard
                  slug={e.slug}
                  muted={i !== 1}
                  title={e.title}
                  desc={e.excerpt ?? ''}
                  date={formatEventDate(e.publishedAt)}
                  img={e.image ?? FALLBACK_HIGHLIGHTS[i]?.image ?? ''}
                />
              ))}
            </div>

            <button
              aria-label="Previous"
              className="absolute left-2 md:left-10 top-1/2 -translate-y-1/2 w-9 h-[80px] md:w-10 md:h-[120px] border border-[#D0D0D0] flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white transition-colors z-20"
            >
              <ArrowLeft className="text-brand-gray" size={20} strokeWidth={1.25} />
            </button>
            <button
              aria-label="Next"
              className="absolute right-2 md:right-10 top-1/2 -translate-y-1/2 w-9 h-[80px] md:w-10 md:h-[120px] border border-[#D0D0D0] flex items-center justify-center bg-white/70 backdrop-blur-sm hover:bg-white transition-colors z-20"
            >
              <ArrowRight className="text-brand-gray" size={20} strokeWidth={1.25} />
            </button>
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
        src={img}
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

function CardWhite({ slug, title, desc, img }: { slug: string; title: string; desc: string; img: string }) {
  return (
    <Link
      to={slug !== '#' ? `/product/${slug}` : '/catalog'}
      className="border border-brand-border flex flex-col group hover:shadow-md transition-shadow h-[360px] md:h-auto"
    >
      <div className="flex-1 overflow-hidden border-b border-brand-border relative">
        <img
          src={img}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5 bg-white">
        <h4 className="text-brand-gray text-[12px] tracking-[0.2em] uppercase mb-2">{title}</h4>
        <p className="text-brand-gray-light text-[12px] leading-[16px]">{desc}</p>
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
      className={`relative w-[280px] h-[280px] md:w-[800px] md:h-[480px] overflow-hidden flex flex-col justify-end p-5 shrink-0 ${
        muted ? 'opacity-25' : ''
      }`}
    >
      <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <h4 className="relative z-10 text-white text-[12px] tracking-[0.2em] uppercase mb-1">
        {title}
      </h4>
      <p className="relative z-10 text-white text-[12px] leading-[16px] opacity-90 mb-1">{desc}</p>
      <p className="relative z-10 text-white text-[12px] opacity-80">{date}</p>
    </Link>
  );
}
