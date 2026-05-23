import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowLeft, SlidersHorizontal, Check, X, ShoppingBag } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { filtersApi, productsApi, categoriesApi, pagesApi, eventsApi } from '../lib/api';
import type { Product as ApiProduct, Category, PageSetting, Event } from '../lib/api/types';
import { useCartUI } from '../components/cart/CartContext';

type FilterKey = 'color' | 'flower';
type SortValue = 'popular' | 'newest' | 'price-asc' | 'price-desc';

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'popular', label: 'Сначала популярные' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
];


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
  categoryId: string;
};

function mapApi(p: ApiProduct): Product {
  const cover = p.images?.[0]?.url ?? '';
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
    categoryId: p.categoryId,
  };
}

// Build rows with 4 items per row
function buildRows(items: Product[]): Product[][] {
  const rows: Product[][] = [];
  for (let i = 0; i < items.length; i += 4) {
    rows.push(items.slice(i, i + 4));
  }
  return rows;
}



export function Catalog() {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFlowers, setSelectedFlowers] = useState<string[]>([]);
  const [sort, setSort] = useState<SortValue>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorOptions, setColorOptions] = useState<{ name: string; hex: string }[]>([]);
  const [flowerOptions, setFlowerOptions] = useState<string[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [pageSetting, setPageSetting] = useState<PageSetting | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    document.title = currentCategory ? `Goodveen - ${currentCategory.name}` : 'Goodveen - Каталог';
  }, [currentCategory]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [categories, colors, flowers, settings, eventsData] = await Promise.all([
          categoriesApi.list(true).catch(() => []),
          filtersApi.listColors().catch(() => []),
          filtersApi.listFlowerTypes().catch(() => []),
          pagesApi.listSettings().catch(() => []),
          eventsApi.list({ onlyPublished: true }).catch(() => []),
        ]);
        
        let categoryId: string | undefined;
        if (categorySlug) {
          const cat = categories.find((c) => c.slug === categorySlug);
          if (cat) {
            setCurrentCategory(cat);
            categoryId = cat.id;
          }
        } else {
          setCurrentCategory(null);
        }

        const items = await productsApi.list({ onlyActive: true, ...(categoryId && { categoryId }) });
        
        if (!active) return;
        setProducts(items.map((item) => mapApi(item)));
        if (colors.length)
          setColorOptions(
            colors.filter((c) => c.isActive).map((c) => ({ name: c.name, hex: c.hex })),
          );
        if (flowers.length)
          setFlowerOptions(flowers.filter((f) => f.isActive).map((f) => f.name));
        const catalogSetting = settings.find((s) => s.pageKey === 'catalog');
        setPageSetting(catalogSetting || null);
        setEvents(eventsData.slice(0, 3));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [categorySlug]);

  // Apply filters + sort
  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedColors.length)
      list = list.filter((p) => selectedColors.some((c) => p.colors.includes(c)));
    if (selectedFlowers.length)
      list = list.filter((p) => selectedFlowers.some((f) => p.flowerTypes.includes(f)));
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
  }, [products, selectedColors, selectedFlowers, sort]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedColors, selectedFlowers, sort]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const rows = useMemo(() => buildRows(paginatedProducts), [paginatedProducts]);

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

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Сортировка';

  const heroImage = pageSetting?.heroImage || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=2400&auto=format&fit=crop';
  const title = currentCategory ? currentCategory.name : (pageSetting?.title || 'Каталог');
  const subtitle = currentCategory?.description || (pageSetting?.subtitle || 'эмоции в цветах');

  return (
    <div className="w-full relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[480px] md:h-[680px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImage}')`,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-black/70 to-transparent" />

        {/* spacer for fixed menu */}
        <div className="h-[84px]" />

        {/* hero content (title + filters) */}
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-0 flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col items-start gap-3 md:gap-4">
            <h1 className="text-white text-[48px] md:text-[72px] leading-[1.05] tracking-[0.01em] font-light">
              {title}
            </h1>
            <p className="text-white/85 text-[12px] md:text-[14px] tracking-[0.25em] uppercase mt-1">
              {subtitle}
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
                  { key: 'color' as FilterKey, label: 'Цвет', count: selectedColors.length },
                  { key: 'flower' as FilterKey, label: 'Тип цветов', count: selectedFlowers.length },
                ]
              ).map(({ key, label, count }, idx, arr) => (
                <button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  className={`flex-1 h-[68px] px-6 flex items-center justify-between gap-3 text-white text-[12px] tracking-[0.2em] uppercase transition-colors ${
                    idx < arr.length - 1 ? 'border-r border-white/20' : ''
                  } ${openFilter === key ? 'bg-white text-brand-gray' : 'hover:bg-white/10'}`}
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
              Фильтры
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
              Загрузка…
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-20 text-[13px] text-brand-gray-light">
              Нет товаров, соответствующих фильтрам.
            </div>
          ) : (
            rows.map((row) => <CatalogRow key={`row-${row[0]?.id || Math.random()}`} row={row} />)
          )}
        </div>
      </section>

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <section className="w-full flex justify-center py-10 md:py-[40px] px-5 md:px-10 border-b border-brand-border">
          <div className="flex">
            <PageBtn
              ariaLabel="Предыдущая"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ArrowLeft size={16} strokeWidth={1.25} />
            </PageBtn>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <PageBtn
                  active={currentPage === pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </PageBtn>
              );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PageBtn disabled>…</PageBtn>
            )}
            {totalPages > 5 && (
              <PageBtn
                active={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </PageBtn>
            )}
            <PageBtn
              ariaLabel="Следующая"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ArrowRight size={16} strokeWidth={1.25} />
            </PageBtn>
          </div>
        </section>
      )}

      {/* ===== CRAFTED BY HAND ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full">
            <h2 className="text-[40px] md:text-[80px] font-normal leading-[1] md:leading-[80px] tracking-[0.02em] text-brand-gray">
              Создано вручную
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
              Каждый букет создан вручную в нашей мастерской
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
                  Посетить мастерскую
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
              Особенное
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase text-center mt-1">
              Из прошлых и грядущих событий
            </p>
          </div>

          <div className="relative w-full h-[280px] md:h-[480px] overflow-hidden flex justify-center items-center">
            {events.length > 0 ? (
              <div className="flex gap-5 md:gap-10 items-center justify-center w-max">
                {events.map((event, idx) => (
                  <div key={event.id} className="shrink-0">
                    <HighlightCard
                      slug={event.slug}
                      muted={idx !== 1}
                      title={event.title}
                      desc={event.description ?? ''}
                      date={new Date(event.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      img={event.image ?? ''}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-brand-gray-light">
                <p>События скоро появятся</p>
              </div>
            )}

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
        setSelectedColors={setSelectedColors}
        setSelectedFlowers={setSelectedFlowers}
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
              <span className="text-[14px] tracking-[0.2em] uppercase">Сортировка</span>
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[8px] md:gap-10 md:h-[400px]">
      {row.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

interface ProductCardProps { product: Product; key?: string | number }
function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className="border border-[#D0D0D0] flex flex-col group hover:shadow-md transition-shadow h-[300px] md:h-full"
    >
      <div className="flex-1 overflow-hidden border-b border-[#D0D0D0] relative">
        <img
          src={product.img}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="px-4 py-0 bg-white h-[52px] md:h-[92px] flex flex-col justify-center gap-1 md:gap-2 md:px-5 md:py-5">
        <h4 className="text-brand-gray text-[11px] md:text-[14px] tracking-[0.2em] uppercase truncate">
          {product.title}
        </h4>
        <p className="hidden md:block text-brand-gray text-[11px] md:text-[12px] leading-[14px] line-clamp-2">
          {product.desc}
        </p>
      </div>
    </Link>
  );
}

interface PageBtnProps {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}
function PageBtn({ children, active, disabled, ariaLabel, onClick }: PageBtnProps) {
  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
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
          Применить
        </button>
        <button
          onClick={onReset}
          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray transition-colors"
        >
          Сбросить
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

interface MobileFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedColors: string[];
  selectedFlowers: string[];
  setSelectedColors: (v: string[]) => void;
  setSelectedFlowers: (v: string[]) => void;
  colorOptions: { name: string; hex: string }[];
  flowerOptions: string[];
}
function MobileFiltersDrawer({
  open,
  onClose,
  selectedColors,
  selectedFlowers,
  setSelectedColors,
  setSelectedFlowers,
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
          <span className="text-[14px] tracking-[0.2em] uppercase">Фильтры</span>
          <button onClick={onClose} aria-label="Close">
            <X size={20} strokeWidth={1.25} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          <Section title="Цвет">
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
          <Section title="Тип цветов">
            <CheckboxList
              options={flowerOptions}
              selected={selectedFlowers}
              onToggle={(v) => setSelectedFlowers(toggle(selectedFlowers, v))}
            />
          </Section>
        </div>
        <div className="flex border-t border-brand-border">
          <button
            onClick={() => {
              setSelectedColors([]);
              setSelectedFlowers([]);
            }}
            className="flex-1 h-14 text-[12px] tracking-[0.2em] uppercase text-brand-gray-light"
          >
            Сбросить
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-14 bg-brand-gray text-white text-[12px] tracking-[0.2em] uppercase"
          >
            Применить
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
  slug,
  title,
  desc,
  date,
  img,
  muted = false,
}: {
  slug?: string;
  title: string;
  desc: string;
  date: string;
  img: string;
  muted?: boolean;
}) {
  return (
    <Link
      to={slug ? `/event/${slug}` : "/events"}
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
