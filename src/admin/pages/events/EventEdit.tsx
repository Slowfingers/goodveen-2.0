import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { eventsApi } from '../../../lib/api';
import type { Event } from '../../../lib/api/types';
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  SectionTitle,
  Select,
  Textarea,
  Toggle,
} from '../../ui/form';
import { GalleryUpload, SingleImageUpload } from '../../ui/ImageUpload';
import { slugify } from '../../ui/utils';

const TAGS = ['Events', 'News', 'Photography', 'Press', 'Design', 'Workshop'];
const SIZES: { value: 'half' | 'full'; label: string }[] = [
  { value: 'half', label: 'Half (1 column)' },
  { value: 'full', label: 'Full (2 columns)' },
];

interface FormState {
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string | null;
  contentImages: string[];
  tag: string;
  size: 'half' | 'full';
  isPublished: boolean;
  publishedAt: string | null;
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  description: '',
  content: '',
  image: null,
  contentImages: [],
  tag: 'Events',
  size: 'half',
  isPublished: false,
  publishedAt: null,
};

export function EventEdit() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    let active = true;
    (async () => {
      try {
        const e = await eventsApi.getById(id!);
        if (!active) return;
        setForm({
          title: e.title,
          slug: e.slug,
          description: e.description ?? '',
          content: e.content ?? '',
          image: e.image,
          contentImages: e.contentImages,
          tag: e.tag,
          size: e.size,
          isPublished: e.isPublished,
          publishedAt: e.publishedAt,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isNew]);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description || null,
        content: form.content || null,
        image: form.image,
        contentImages: form.contentImages,
        tag: form.tag,
        size: form.size,
        isPublished: form.isPublished,
        publishedAt: form.publishedAt
          ? new Date(form.publishedAt).toISOString()
          : form.isPublished
          ? new Date().toISOString()
          : null,
      };
      let saved: Event;
      if (isNew) {
        saved = await eventsApi.create(payload);
        navigate(`/admin/events/${saved.id}`, { replace: true });
      } else {
        saved = await eventsApi.update(id!, payload);
        setForm((f) => ({ ...f, publishedAt: saved.publishedAt }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Loading…</div>;

  return (
    <div>
      <PageHeader
        title={isNew ? 'Новое событие' : form.title || 'Редактирование события'}
        back={
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-[#808080] hover:text-[#303030] mb-2"
          >
            <ArrowLeft size={12} /> Назад к событиям
          </Link>
        }
      >
        <Button variant="secondary" onClick={() => navigate('/admin/events')}>
          Отмена
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-6 text-[12px] text-red-700 bg-red-50 border border-red-100 px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <SectionTitle>Основная информация</SectionTitle>
            <div className="space-y-5">
              <Field label="Заголовок" required>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                      slug: f.slug ? f.slug : slugify(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Slug" required hint="URL-идентификатор">
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                />
              </Field>
              <Field label="Описание">
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
              <Field label="Контент" hint="Поддерживает обычный текст или Markdown">
                <Textarea
                  rows={12}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle>Изображение обложки</SectionTitle>
            <SingleImageUpload
              value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              folder="events"
              height="h-64"
            />
          </Card>

          <Card>
            <SectionTitle>Галерея контента</SectionTitle>
            <GalleryUpload
              value={form.contentImages}
              onChange={(v) => setForm((f) => ({ ...f, contentImages: v }))}
              folder="events"
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Публикация</SectionTitle>
            <div className="space-y-5">
              <Toggle
                checked={form.isPublished}
                onChange={(v) => setForm((f) => ({ ...f, isPublished: v }))}
                label="Опубликовано"
              />
              <Field label="Дата публикации">
                <Input
                  type="datetime-local"
                  value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null,
                    }))
                  }
                />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle>Категоризация</SectionTitle>
            <div className="space-y-5">
              <Field label="Тег">
                <Select
                  value={form.tag}
                  onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                >
                  {TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Grid size">
                <Select
                  value={form.size}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, size: e.target.value as 'half' | 'full' }))
                  }
                >
                  {SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
