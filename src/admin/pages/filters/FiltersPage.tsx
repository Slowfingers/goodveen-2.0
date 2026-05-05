import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { filtersApi } from '../../../lib/api';
import type { FilterColor, FilterFlowerType } from '../../../lib/api/types';
import { Button, Card, Input, PageHeader, SectionTitle, Toggle } from '../../ui/form';

export function FiltersPage() {
  return (
    <div>
      <PageHeader title="Фильтры" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ColorsBlock />
        <FlowerTypesBlock />
      </div>
    </div>
  );
}

// ============================================================
// Colors
// ============================================================
function ColorsBlock() {
  const [items, setItems] = useState<FilterColor[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setItems(await filtersApi.listColors());
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const update = (id: string, patch: Partial<FilterColor>) =>
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const persist = async (item: FilterColor) => {
    try {
      const saved = await filtersApi.updateColor(item.id, {
        name: item.name,
        hex: item.hex,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
      update(item.id, saved);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const add = async () => {
    try {
      const created = await filtersApi.createColor({
        name: `Цвет ${items.length + 1}`,
        hex: '#888888',
        sortOrder: items.length,
        isActive: true,
      });
      setItems((s) => [...s, created]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить этот цвет?')) return;
    try {
      await filtersApi.removeColor(id);
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
        <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">Цвета</h3>
        <Button variant="secondary" onClick={add}>
          <Plus size={14} /> Добавить
        </Button>
      </div>

      {loading && <div className="text-[12px] text-[#808080]">Загрузка…</div>}

      <div className="space-y-2">
        {items.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[auto_1fr_120px_60px_auto] gap-3 items-center"
          >
            <input
              type="color"
              value={c.hex}
              onChange={(e) => update(c.id, { hex: e.target.value })}
              onBlur={() => persist(c)}
              className="w-9 h-9 border border-[#EEE] cursor-pointer"
            />
            <Input
              value={c.name}
              onChange={(e) => update(c.id, { name: e.target.value })}
              onBlur={() => persist(c)}
            />
            <Input
              value={c.hex}
              onChange={(e) => update(c.id, { hex: e.target.value })}
              onBlur={() => persist(c)}
              className="font-mono text-[12px]"
            />
            <Toggle
              checked={c.isActive}
              onChange={(v) => {
                update(c.id, { isActive: v });
                persist({ ...c, isActive: v });
              }}
            />
            <button
              type="button"
              onClick={() => remove(c.id)}
              className="text-[#808080] hover:text-red-600 p-2"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================
// Flower types
// ============================================================
function FlowerTypesBlock() {
  const [items, setItems] = useState<FilterFlowerType[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setItems(await filtersApi.listFlowerTypes());
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const update = (id: string, patch: Partial<FilterFlowerType>) =>
    setItems((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const persist = async (item: FilterFlowerType) => {
    try {
      const saved = await filtersApi.updateFlowerType(item.id, {
        name: item.name,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      });
      update(item.id, saved);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const add = async () => {
    try {
      const created = await filtersApi.createFlowerType({
        name: `Тип ${items.length + 1}`,
        sortOrder: items.length,
        isActive: true,
      });
      setItems((s) => [...s, created]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Удалить этот тип?')) return;
    try {
      await filtersApi.removeFlowerType(id);
      setItems((s) => s.filter((x) => x.id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
        <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">Типы цветов</h3>
        <Button variant="secondary" onClick={add}>
          <Plus size={14} /> Добавить
        </Button>
      </div>

      {loading && <div className="text-[12px] text-[#808080]">Загрузка…</div>}

      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_60px_auto] gap-3 items-center">
            <Input
              value={c.name}
              onChange={(e) => update(c.id, { name: e.target.value })}
              onBlur={() => persist(c)}
            />
            <Toggle
              checked={c.isActive}
              onChange={(v) => {
                update(c.id, { isActive: v });
                persist({ ...c, isActive: v });
              }}
            />
            <button
              type="button"
              onClick={() => remove(c.id)}
              className="text-[#808080] hover:text-red-600 p-2"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
