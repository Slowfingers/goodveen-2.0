import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { eventsApi } from '../lib/api';
import type { Event as ApiEvent } from '../lib/api/types';

type Tag = string;

interface EventItem {
  id: string;
  slug?: string;
  title: string;
  desc: string;
  date: string;
  rawDate?: string | null;
  tag: Tag;
  image: string;
  span?: 'half' | 'full';
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2400&auto=format&fit=crop';

function formatEventDate(input: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mapApiToItem(e: ApiEvent): EventItem {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    desc: e.description ?? '',
    date: formatEventDate(e.publishedAt ?? e.createdAt),
    rawDate: e.publishedAt ?? e.createdAt,
    tag: e.tag,
    image: e.image || FALLBACK_IMAGE,
    span: e.size === 'full' ? 'full' : 'half',
  };
}

const FALLBACK_EVENTS: EventItem[] = [
  {
    id: 'bloom-expo',
    title: 'Bloom Expo Highlights',
    desc: 'Our team shines at this year’s international floral exhibition.',
    date: '13 November 2025',
    tag: 'Events',
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2400&auto=format&fit=crop',
    span: 'half',
  },
  {
    id: 'grand-opening',
    title: 'Grand Opening Announcement',
    desc: 'A new floral studio now welcomes guests in the heart of the city.',
    date: '5 November 2025',
    tag: 'Events',
    image: 'https://images.unsplash.com/photo-1490262112932-3ad770daeead?q=80&w=2400&auto=format&fit=crop',
    span: 'half',
  },
  {
    id: 'seasonal-collection',
    title: 'Seasonal Collection Launch',
    desc: 'Discover fresh designs and trending color palettes this spring.',
    date: '28 October 2025',
    tag: 'Design',
    image: 'https://images.unsplash.com/photo-1549420078-d4469796bb82?q=80&w=2400&auto=format&fit=crop',
    span: 'half',
  },
  {
    id: 'award-winning',
    title: 'Award-Winning Designs',
    desc: 'Our florists receive top honors at the Global Flower Art Awards.',
    date: '16 October 2025',
    tag: 'Design',
    image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop',
    span: 'half',
  },
  {
    id: 'creative-workshop',
    title: 'Creative Workshop Recap',
    desc: 'How we brought together flower lovers for a day of inspiration.',
    date: '2 October 2025',
    tag: 'Workshop',
    image: 'https://images.unsplash.com/photo-1605388019623-66e8ad9c8141?q=80&w=2400&auto=format&fit=crop',
    span: 'full',
  },
  {
    id: 'sustainability',
    title: 'Sustainability Initiative',
    desc: 'Our studio introduces eco-friendly packaging and green practices.',
    date: '25 September 2025',
    tag: 'Workshop',
    image: 'https://images.unsplash.com/photo-1502422770281-2292f700eb1b?q=80&w=2400&auto=format&fit=crop',
    span: 'half',
  },
  {
    id: 'partnership',
    title: 'Partnership Spotlight',
    desc: 'Collaborating with local growers to bring you fresher blooms.',
    date: '3 September 2025',
    tag: 'Events',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2400&auto=format&fit=crop',
    span: 'half',
  },
];

type Sort = 'newest' | 'oldest';
const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export function Events() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<'All' | Tag>('All');
  const [sort, setSort] = useState<Sort>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await eventsApi.list({ onlyPublished: true });
        if (!active) return;
        setItems(data.length ? data.map(mapApiToItem) : FALLBACK_EVENTS);
      } catch {
        if (active) setItems(FALLBACK_EVENTS);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Build dynamic tag list from items
  const TAGS = useMemo<('All' | Tag)[]>(() => {
    const set = new Set<string>();
    items.forEach((it) => set.add(it.tag));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const list = items.filter((e) => tag === 'All' || e.tag === tag);
    return list.slice().sort((a, b) => {
      const da = a.rawDate ? new Date(a.rawDate).getTime() : 0;
      const db = b.rawDate ? new Date(b.rawDate).getTime() : 0;
      return sort === 'newest' ? db - da : da - db;
    });
  }, [items, tag, sort]);

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  // group filtered into rows preserving span layout: pairs of half + a full when met
  const rows: EventItem[][] = [];
  let buf: EventItem[] = [];
  for (const e of filtered) {
    if (e.span === 'full') {
      if (buf.length) {
        rows.push(buf);
        buf = [];
      }
      rows.push([e]);
    } else {
      buf.push(e);
      if (buf.length === 2) {
        rows.push(buf);
        buf = [];
      }
    }
  }
  if (buf.length) rows.push(buf);

  return (
    <div className="w-full relative bg-white">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[440px] md:h-[640px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507290439931-a861cf509832?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-black/70 to-transparent" />

        <div className="h-[84px]" />
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-0 flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col items-center text-center gap-4 md:gap-6">
            <h1 className="text-white text-[56px] md:text-[80px] leading-none tracking-[0.02em] font-light">
              Events
            </h1>
            <p className="text-white/85 text-[12px] md:text-[14px] tracking-[0.25em] uppercase">
              stories from the studio and beyond
            </p>
          </div>

          {/* Filters bar */}
          <div className="relative w-full md:max-w-[1360px] flex flex-row md:items-stretch justify-between gap-2 md:gap-0 md:border-t md:border-white/20 md:border-b md:border-b-white/20">
            <div className="hidden md:flex flex-1">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`flex-1 h-[68px] px-6 flex items-center justify-center gap-3 text-[12px] tracking-[0.2em] uppercase border-r border-white/20 transition-colors ${
                    tag === t ? 'bg-white text-brand-gray' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {t === 'All' ? 'All stories' : `#${t}`}
                </button>
              ))}
            </div>

            {/* Mobile filters trigger */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex md:hidden flex-1 h-10 items-center justify-center gap-2 border border-white/30 text-white text-[12px] tracking-[0.2em] uppercase"
            >
              {tag === 'All' ? 'All stories' : `#${tag}`}
            </button>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className={`flex flex-1 md:flex-none h-10 md:h-[68px] items-center justify-center md:justify-between gap-2 md:px-6 md:min-w-[229px] border md:border-0 md:border-l border-white/30 md:border-l-white/20 text-white text-[12px] tracking-[0.2em] uppercase transition-colors ${
                sortOpen ? 'md:bg-white md:text-brand-gray' : 'hover:bg-white/10'
              }`}
            >
              {sortLabel}
              <ArrowRight
                size={14}
                strokeWidth={1.25}
                className={`opacity-60 transition-transform ${sortOpen ? '-rotate-90' : 'rotate-90'}`}
              />
            </button>

            {/* Sort popover (desktop) */}
            {sortOpen && (
              <div className="hidden md:block absolute right-0 top-full mt-2 z-30 w-[229px] bg-white text-brand-gray shadow-[0_40px_80px_rgba(0,0,0,0.32)] p-5 flex flex-col gap-3">
                {SORT_OPTIONS.map((opt) => {
                  const active = sort === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSort(opt.value);
                        setSortOpen(false);
                      }}
                      className="flex items-center gap-3 text-left"
                    >
                      <span
                        className={`w-4 h-4 flex items-center justify-center ${
                          active ? 'opacity-100' : 'opacity-10'
                        }`}
                      >
                        <Check size={14} strokeWidth={2} className="text-brand-gray" />
                      </span>
                      <span className="text-[16px]">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== GRID ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-5 md:gap-10">
          {loading ? (
            <div className="text-center py-16 text-brand-gray-light text-[12px] tracking-[0.2em] uppercase">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-brand-gray-light">
              No stories matching this filter.
            </div>
          ) : (
            rows.map((row, idx) => {
              if (row.length === 1 && row[0].span === 'full') {
                return (
                  <div key={idx} className="w-full md:h-[600px]">
                    <EventCard event={row[0]} variant="full" />
                  </div>
                );
              }
              return (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 md:h-[480px]">
                  {row.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ===== PAGINATION ===== */}
      <section className="w-full flex justify-center py-10 md:py-[40px] px-5 md:px-10 border-b border-brand-border">
        <div className="flex">
          <PageBtn ariaLabel="Previous">
            <ArrowLeft size={16} strokeWidth={1.25} />
          </PageBtn>
          <PageBtn>1</PageBtn>
          <PageBtn active>2</PageBtn>
          <PageBtn>3</PageBtn>
          <PageBtn disabled>…</PageBtn>
          <PageBtn>9</PageBtn>
          <PageBtn ariaLabel="Next">
            <ArrowRight size={16} strokeWidth={1.25} />
          </PageBtn>
        </div>
      </section>

      {/* ===== MOBILE FILTERS ===== */}
      {mobileFiltersOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/40"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white text-brand-gray flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-brand-border">
              <span className="text-[14px] tracking-[0.2em] uppercase">Filter by tag</span>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close">
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>
            <div className="flex flex-col p-5 gap-3">
              {TAGS.map((t) => {
                const active = tag === t;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setTag(t);
                      setMobileFiltersOpen(false);
                    }}
                    className="flex items-center gap-3 h-10"
                  >
                    <span
                      className={`w-4 h-4 flex items-center justify-center ${
                        active ? 'opacity-100' : 'opacity-10'
                      }`}
                    >
                      <Check size={14} strokeWidth={2} />
                    </span>
                    <span className="text-[16px]">
                      {t === 'All' ? 'All stories' : `#${t}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE SORT ===== */}
      {sortOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/40"
          onClick={() => setSortOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-white text-brand-gray flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-14 border-b border-brand-border">
              <span className="text-[14px] tracking-[0.2em] uppercase">Sort by</span>
              <button onClick={() => setSortOpen(false)} aria-label="Close">
                <X size={20} strokeWidth={1.25} />
              </button>
            </div>
            <div className="flex flex-col p-5 gap-3">
              {SORT_OPTIONS.map((opt) => {
                const active = sort === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className="flex items-center gap-3 h-10"
                  >
                    <span
                      className={`w-4 h-4 flex items-center justify-center ${
                        active ? 'opacity-100' : 'opacity-10'
                      }`}
                    >
                      <Check size={14} strokeWidth={2} />
                    </span>
                    <span className="text-[16px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EventCardProps { event: EventItem; variant?: 'half' | 'full'; key?: string | number }
function EventCard({ event, variant = 'half' }: EventCardProps) {
  const heightCls = variant === 'full' ? 'h-[280px] md:h-full' : 'h-[300px] md:h-full';
  return (
    <Link
      to={`/events/${event.slug ?? event.id}`}
      className={`relative group overflow-hidden flex flex-col justify-end p-5 md:p-8 ${heightCls}`}
    >
      <img
        src={event.image}
        alt={event.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="relative z-10 flex flex-col gap-2 md:gap-3">
        <h3 className="text-white text-[14px] md:text-[16px] tracking-[0.15em] uppercase">
          {event.title}
        </h3>
        <p className="text-white/85 text-[12px] md:text-[14px] leading-[18px] md:leading-[20px] max-w-[640px]">
          {event.desc}
        </p>
        <div className="flex items-center justify-between gap-3 mt-1">
          <span className="text-white/80 text-[11px] md:text-[12px] tracking-[0.1em]">
            {event.date}
          </span>
          <span className="bg-white text-brand-gray text-[10px] md:text-[11px] tracking-[0.2em] uppercase px-2 py-1">
            #{event.tag}
          </span>
        </div>
      </div>
    </Link>
  );
}

interface PageBtnProps {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}
function PageBtn({ children, active, disabled, ariaLabel }: PageBtnProps) {
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      className={`w-[50px] h-[40px] md:w-[120px] md:h-[68px] flex items-center justify-center border border-brand-border text-[12px] md:text-[14px] tracking-[0.2em] uppercase -ml-px first:ml-0 transition-colors ${
        active
          ? 'bg-brand-border text-brand-gray'
          : disabled
          ? 'text-brand-gray-light cursor-default'
          : 'text-brand-gray hover:bg-brand-border/50'
      }`}
    >
      {children}
    </button>
  );
}
