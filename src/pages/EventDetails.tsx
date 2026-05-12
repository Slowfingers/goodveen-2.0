import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Instagram, Send, Facebook, Share2, Clock } from 'lucide-react';
import { eventsApi } from '../lib/api';
import type { Event as ApiEvent } from '../lib/api/types';

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1490262112932-3ad770daeead?q=80&w=2400&auto=format&fit=crop';

function formatDate(input: string | null): string {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function readingTime(text: string | null | undefined): string {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

export function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [related, setRelated] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = event ? `Goodveen - ${event.title}` : 'Goodveen - Событие';
  }, [event]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        // Try by slug first, then by id
        let e: ApiEvent | null = null;
        try {
          e = await eventsApi.getBySlug(id);
        } catch {
          try {
            e = await eventsApi.getById(id);
          } catch {
            e = null;
          }
        }
        if (!active) return;
        if (!e) {
          setNotFound(true);
          return;
        }
        setEvent(e);
        const all = await eventsApi.list({ onlyPublished: true });
        if (!active) return;
        setRelated(all.filter((x) => x.id !== e!.id).slice(0, 3));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
        Loading…
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center gap-4">
        <h2 className="text-[28px] md:text-[40px] font-light tracking-[0.02em] text-brand-gray">
          Story not found
        </h2>
        <Link
          to="/events"
          className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light hover:text-brand-gray"
        >
          ← Back to all stories
        </Link>
      </div>
    );
  }

  // Split content into paragraph blocks. Lines starting with '## ' become h2, '> ' blockquote.
  const blocks: { type: 'p' | 'h2' | 'quote'; text: string }[] = (event.content ?? '')
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith('## ')) return { type: 'h2' as const, text: chunk.slice(3).trim() };
      if (chunk.startsWith('> ')) return { type: 'quote' as const, text: chunk.slice(2).trim() };
      return { type: 'p' as const, text: chunk };
    });

  const hero = event.image || FALLBACK_HERO;
  const date = formatDate(event.publishedAt ?? event.createdAt);

  return (
    <div className="w-full bg-white">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[480px] md:h-[680px] -mt-[60px] flex flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${hero}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="h-[84px]" />
        <div className="relative z-10 mt-auto w-full max-w-[1440px] mx-auto px-5 md:px-10 pb-10 md:pb-16">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-white/85 text-[11px] md:text-[12px] tracking-[0.25em] uppercase mb-6 md:mb-10 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={1.25} />
            All stories
          </Link>
          <div className="flex items-center gap-3 mb-4 md:mb-5 flex-wrap">
            <span className="bg-white text-brand-gray text-[10px] md:text-[11px] tracking-[0.2em] uppercase px-2 py-1">
              #{event.tag}
            </span>
            {date && (
              <span className="text-white/85 text-[11px] md:text-[12px] tracking-[0.15em]">
                {date}
              </span>
            )}
            <span className="text-white/60 text-[11px] md:text-[12px] flex items-center gap-1.5">
              <Clock size={12} strokeWidth={1.5} />
              {readingTime(event.content)}
            </span>
          </div>
          <h1 className="text-white text-[40px] md:text-[80px] leading-[1.05] tracking-[0.01em] font-light max-w-[1100px]">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-white/85 text-[14px] md:text-[16px] tracking-[0.05em] mt-4 md:mt-6 max-w-[760px]">
              {event.description}
            </p>
          )}
        </div>
      </section>

      {/* ===== ARTICLE ===== */}
      <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10 border-b border-brand-border">
        <div className="w-full max-w-[800px] flex flex-col gap-6 md:gap-8">
          {/* Share row */}
          <div className="flex items-center justify-end gap-4 pb-6 md:pb-8 border-b border-brand-border">
            <ShareButtons />
          </div>

          {/* Body */}
          {blocks.length === 0 ? (
            <p className="text-[15px] md:text-[17px] leading-[24px] md:leading-[28px] text-brand-gray-light italic">
              {event.description ?? 'Story coming soon.'}
            </p>
          ) : (
            <div className="flex flex-col gap-6 md:gap-8">
              {blocks.map((b, idx) => {
                if (b.type === 'h2') {
                  return (
                    <h2
                      key={`h2-${idx}`}
                      className="text-[24px] md:text-[32px] font-light leading-[1.2] tracking-[0.01em] text-brand-gray pt-4 md:pt-6"
                    >
                      {b.text}
                    </h2>
                  );
                }
                if (b.type === 'quote') {
                  return (
                    <blockquote
                      key={`quote-${idx}`}
                      className="border-l-2 border-brand-taupe pl-5 md:pl-8 py-2 md:py-4 text-[18px] md:text-[24px] leading-[28px] md:leading-[34px] font-light text-brand-gray italic"
                    >
                      {b.text}
                    </blockquote>
                  );
                }
                return (
                  <p
                    key={`p-${idx}`}
                    className="text-[15px] md:text-[17px] leading-[24px] md:leading-[28px] text-brand-gray-light whitespace-pre-line"
                  >
                    {b.text}
                  </p>
                );
              })}
            </div>
          )}

          {/* Content gallery */}
          {event.contentImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6 md:mt-10">
              {event.contentImages.map((src, idx) => (
                <figure key={src + idx} className="-mx-5 md:mx-0">
                  <div className="relative w-full h-[260px] md:h-[400px] overflow-hidden">
                    <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                </figure>
              ))}
            </div>
          )}

          {/* Footer share */}
          <div className="flex items-center justify-between gap-4 pt-8 md:pt-10 border-t border-brand-border">
            <span className="text-[12px] tracking-[0.2em] uppercase text-brand-gray-light">
              Share this story
            </span>
            <ShareButtons />
          </div>
        </div>
      </section>

      {/* ===== RELATED ===== */}
      {related.length > 0 && (
        <section className="w-full flex justify-center py-[60px] md:py-[120px] px-5 md:px-10">
          <div className="w-full max-w-[1360px] flex flex-col gap-6 md:gap-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[32px] md:text-[48px] font-light leading-[1.05] tracking-[0.01em] text-brand-gray">
                  Keep reading
                </h2>
                <p className="text-[12px] tracking-[0.2em] text-brand-gray-light uppercase mt-2">
                  More stories from the studio
                </p>
              </div>
              <Link
                to="/events"
                className="hidden md:flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase text-brand-gray hover:text-brand-taupe transition-colors"
              >
                All stories
                <ArrowRight size={16} strokeWidth={1.25} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-10 md:h-[420px]">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/events/${r.slug}`}
                  className="relative group overflow-hidden flex flex-col justify-end p-5 h-[260px] md:h-full"
                >
                  <img
                    src={r.image || FALLBACK_HERO}
                    alt={r.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <h4 className="relative z-10 text-white text-[12px] md:text-[14px] tracking-[0.15em] uppercase mb-2">
                    {r.title}
                  </h4>
                  <span className="relative z-10 text-white/85 text-[11px] md:text-[12px]">
                    {formatDate(r.publishedAt ?? r.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ShareButtons() {
  return (
    <div className="flex items-center gap-2">
      <ShareIcon ariaLabel="Share on Instagram">
        <Instagram size={16} strokeWidth={1.25} />
      </ShareIcon>
      <ShareIcon ariaLabel="Share on Telegram">
        <Send size={16} strokeWidth={1.25} />
      </ShareIcon>
      <ShareIcon ariaLabel="Share on Facebook">
        <Facebook size={16} strokeWidth={1.25} />
      </ShareIcon>
      <ShareIcon ariaLabel="Copy link">
        <Share2 size={16} strokeWidth={1.25} />
      </ShareIcon>
    </div>
  );
}

function ShareIcon({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <button
      aria-label={ariaLabel}
      className="w-9 h-9 border border-brand-border text-brand-gray-light hover:text-brand-gray hover:border-brand-gray-light transition-colors flex items-center justify-center"
    >
      {children}
    </button>
  );
}
