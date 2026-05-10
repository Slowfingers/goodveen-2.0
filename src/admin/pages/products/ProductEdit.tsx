import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { categoriesApi, filtersApi, productsApi } from '../../../lib/api';
import type {
  Category,
  FilterColor,
  FilterFlowerType,
  Product,
  ProductImage,
  ProductSize,
} from '../../../lib/api/types';
import {
  Button,
  Card,
  ChipMultiSelect,
  Field,
  Input,
  PageHeader,
  SectionTitle,
  Select,
  TagsInput,
  Textarea,
  Toggle,
} from '../../ui/form';
import { GalleryUpload } from '../../ui/ImageUpload';
import { slugify } from '../../ui/utils';

interface FormState {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  composition: string[];
  careTips: string[];
  colors: string[];
  flowerTypes: string[];
}

const EMPTY: FormState = {
  name: '',
  slug: '',
  description: '',
  categoryId: '',
  isActive: true,
  isFeatured: false,
  composition: [],
  careTips: [],
  colors: [],
  flowerTypes: [],
};

export function ProductEdit() {
  const { id } = useParams<{ id?: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [colorOptions, setColorOptions] = useState<FilterColor[]>([]);
  const [flowerOptions, setFlowerOptions] = useState<FilterFlowerType[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [cats, colors, flowers] = await Promise.all([
          categoriesApi.list(),
          filtersApi.listColors(),
          filtersApi.listFlowerTypes(),
        ]);
        if (!active) return;
        setCategories(cats);
        setColorOptions(colors);
        setFlowerOptions(flowers);

        if (!isNew) {
          const product = await productsApi.getById(id!);
          if (!active) return;
          setForm({
            name: product.name,
            slug: product.slug,
            description: product.description ?? '',
            categoryId: product.categoryId,
            isActive: product.isActive,
            isFeatured: product.isFeatured,
            composition: product.composition,
            careTips: product.careTips,
            colors: product.colors,
            flowerTypes: product.flowerTypes,
          });
          setSizes(product.sizes ?? []);
          setImages(product.images ?? []);
        } else if (cats[0]) {
          setForm((f) => ({ ...f, categoryId: cats[0].id }));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isNew]);

  // === Save / persist ===
  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || slugify(form.name),
        description: form.description || null,
        categoryId: form.categoryId,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        composition: form.composition,
        careTips: form.careTips,
        colors: form.colors,
        flowerTypes: form.flowerTypes,
      };
      let product: Product;
      if (isNew) {
        product = await productsApi.create(payload);
      } else {
        product = await productsApi.update(id!, payload);
      }
      // After creation we redirect to edit URL so sizes/images can be added against an id
      if (isNew) {
        navigate(`/admin/products/${product.id}`, { replace: true });
      } else {
        // refresh sizes/images sourced fresh
        const fresh = await productsApi.getById(product.id);
        setSizes(fresh.sizes ?? []);
        setImages(fresh.images ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  // === Sizes ===
  const addSize = async () => {
    if (isNew) {
      alert('Сначала сохраните товар, затем можно добавить размеры.');
      return;
    }
    try {
      const created = await productsApi.addSize(id!, {
        name: 'M',
        price: 0,
        height: '',
        isAvailable: true,
        sortOrder: sizes.length,
      });
      setSizes((s) => [...s, created]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };
  const updateSizeField = (sizeId: string, patch: Partial<ProductSize>) =>
    setSizes((s) => s.map((it) => (it.id === sizeId ? { ...it, ...patch } : it)));
  const persistSize = async (size: ProductSize) => {
    try {
      const saved = await productsApi.updateSize(size.id, {
        name: size.name,
        price: size.price,
        height: size.height,
        isAvailable: size.isAvailable,
        sortOrder: size.sortOrder,
      });
      updateSizeField(size.id, saved);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to save size');
    }
  };
  const removeSize = async (sizeId: string) => {
    if (!confirm('Удалить этот размер?')) return;
    try {
      await productsApi.removeSize(sizeId);
      setSizes((s) => s.filter((x) => x.id !== sizeId));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  // === Images (gallery wrapper that syncs to product_images table) ===
  const galleryUrls = useMemo(() => images.map((i) => i.url), [images]);
  const onGalleryChange = async (next: string[]) => {
    // Diff next vs current and add/remove on the server
    const prevUrls = images.map((i) => i.url);
    const added = next.filter((u) => !prevUrls.includes(u));
    const removed = images.filter((i) => !next.includes(i.url));

    if (isNew) {
      alert('Сначала сохраните товар, затем можно добавить изображения.');
      return;
    }

    try {
      // Remove images that disappeared
      for (const img of removed) {
        await productsApi.removeImage(img.id);
      }
      // Add new ones
      const additions: ProductImage[] = [];
      for (let idx = 0; idx < added.length; idx++) {
        const url = added[idx];
        const created = await productsApi.addImage(id!, { url, sortOrder: prevUrls.length + idx });
        additions.push(created);
      }
      setImages((cur) => [
        ...cur.filter((i) => !removed.includes(i)),
        ...additions,
      ]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка синхронизации изображений');
    }
  };

  if (loading) {
    return (
      <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Загрузка…</div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isNew ? 'Новый товар' : form.name || 'Редактирование товара'}
        back={
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-[#808080] hover:text-[#303030] mb-2"
          >
            <ArrowLeft size={12} /> Назад к товарам
          </Link>
        }
      >
        <Button variant="secondary" onClick={() => navigate('/admin/products')}>
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
          {/* Basic */}
          <Card>
            <SectionTitle>Основная информация</SectionTitle>
            <div className="space-y-5">
              <Field label="Название" required>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
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
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
              <Field label="Категория" required>
                <Select
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">Выберите категорию…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          {/* Sizes */}
          <Card>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
              <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">
                Размеры и цены
              </h3>
              <Button variant="secondary" onClick={addSize}>
                <Plus size={14} /> Добавить размер
              </Button>
            </div>
            {sizes.length === 0 && (
              <div className="text-[13px] text-[#808080] italic">
                {isNew ? 'Сначала сохраните товар, чтобы добавить размеры.' : 'Пока нет размеров — добавьте первый.'}
              </div>
            )}
            <div className="space-y-3">
              {sizes.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto_auto] gap-3 items-center border border-[#EEE] p-3"
                >
                  <Input
                    placeholder="Название (M / L / XL)"
                    value={s.name}
                    onChange={(e) => updateSizeField(s.id, { name: e.target.value })}
                    onBlur={() => persistSize(s)}
                  />
                  <Input
                    type="number"
                    placeholder="Цена"
                    value={s.price}
                    onChange={(e) =>
                      updateSizeField(s.id, { price: Number(e.target.value) || 0 })
                    }
                    onBlur={() => persistSize(s)}
                  />
                  <Input
                    placeholder="Высота (35 см)"
                    value={s.height ?? ''}
                    onChange={(e) => updateSizeField(s.id, { height: e.target.value })}
                    onBlur={() => persistSize(s)}
                  />
                  <Toggle
                    checked={s.isAvailable}
                    onChange={(v) => {
                      updateSizeField(s.id, { isAvailable: v });
                      persistSize({ ...s, isAvailable: v });
                    }}
                    label="В наличии"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(s.id)}
                    className="text-[#808080] hover:text-red-600 p-2"
                    aria-label="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Images */}
          <Card>
            <SectionTitle>Галерея</SectionTitle>
            {isNew ? (
              <div className="text-[13px] text-[#808080] italic">
                Сначала сохраните товар, чтобы загрузить изображения.
              </div>
            ) : (
              <GalleryUpload value={galleryUrls} onChange={onGalleryChange} folder="products" />
            )}
          </Card>

          {/* Composition + Care */}
          <Card>
            <SectionTitle>Состав и уход</SectionTitle>
            <div className="space-y-5">
              <Field label="Состав" hint="Нажмите Enter для добавления">
                <TagsInput
                  value={form.composition}
                  onChange={(v) => setForm((f) => ({ ...f, composition: v }))}
                  placeholder="напр. Садовые розы · 9 стеблей"
                />
              </Field>
              <Field label="Советы по уходу" hint="Нажмите Enter для добавления">
                <TagsInput
                  value={form.careTips}
                  onChange={(v) => setForm((f) => ({ ...f, careTips: v }))}
                  placeholder="напр. Подрезайте стебли каждые 2 дня"
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <SectionTitle>Видимость</SectionTitle>
            <div className="space-y-4">
              <Toggle
                checked={form.isActive}
                onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                label="Активен (виден на сайте)"
              />
              <Toggle
                checked={form.isFeatured}
                onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
                label="Рекомендуемый на главной"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle>Фильтры — цвета</SectionTitle>
            <ChipMultiSelect
              options={colorOptions
                .filter((c) => c.isActive)
                .map((c) => ({ value: c.name, label: c.name, color: c.hex }))}
              value={form.colors}
              onChange={(v) => setForm((f) => ({ ...f, colors: v }))}
            />
          </Card>

          <Card>
            <SectionTitle>Фильтры — типы цветов</SectionTitle>
            <ChipMultiSelect
              options={flowerOptions
                .filter((c) => c.isActive)
                .map((c) => ({ value: c.name, label: c.name }))}
              value={form.flowerTypes}
              onChange={(v) => setForm((f) => ({ ...f, flowerTypes: v }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
