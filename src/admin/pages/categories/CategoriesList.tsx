import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { categoriesApi } from '../../../lib/api';
import type { Category } from '../../../lib/api/types';
import { Button, Card, Field, Input, PageHeader, Textarea, Toggle } from '../../ui/form';
import { SingleImageUpload } from '../../ui/ImageUpload';
import { slugify } from '../../ui/utils';

type Editing = Partial<Category> | null;

export function CategoriesList() {
  const [items, setItems] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await categoriesApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onSave = async () => {
    if (!editing) return;
    setError(null);
    try {
      const payload = {
        name: editing.name ?? '',
        slug: editing.slug ?? '',
        description: editing.description ?? null,
        image: editing.image ?? null,
        sortOrder: editing.sortOrder ?? 0,
        isActive: editing.isActive ?? true,
      };
      if (editing.id) {
        await categoriesApi.update(editing.id, payload);
      } else {
        await categoriesApi.create(payload);
      }
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Удалить эту категорию? Сначала нужно переназначить товары.')) return;
    try {
      await categoriesApi.remove(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  return (
    <div>
      <PageHeader title="Категории">
        <Button onClick={() => setEditing({ isActive: true, sortOrder: items.length })}>
          <Plus size={14} /> Новая категория
        </Button>
      </PageHeader>

      {loading ? (
        <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Загрузка…</div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="bg-[#F7F4EF] text-left text-[11px] uppercase tracking-[0.2em] text-[#808080]">
                <th className="px-6 py-3 w-16">#</th>
                <th className="px-6 py-3">Название</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3 w-28">Статус</th>
                <th className="px-6 py-3 w-28 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-[#808080]" colSpan={5}>
                    Пока нет категорий.
                  </td>
                </tr>
              )}
              {items.map((c) => (
                <tr key={c.id} className="border-t border-[#EEE] hover:bg-[#FAFAF7]">
                  <td className="px-6 py-3 text-[#808080]">{c.sortOrder}</td>
                  <td className="px-6 py-3 text-[#303030]">
                    <div className="flex items-center gap-3">
                      {c.image ? (
                        <img src={c.image} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-[#F7F4EF]" />
                      )}
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-[#808080] font-mono text-[12px]">{c.slug}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-[11px] uppercase tracking-[0.18em] ${
                        c.isActive ? 'text-emerald-700' : 'text-[#ABA094]'
                      }`}
                    >
                      {c.isActive ? 'Активна' : 'Скрыта'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        className="p-2 text-[#808080] hover:text-[#303030]"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c.id)}
                        className="p-2 text-[#808080] hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editing && (
        <CategoryEditor
          value={editing}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          error={error}
        />
      )}
    </div>
  );
}

function CategoryEditor({
  value,
  onChange,
  onClose,
  onSave,
  error,
}: {
  value: Partial<Category>;
  onChange: (v: Partial<Category>) => void;
  onClose: () => void;
  onSave: () => void;
  error: string | null;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#EEE] flex items-center justify-between">
          <div className="text-[14px] uppercase tracking-[0.2em] text-[#303030]">
            {value.id ? 'Редактирование категории' : 'Новая категория'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#808080] hover:text-[#303030] text-[12px] tracking-[0.2em] uppercase"
          >
            Закрыть
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Название" required>
            <Input
              value={value.name ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  name: e.target.value,
                  slug: value.slug ? value.slug : slugify(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Slug" required hint="URL-идентификатор (напр. bukety)">
            <Input
              value={value.slug ?? ''}
              onChange={(e) => onChange({ ...value, slug: slugify(e.target.value) })}
            />
          </Field>
          <Field label="Описание">
            <Textarea
              rows={3}
              value={value.description ?? ''}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
            />
          </Field>
          <Field label="Изображение обложки">
            <SingleImageUpload
              value={value.image}
              onChange={(url) => onChange({ ...value, image: url })}
              folder="pages"
            />
          </Field>
          <div className="grid grid-cols-2 gap-5">
            <Field label="Порядок сортировки">
              <Input
                type="number"
                value={value.sortOrder ?? 0}
                onChange={(e) =>
                  onChange({ ...value, sortOrder: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle
                checked={value.isActive ?? true}
                onChange={(v) => onChange({ ...value, isActive: v })}
                label="Активна (видна на сайте)"
              />
            </div>
          </div>

          {error && (
            <div className="text-[12px] text-red-700 bg-red-50 border border-red-100 px-3 py-2">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#EEE] flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
