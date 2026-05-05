import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { eventsApi, pagesApi } from '../lib/api';
import type { Event, PageSetting } from '../lib/api/types';

export function Workshop() {
  const [events, setEvents] = useState<Event[]>([]);
  const [pageSetting, setPageSetting] = useState<PageSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      try {
        const [evts, settings] = await Promise.all([
          eventsApi.list({ onlyPublished: true, tag: 'workshop' }).catch(() => []),
          pagesApi.listSettings().catch(() => []),
        ]);
        if (!active) return;
        setEvents(evts);
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
  const title = pageSetting?.title || 'Workshop';
  const subtitle = pageSetting?.subtitle || 'Where creativity blooms';

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

      {/* ===== INTRO ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Our creative space
            </h2>
          </div>
          <div className="flex flex-col gap-6 text-[15px] md:text-[16px] leading-[1.7] text-brand-gray">
            <p>
              The Goodveen workshop is where every bouquet begins its journey — from concept to
              creation. Here, our florists craft each arrangement by hand, blending artistry with
              nature's finest blooms.
            </p>
            <p>
              We host intimate masterclasses, seasonal workshops, and creative sessions for those
              who want to learn the craft. Whether you're a beginner or an enthusiast, our space
              welcomes you to explore the art of floristry.
            </p>
          </div>
        </div>
      </section>

      {/* ===== WORKSHOP IMAGES ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
          <div className="relative overflow-hidden h-[280px] md:h-[480px]">
            <img
              src="https://images.unsplash.com/photo-1466690672306-5f92132f7248?q=80&w=2400&auto=format&fit=crop"
              alt="Workshop"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden h-[280px] md:h-[480px]">
            <img
              src="https://images.unsplash.com/photo-1455659817273-f96807779a8a?q=80&w=2400&auto=format&fit=crop"
              alt="Workshop detail"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ===== UPCOMING WORKSHOPS ===== */}
      {events.length > 0 && (
        <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
          <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
            <div className="flex flex-col w-full">
              <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
                Upcoming workshops
              </h2>
              <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
                Join us for a creative session
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-10">
              {events.slice(0, 6).map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group flex flex-col border border-brand-border hover:border-brand-gray transition-colors"
                >
                  <div className="relative overflow-hidden h-[240px] border-b border-brand-border">
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5 bg-white">
                    <h3 className="text-brand-gray text-[14px] tracking-[0.2em] uppercase mb-2">
                      {event.title}
                    </h3>
                    <p className="text-brand-gray-light text-[13px] leading-[1.6] line-clamp-2">
                      {event.description}
                    </p>
                    {event.publishedAt && (
                      <p className="text-brand-gray-light text-[11px] uppercase tracking-[0.18em] mt-3">
                        {new Date(event.publishedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== VISIT US ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div className="flex flex-col gap-6">
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Visit our workshop
            </h2>
            <p className="text-[15px] md:text-[16px] leading-[1.7] text-brand-gray">
              Our doors are open every day from 09:00 to 21:00. Drop by to see our florists at
              work, browse our fresh selection, or simply enjoy the atmosphere.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors mt-4"
            >
              Get directions
              <ArrowRight size={20} strokeWidth={1.25} />
            </Link>
          </div>
          <div className="relative overflow-hidden h-[320px] md:h-[480px]">
            <img
              src="https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop"
              alt="Workshop space"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
