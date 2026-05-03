import { useEffect, useState } from 'react';
import { pagesApi } from '../../../lib/api';
import type { AboutPage } from '../../../lib/api/types';
import { Button, Card, PageHeader, SectionTitle } from '../../ui/form';
import { GalleryUpload } from '../../ui/ImageUpload';

export function AboutPageEdit() {
  const [data, setData] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const d = await pagesApi.getAbout();
        if (active) setData(d);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await pagesApi.updateAbout({
        spaceImages: data.spaceImages,
        workshopPhotos: data.workshopPhotos,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data)
    return <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Loading…</div>;

  return (
    <div>
      <PageHeader title="About page">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </PageHeader>

      <div className="space-y-6">
        <Card>
          <SectionTitle>Our space — slider images</SectionTitle>
          <GalleryUpload
            value={data.spaceImages}
            onChange={(v) => setData({ ...data, spaceImages: v })}
            folder="about"
          />
        </Card>

        <Card>
          <SectionTitle>Workshop life — photos</SectionTitle>
          <GalleryUpload
            value={data.workshopPhotos}
            onChange={(v) => setData({ ...data, workshopPhotos: v })}
            folder="about"
          />
        </Card>
      </div>
    </div>
  );
}
