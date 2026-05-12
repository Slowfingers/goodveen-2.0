import { useEffect, useState } from 'react';
import { workshopApi, pagesApi } from '../lib/api';
import type { WorkshopTab, PageSetting } from '../lib/api/types';

export function Workshop() {
  const [tabs, setTabs] = useState<WorkshopTab[]>([]);
  const [activeTab, setActiveTab] = useState<WorkshopTab | null>(null);
  const [pageSetting, setPageSetting] = useState<PageSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    document.title = 'Goodveen - Corporate Solutions';
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      try {
        const [tabsData, settings] = await Promise.all([
          workshopApi.listTabs().catch(() => []),
          pagesApi.listSettings().catch(() => []),
        ]);
        if (!active) return;
        setTabs(tabsData);
        if (tabsData.length > 0) setActiveTab(tabsData[0]);
        const workshopSetting = settings.find((s) => s.pageKey === 'workshop');
        setPageSetting(workshopSetting || null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const heroImage =
    pageSetting?.heroImage ||
    'https://images.unsplash.com/photo-1455659817273-f96807779a8a?q=80&w=2400&auto=format&fit=crop';
  const title = pageSetting?.title || 'Corporate Solutions';
  const subtitle = pageSetting?.subtitle || 'Tailored botanical artistry for corporate environments, luxury hospitality, and exclusive events worldwide';

  const handleTabChange = (tab: WorkshopTab) => {
    if (tab.id === activeTab?.id) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="w-full bg-white">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[480px] md:h-[680px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-black/70 to-transparent" />

        <div className="h-[84px]" />
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-16 flex flex-col items-start gap-3 md:gap-4">
          <h1 className="text-white text-[48px] md:text-[72px] leading-[1.05] tracking-[0.01em] font-light">
            {title}
          </h1>
          <p className="text-white/85 text-[14px] md:text-[16px] tracking-[0.04em] max-w-[640px]">
            {subtitle}
          </p>
        </div>
      </section>

      {/* ===== TABS ===== */}
      {tabs.length > 0 && (
        <section className="w-full flex justify-center py-[40px] md:py-[60px] px-5 md:px-10 border-b border-brand-border">
          <div className="w-full max-w-[1360px] flex flex-col gap-8">
            {/* Tab Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab)}
                  className={`px-6 py-3 text-[12px] md:text-[13px] tracking-[0.2em] uppercase transition-all duration-300 transform ${
                    activeTab?.id === tab.id
                      ? 'bg-[#2E7D5B] text-white scale-105 shadow-lg'
                      : 'bg-[#F5F0E1] text-brand-gray hover:bg-[#E8E3D5] hover:scale-[1.02]'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Tab Description */}
            {activeTab?.description && (
              <div 
                className={`text-center max-w-[800px] mx-auto transition-all duration-500 ${
                  isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                }`}
              >
                <p className="text-[14px] md:text-[16px] leading-[1.7] text-brand-gray">
                  {activeTab.description}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== PORTFOLIO IMAGES ===== */}
      {activeTab && activeTab.portfolioImages.length > 0 && (
        <section 
          className={`w-full flex justify-center py-[60px] md:py-[80px] px-5 md:px-10 border-b border-brand-border transition-all duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="w-full max-w-[1360px]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {activeTab.portfolioImages.map((img, idx) => (
                <div
                  key={img.id}
                  className={`relative overflow-hidden transition-all duration-500 ${
                    idx % 5 === 0 ? 'col-span-2 h-[320px] md:h-[480px]' : 'h-[200px] md:h-[280px]'
                  } ${
                    isTransitioning 
                      ? 'opacity-0 translate-y-4' 
                      : 'opacity-100 translate-y-0'
                  }`}
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <img
                    src={img.url}
                    alt={img.caption || `Portfolio ${idx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                  {img.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-[12px] md:text-[14px]">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CONTENT BLOCKS ===== */}
      {activeTab && activeTab.contentBlocks.length > 0 && (
        <section 
          className={`w-full flex justify-center py-[60px] md:py-[80px] px-5 md:px-10 transition-all duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="w-full max-w-[1000px] flex flex-col gap-12 md:gap-16">
            {activeTab.contentBlocks.map((block, idx) => (
              <div 
                key={block.id} 
                className={`flex flex-col gap-4 transition-all duration-500 ${
                  isTransitioning 
                    ? 'opacity-0 translate-y-4' 
                    : 'opacity-100 translate-y-0'
                }`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                {block.title && (
                  <h3 className="text-[28px] md:text-[36px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
                    {block.title}
                  </h3>
                )}
                <div className="text-[15px] md:text-[16px] leading-[1.7] text-brand-gray whitespace-pre-wrap">
                  {block.content}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== EMPTY STATE ===== */}
      {tabs.length === 0 && !loading && (
        <section className="w-full flex justify-center py-[120px] px-5 md:px-10">
          <div className="text-center max-w-[600px]">
            <p className="text-[14px] text-brand-gray-light">
              No predefined packages available in this category currently.
            </p>
            <p className="text-[13px] text-brand-gray-light mt-2">
              Please contact us for custom tailored solutions.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
