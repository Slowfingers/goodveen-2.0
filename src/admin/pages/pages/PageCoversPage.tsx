import { useEffect, useState } from 'react';
import { pagesApi } from '../../../lib/api';
import type { PageSetting } from '../../../lib/api/types';
import { Button, Card, Field, Input, PageHeader, SectionTitle, Textarea } from '../../ui/form';
import { SingleImageUpload } from '../../ui/ImageUpload';

const DEFAULT_PAGES: { key: string; label: string }[] = [
  { key: 'home', label: 'Home page' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'events', label: 'Events' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'about', label: 'About' },
];

export function PageCoversPage() {
  const [items, setItems] = useState<PageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setItems(await pagesApi.listSettings());
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  // Merge default keys with existing data so user sees all pages
  const merged = DEFAULT_PAGES.map((d) => {
    const existing = items.find((it) => it.pageKey === d.key);
    return {
      label: d.label,
      pageKey: d.key,
      heroImage: existing?.heroImage ?? null,
      heroVideo: existing?.heroVideo ?? null,
      title: existing?.title ?? '',
      subtitle: existing?.subtitle ?? '',
    };
  });

  const update = (key: string, patch: Partial<PageSetting>) => {
    setItems((curr) => {
      const idx = curr.findIndex((c) => c.pageKey === key);
      if (idx === -1) {
        return [
          ...curr,
          {
            id: 'new-' + key,
            pageKey: key,
            heroImage: null,
            heroVideo: null,
            title: '',
            subtitle: '',
            ...patch,
          } as PageSetting,
        ];
      }
      const copy = curr.slice();
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const save = async (key: string) => {
    const item = merged.find((m) => m.pageKey === key);
    if (!item) return;
    setSaving(key);
    try {
      await pagesApi.upsertSetting({
        pageKey: item.pageKey,
        heroImage: item.heroImage,
        heroVideo: item.heroVideo,
        title: item.title,
        subtitle: item.subtitle,
      });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <PageHeader title="Page covers" />

      {loading && <div className="text-[12px] text-[#808080]">Loading…</div>}

      <div className="space-y-6">
        {merged.map((p) => (
          <Card key={p.pageKey}>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
              <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">{p.label}</h3>
              <Button onClick={() => save(p.pageKey)} disabled={saving === p.pageKey}>
                {saving === p.pageKey ? 'Saving…' : 'Save'}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
              <SingleImageUpload
                value={p.heroImage}
                onChange={(url) => update(p.pageKey, { heroImage: url })}
                folder="pages"
                height="h-64"
              />
              <div className="space-y-4">
                <Field label="Title">
                  <Input
                    value={p.title ?? ''}
                    onChange={(e) => update(p.pageKey, { title: e.target.value })}
                  />
                </Field>
                <Field label="Subtitle">
                  <Textarea
                    rows={3}
                    value={p.subtitle ?? ''}
                    onChange={(e) => update(p.pageKey, { subtitle: e.target.value })}
                  />
                </Field>
                <Field label="Hero video URL" hint="Optional. Mp4 served from /uploads or external URL.">
                  <Input
                    value={p.heroVideo ?? ''}
                    onChange={(e) => update(p.pageKey, { heroVideo: e.target.value || null })}
                  />
                </Field>
              </div>
            </div>
            <SectionTitle>{''}</SectionTitle>
          </Card>
        ))}
      </div>
    </div>
  );
}
