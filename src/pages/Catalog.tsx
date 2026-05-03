import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowLeft, SlidersHorizontal, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { filtersApi, productsApi } from '../lib/api';
import type { Product as ApiProduct } from '../lib/api/types';

type FilterKey = 'color' | 'flower' | 'price' | 'event';
type SortValue = 'popular' | 'newest' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'popular', label: 'Popular first' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const FALLBACK_COLORS = [
  { name: 'Crimson', hex: '#A31621' },
  { name: 'Ivory', hex: '#F5F0E1' },
  { name: 'Emerald', hex: '#2E7D5B' },
  { name: 'Lavender', hex: '#B59ED6' },
  { name: 'Coral', hex: '#FF7F61' },
];
const FALLBACK_FLOWERS = ['Roses', 'Peonies', 'Tulips', 'Lilies', 'Orchids'];
const EVENT_OPTIONS = ['Birthday', 'Wedding', 'Anniversary', 'Sympathy', 'Just Because', 'Corporate'];

type Product = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  img: string;
  price: number | null;
  createdAt: string;
  colors: string[];
  flowerTypes: string[];
  variant: 'image' | 'white' | 'wide';
};

const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=2400&auto=format&fit=crop';

function mapApi(p: ApiProduct, idx: number): Product {
  const variants: Product['variant'][] = ['image', 'white', 'image', 'image'];
  const cover = p.images?.[0]?.url ?? FALLBACK_IMG;
  const minPrice = p.sizes?.length ? Math.min(...p.sizes.map((s) => s.price)) : null;
  return {
    id: p.id,
    slug: p.slug,
    title: p.name,
    desc: p.description ?? '',
    img: cover,
    price: minPrice,
    createdAt: p.createdAt,
    colors: p.colors,
    flowerTypes: p.flowerTypes,
    variant: variants[idx % variants.length],
  };
}

// Build 4-small / 2-wide repeating mosaic rows.
function buildRows(items: Product[]): Product[][] {
  const rows: Product[][] = [];
  let i = 0;
  let pattern: 'quad' | 'wide' = 'quad';
  while (i < items.length) {
    if (pattern === 'quad') {
      rows.push(items.slice(i, i + 4));
      i += 4;
      pattern = 'wide';
    } else {
      const pair = items.slice(i, i + 2).map((p) => ({ ...p, variant: 'wide' as const }));
      if (pair.length) rows.push(pair);
      i += 2;
      pattern = 'quad';
    }
  }
  return rows;
}



