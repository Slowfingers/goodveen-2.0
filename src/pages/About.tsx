import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pagesApi } from '../lib/api';
import type { AboutPage, PageSetting } from '../lib/api/types';

export function About() {
  const [aboutData, setAboutData] = useState<AboutPage | null>(null);
  const [pageSetting, setPageSetting] = useState<PageSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    let active = true;
    (async () => {
      try {
        const [about, settings] = await Promise.all([
          pagesApi.getAbout().catch(() => null),
          pagesApi.listSettings().catch(() => []),
        ]);
        if (!active) return;
        setAboutData(about);
        const aboutSetting = settings.find((s) => s.pageKey === 'about');
        setPageSetting(aboutSetting || null);
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
    'https://images.unsplash.com/photo-1502422770281-2292f700eb1b?q=80&w=2400&auto=format&fit=crop';
  const title = pageSetting?.title || 'About Goodveen';
  const subtitle = pageSetting?.subtitle || 'Emotions in bloom since 2015';

  const spaceImages = aboutData?.spaceImages || [
    'https://images.unsplash.com/photo-1466690672306-5f92132f7248?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1455659817273-f96807779a8a?q=80&w=2400&auto=format&fit=crop',
  ];

  const workshopPhotos = aboutData?.workshopPhotos || [
    'https://images.unsplash.com/photo-1510076857177-7470076d4098?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502422770281-2292f700eb1b?q=80&w=2400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549420078-d4469796bb82?q=80&w=2400&auto=format&fit=crop',
  ];

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

      {/* ===== OUR STORY ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Our story
            </h2>
          </div>
          <div className="flex flex-col gap-6 text-[15px] md:text-[16px] leading-[1.7] text-brand-gray">
            <p>
              Goodveen began in 2015 as a small atelier in the heart of Tashkent, driven by a
              simple belief: flowers are more than decoration — they are emotions, memories, and
              moments made tangible.
            </p>
            <p>
              What started as a passion project has grown into a creative studio where artistry
              meets nature. Every bouquet we create is a collaboration between our florists and the
              seasons, shaped by color, texture, and the stories our clients share with us.
            </p>
            <p>
              Today, we serve individuals, events, and brands across Uzbekistan, but our approach
              remains the same: thoughtful, personal, and crafted by hand.
            </p>
          </div>
        </div>
      </section>

      {/* ===== OUR SPACE ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full">
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Our space
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
              Where creativity blooms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10">
            {spaceImages.slice(0, 2).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden h-[280px] md:h-[480px]">
                <img
                  src={img}
                  alt={`Our space ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div className="flex flex-col gap-6 text-[15px] md:text-[16px] leading-[1.7] text-brand-gray">
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Our philosophy
            </h2>
            <p>
              We believe in slow floristry — taking the time to understand each client, each
              occasion, and each bloom. Our arrangements are never rushed, never mass-produced.
            </p>
            <p>
              We source locally when possible, work with seasonal flowers, and design with
              intention. Every bouquet tells a story, and we're honored to be part of yours.
            </p>
          </div>
          <div className="relative overflow-hidden h-[320px] md:h-[480px]">
            <img
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=2400&auto=format&fit=crop"
              alt="Our philosophy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ===== WORKSHOP LIFE ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
          <div className="flex flex-col w-full">
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Workshop life
            </h2>
            <p className="text-[12px] md:text-[14px] tracking-[0.2em] text-brand-gray-light uppercase mt-1">
              Behind the scenes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10">
            {workshopPhotos.slice(0, 3).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden h-[240px] md:h-[360px]">
                <img
                  src={img}
                  alt={`Workshop ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISIT US ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
        <div className="w-full max-w-[1360px] grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
          <div className="flex flex-col gap-6">
            <h2 className="text-[40px] md:text-[64px] font-normal leading-[1.1] tracking-[0.02em] text-brand-gray">
              Visit us
            </h2>
            <p className="text-[15px] md:text-[16px] leading-[1.7] text-brand-gray">
              Our atelier is open every day from 09:00 to 21:00. Come see our florists at work,
              browse our seasonal selection, or simply enjoy a moment surrounded by blooms.
            </p>
            <div className="flex flex-col gap-3 text-[14px] text-brand-gray">
              <p>
                <strong>Address:</strong> Tashkent, Uzbekiston Ovozi street 2/1
              </p>
              <p>
                <strong>Phone:</strong> +998 71 233 97 80
              </p>
              <p>
                <strong>Email:</strong> hello@goodveen.uz
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors mt-4"
            >
              Get in touch
              <ArrowRight size={20} strokeWidth={1.25} />
            </Link>
          </div>
          <div className="relative overflow-hidden h-[320px] md:h-[480px]">
            <img
              src="https://images.unsplash.com/photo-1549420078-d4469796bb82?q=80&w=2400&auto=format&fit=crop"
              alt="Visit us"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