export function Catalog() {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [sort, setSort] = useState<SortValue>('popular');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorOptions, setColorOptions] = useState<{ name: string; hex: string }[]>(FALLBACK_COLORS);
  const [flowerOptions, setFlowerOptions] = useState<string[]>(FALLBACK_FLOWERS);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [items, colors, flowers] = await Promise.all([
          productsApi.list({ onlyActive: true }),
          filtersApi.listColors().catch(() => []),
          filtersApi.listFlowerTypes().catch(() => []),
        ]);
        if (!active) return;
        setProducts(items.map(mapApi));
        if (colors.length)
          setColorOptions(
            colors.filter((c) => c.isActive).map((c) => ({ name: c.name, hex: c.hex })),
          );
        if (flowers.length)
          setFlowerOptions(flowers.filter((f) => f.isActive).map((f) => f.name));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Apply filters + sort
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedColors.length)
      list = list.filter((p) => selectedColors.some((c) => p.colors.includes(c)));
    if (selectedFlowers.length)
      list = list.filter((p) => selectedFlowers.some((f) => p.flowerTypes.includes(f)));
    if (priceRange) {
      list = list.filter((p) => {
        if (p.price == null) return true;
        return p.price >= priceRange[0] && p.price <= priceRange[1];
      });
    }
    const sorted = list.slice();
    switch (sort) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, selectedColors, selectedFlowers, priceRange, sort]);

  const rows = useMemo(() => buildRows(filteredProducts), [filteredProducts]);

  // close popovers on Esc / outside-click
  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenFilter(null);
        setSortOpen(false);
        setMobileFiltersOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setOpenFilter(null);
        setSortOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, []);

  const toggleFilter = (key: FilterKey) => {
    setSortOpen(false);
    setOpenFilter((cur) => (cur === key ? null : key));
  };
  const toggleSort = () => {
    setOpenFilter(null);
    setSortOpen((v) => !v);
  };

  const toggleIn = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort';

  return (
    <div className="w-full relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[480px] md:h-[680px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=2400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-black/70 to-transparent" />

        {/* spacer for fixed menu */}
        <div className="h-[84px]" />

        {/* hero content (title + filters) */}
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-0 flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col items-center text-center gap-4 md:gap-6">
            <h1 className="text-white text-[56px] md:text-[80px] leading-none tracking-[0.02em] font-light">
              Bouquets
            </h1>
            <p className="text-white/85 text-[12px] md:text-[14px] tracking-[0.25em] uppercase">
              emotions in bloom
            </p>
          </div>

          {/* Filters bar */}
          <div
            ref={filtersRef}
            className="relative w-full md:max-w-[1360px] flex flex-row md:items-stretch justify-between gap-2 md:gap-0 md:border-t md:border-white/20 md:border-b md:border-b-white/20"
          >
            {/* Desktop filter triggers */}
            <div className="hidden md:flex flex-1">
              {(
                [
                  { key: 'color' as FilterKey, label: 'Color', count: selectedColors.length },
                  { key: 'flower' as FilterKey, label: 'Flower type', count: selectedFlowers.length },
                  { key: 'price' as FilterKey, label: 'Price range', count: priceRange[0] !== 0 || priceRange[1] !== 1500 ? 1 : 0 },
                  { key: 'event' as FilterKey, label: 'Event', count: selectedEvents.length },
                ]
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`flex-1 h-[68px] px-6 flex items-center justify-between gap-3 text-white text-[12px] tracking-[0.2em] uppercase border-r border-white/20 transition-colors ${
                    openFilter === key ? 'bg-white text-brand-gray' : 'hover:bg-white/10'
                  }`}
                >
                  <span>
                    {label}
                    {count > 0 && <span className="ml-2 opacity-70">({count})</span>}
                  </span>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.25}
                    className={`opacity-60 transition-transform ${openFilter === key ? '-rotate-90' : 'rotate-90'}`}
                  />
                </button>
              ))}
            </div>

            {/* Mobile triggers */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex md:hidden flex-1 h-10 items-center justify-center gap-2 border border-white/30 text-white text-[12px] tracking-[0.2em] uppercase"
            >
              <SlidersHorizontal size={16} strokeWidth={1.25} />
              Filters
            </button>
            <button
              onClick={toggleSort}
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

            {/* ===== Desktop popovers ===== */}
            {openFilter === 'color' && (
              <FilterPopover
                anchor="left-0"
                onApply={() => setOpenFilter(null)}
                onReset={() => setSelectedColors([])}
              >
                <div className="flex flex-col">
                  {colorOptions.map((c) => {
                    const checked = selectedColors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedColors((arr) => toggleIn(arr, c.name))}
                        className="flex items-center gap-3 h-10 px-1 hover:bg-brand-border/40 transition-colors text-left"
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-brand-border shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: c.hex }}
                        >
                          {checked && (
                            <Check size={14} strokeWidth={2} className={c.name === 'Ivory' ? 'text-brand-gray' : 'text-white'} />
                          )}
                        </span>
                        <span className="text-[16px] text-brand-gray">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </FilterPopover>
            )}

            {openFilter === 'flower' && (
              <FilterPopover
                anchor="left-1/4"
                onApply={() => setOpenFilter(null)}
                onReset={() => setSelectedFlowers([])}
              >
                <CheckboxList
                  options={flowerOptions}
                  selected={selectedFlowers}
                  onToggle={(v) => setSelectedFlowers((arr) => toggleIn(arr, v))}
                />
              </FilterPopover>
            )}

            {openFilter === 'price' && (
              <FilterPopover
                anchor="left-1/2"
                onApply={() => setOpenFilter(null)}
                onReset={() => setPriceRange([0, 1500])}
              >
                <PriceRange value={priceRange} onChange={setPriceRange} />
              </FilterPopover>
            )}

            {openFilter === 'event' && (
              <FilterPopover
                anchor="left-3/4"
                onApply={() => setOpenFilter(null)}
                onReset={() => setSelectedEvents([])}
              >
                <CheckboxList
                  options={EVENT_OPTIONS}
                  selected={selectedEvents}
                  onToggle={(v) => setSelectedEvents((arr) => toggleIn(arr, v))}
                />
              </FilterPopover>
            )}

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
                      className="flex items-center gap-3 text-left hover:opacity-100 transition-opacity"
                    >
                      <span className={`w-4 h-4 flex items-center justify-center ${active ? 'opacity-100' : 'opacity-10'}`}>
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

      {/* ===== CATALOG MOSAIC ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-5 md:gap-10">
          {loading ? (
            <div className="text-center py-20 text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-20 text-[13px] text-brand-gray-light">
              No products match your filters.
            </div>
          ) : (
            rows.map((row, idx) => <CatalogRow key={idx} row={row} />)
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
          <PageBtn>17</PageBtn>
          <PageBtn ariaLabel="Next">
            <ArrowRight size={16} strokeWidth={1.25} />
          </PageBtn>
        </div>
      </section>

      {/* ===== CRAFTED BY HAND ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full">
            <h2 className="text-[40px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-brand-gray">
              Crafted by hand
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
              Every bouquet is made by hand in our workshop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 md:h-[900px]">
            <div className="relative overflow-hidden h-[280px] md:h-full">
              <img
                src="https://images.unsplash.com/photo-1466690672306-5f92132f7248?q=80&w=2400&auto=format&fit=crop"
                alt="Workshop"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-5 md:gap-10">
              <div className="relative overflow-hidden h-[280px] md:h-[480px]">
                <img
                  src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?q=80&w=2400&auto=format&fit=crop"
                  alt="Workshop detail"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <Link
                to="/workshop"
                className="relative h-[140px] md:h-[400px] flex items-end p-5 md:p-10 group"
              >
                <span className="absolute right-0 bottom-0 h-[60%] w-px bg-[#D0D0D0] hidden md:block" />
                <span className="absolute right-0 bottom-0 w-[80%] h-px bg-[#D0D0D0] hidden md:block" />
                <span className="relative z-10 ml-auto flex items-center gap-3 md:gap-4 text-[12px] tracking-[0.2em] uppercase text-brand-gray group-hover:text-brand-taupe transition-colors">
                  Visit the Workshop
                  <ArrowRight size={20} strokeWidth={1.25} />
                </span>
              </Link>
            </div>
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
              <HighlightCard
                muted
                title="Bloom & Craft Workshop"
                desc="An intimate masterclass in creating artful floral compositions."
                date="28 October 2025"
                img="https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop"
              />
              <HighlightCard
                title="Goodveen at Art & Design Fair"
                desc="Where floristry meets contemporary art and design."
                date="28 October 2025"
                img="https://images.unsplash.com/photo-1605388019623-66e8ad9c8141?q=80&w=2400&auto=format&fit=crop"
              />
              <HighlightCard
                muted
                title="Summer Collection Launch"
                desc="A celebration of color, texture, and seasonal beauty."
                date="15 September 2025"
                img="https://images.unsplash.com/photo-1502422770281-2292f700eb1b?q=80&w=2400&auto=format&fit=crop"
              />
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

      {/* ===== MOBILE FILTERS DRAWER ===== */}
      <MobileFiltersDrawer
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        selectedColors={selectedColors}
        selectedFlowers={selectedFlowers}
        selectedEvents={selectedEvents}
        priceRange={priceRange}
        setSelectedColors={setSelectedColors}
        setSelectedFlowers={setSelectedFlowers}
        setSelectedEvents={setSelectedEvents}
        setPriceRange={setPriceRange}
        colorOptions={colorOptions}
        flowerOptions={flowerOptions}
      />

      {/* ===== MOBILE SORT SHEET ===== */}
      {sortOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/40" onClick={() => setSortOpen(false)}>
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
                    <span className={`w-4 h-4 flex items-center justify-center ${active ? 'opacity-100' : 'opacity-10'}`}>
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

interface CatalogRowProps { row: Product[]; key?: string | number }
function CatalogRow({ row }: CatalogRowProps) {
  if (row.length === 2) {
    // Wide row: two 2-col-spanning cards
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 gap-5 md:gap-10 md:h-[400px]">
        {row.map((p) => (
          <ProductCard key={p.id} product={p} wide />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-10 md:h-[400px]">
      {row.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

interface ProductCardProps { product: Product; wide?: boolean; key?: string | number }
function ProductCard({ product, wide = false }: ProductCardProps) {
  const heightCls = wide ? 'h-[200px] md:h-full' : 'h-[240px] md:h-full';

  if (product.variant === 'white') {
    return (
      <Link
        to={`/product/${product.slug}`}
        className={`border border-brand-border flex flex-col group hover:shadow-md transition-shadow ${heightCls}`}
      >
        <div className="flex-1 overflow-hidden border-b border-brand-border relative">
          <img
            src={product.img}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="p-3 md:p-5 bg-white">
          <h4 className="text-brand-gray text-[11px] md:text-[12px] tracking-[0.2em] uppercase mb-1 md:mb-2 truncate">
            {product.title}
          </h4>
          <p className="text-brand-gray-light text-[11px] md:text-[12px] leading-[14px] md:leading-[16px] line-clamp-2">
            {product.desc}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`relative group overflow-hidden flex flex-col justify-end p-3 md:p-5 ${heightCls}`}
    >
      <img
        src={product.img}
        alt={product.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      <h4 className="relative z-10 text-white text-[11px] md:text-[12px] tracking-[0.2em] uppercase mb-1 md:mb-2 truncate">
        {product.title}
      </h4>
      <p
        className={`relative z-10 text-white text-[11px] md:text-[12px] leading-[14px] md:leading-[16px] opacity-90 ${
          wide ? 'max-w-[620px]' : 'max-w-[270px]'
        } line-clamp-2`}
      >
        {product.desc}
      </p>
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
      className={`w-[50px] h-[40px] md:w-[151px] md:h-[68px] flex items-center justify-center border border-brand-border text-[12px] md:text-[14px] tracking-[0.2em] uppercase -ml-px first:ml-0 transition-colors ${
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

interface FilterPopoverProps {
  children: ReactNode;
  anchor: 'left-0' | 'left-1/4' | 'left-1/2' | 'left-3/4';
  onApply: () => void;
  onReset: () => void;
}
function FilterPopover({ children, anchor, onApply, onReset }: FilterPopoverProps) {
  // Position: 4 columns => width ~338px aligned beneath the active trigger.
  const offset =
    anchor === 'left-0'
      ? 'left-0'
      : anchor === 'left-1/4'
      ? 'left-[25%]'
      : anchor === 'left-1/2'
      ? 'left-[50%]'
      : 'left-[75%]';
  return (
    <div
      className={`hidden md:flex flex-col absolute ${offset} top-full mt-2 z-30 w-[338px] bg-white text-brand-gray shadow-[0_40px_80px_rgba(0,0,0,0.32)] p-5 gap-5`}
    >
      <div className="max-h-[480px] overflow-y-auto pr-1">{children}</div>
      <div className="flex items-center justify-between border-t border-brand-border pt-4">
        <button
          onClick={onApply}
          className="h-11 px-6 bg-brand-gray text-white text-[12px] tracking-[0.2em] uppercase hover:bg-black transition-colors"
        >
          Apply
        </button>
        <button
          onClick={onReset}
          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

interface CheckboxListProps {
  options: string[];
  selected: string[];
  onToggle: (val: string) => void;
}
function CheckboxList({ options, selected, onToggle }: CheckboxListProps) {
  return (
    <div className="flex flex-col">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className="flex items-center gap-3 h-10 px-1 hover:bg-brand-border/40 transition-colors text-left"
          >
            <span
              className={`w-5 h-5 border flex items-center justify-center shrink-0 ${
                checked ? 'bg-brand-gray border-brand-gray' : 'border-brand-border'
              }`}
            >
              {checked && <Check size={14} strokeWidth={2} className="text-white" />}
            </span>
            <span className="text-[16px] text-brand-gray">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

interface PriceRangeProps {
  value: [number, number];
  onChange: (v: [number, number]) => void;
}
function PriceRangeControl({ value, onChange }: PriceRangeProps) {
  const [min, max] = value;
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">From</span>
          <input
            type="number"
            value={min}
            min={0}
            max={max}
            onChange={(e) => onChange([Number(e.target.value), max])}
            className="h-10 px-3 border border-brand-border text-[16px] focus:outline-none focus:border-brand-gray"
          />
        </label>
        <span className="text-brand-gray-light pt-5">—</span>
        <label className="flex-1 flex flex-col gap-1">
          <span className="text-[11px] tracking-[0.2em] uppercase text-brand-gray-light">To</span>
          <input
            type="number"
            value={max}
            min={min}
            max={5000}
            onChange={(e) => onChange([min, Number(e.target.value)])}
            className="h-10 px-3 border border-brand-border text-[16px] focus:outline-none focus:border-brand-gray"
          />
        </label>
      </div>
      <div className="text-[12px] text-brand-gray-light tracking-[0.05em]">
        {min.toLocaleString()} — {max.toLocaleString()} 000 UZS
      </div>
    </div>
  );
}
// re-exported under expected name
const PriceRange = PriceRangeControl;

interface MobileFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedColors: string[];
  selectedFlowers: string[];
  selectedEvents: string[];
  priceRange: [number, number];
  setSelectedColors: (v: string[]) => void;
  setSelectedFlowers: (v: string[]) => void;
  setSelectedEvents: (v: string[]) => void;
  setPriceRange: (v: [number, number]) => void;
  colorOptions: { name: string; hex: string }[];
  flowerOptions: string[];
}
function MobileFiltersDrawer({
  open,
  onClose,
  selectedColors,
  selectedFlowers,
  selectedEvents,
  priceRange,
  setSelectedColors,
  setSelectedFlowers,
  setSelectedEvents,
  setPriceRange,
  colorOptions,
  flowerOptions,
}: MobileFiltersDrawerProps) {
  if (!open) return null;
  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  return (
    <div className="md:hidden fixed inset-0 z-[60] bg-black/40" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white text-brand-gray flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-brand-border">
          <span className="text-[14px] tracking-[0.2em] uppercase">Filters</span>
          <button onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          <Section title="Color">
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((c) => {
                const checked = selectedColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColors(toggle(selectedColors, c.name))}
                    className="flex items-center gap-2 h-10"
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-brand-border flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                    >
                      {checked && <Check size={14} strokeWidth={2} className={c.name === 'Ivory' ? 'text-brand-gray' : 'text-white'} />}
                    </span>
                    <span className="text-[14px]">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section title="Flower type">
            <CheckboxList
              options={flowerOptions}
              selected={selectedFlowers}
              onToggle={(v) => setSelectedFlowers(toggle(selectedFlowers, v))}
            />
          </Section>
          <Section title="Price range">
            <PriceRangeControl value={priceRange} onChange={setPriceRange} />
          </Section>
          <Section title="Event">
            <CheckboxList
              options={EVENT_OPTIONS}
              selected={selectedEvents}
              onToggle={(v) => setSelectedEvents(toggle(selectedEvents, v))}
            />
          </Section>
        </div>
        <div className="flex border-t border-brand-border">
          <button
            onClick={() => {
              setSelectedColors([]);
              setSelectedFlowers([]);
              setSelectedEvents([]);
              setPriceRange([0, 1500]);
            }}
            className="flex-1 h-14 text-[12px] tracking-[0.2em] uppercase text-brand-gray-light"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-14 bg-brand-gray text-white text-[12px] tracking-[0.2em] uppercase"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">{title}</h3>
      {children}
    </div>
  );
}

function HighlightCard({
  title,
  desc,
  date,
  img,
  muted = false,
}: {
  title: string;
  desc: string;
  date: string;
  img: string;
  muted?: boolean;
}) {
  return (
    <Link
      to="/events"
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
