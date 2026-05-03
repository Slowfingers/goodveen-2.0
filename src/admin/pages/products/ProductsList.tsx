import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { categoriesApi, productsApi } from '../../../lib/api';
import type { Category, Product } from '../../../lib/api/types';
import { Button, Card, Input, PageHeader, Select } from '../../ui/form';
import { formatPrice } from '../../ui/utils';

export function ProductsList() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  const refresh = async () => {
    setLoading(true);
    const [products, cats] = await Promise.all([productsApi.list(), categoriesApi.list()]);
    setItems(products);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryId && p.categoryId !== categoryId) return false;
      if (statusFilter === 'active' && !p.isActive) return false;
      if (statusFilter === 'hidden' && p.isActive) return false;
      return true;
    });
  }, [items, search, categoryId, statusFilter]);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await productsApi.remove(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div>
      <PageHeader title="Products">
        <Link to="/admin/products/new">
          <Button>
            <Plus size={14} /> New product
          </Button>
        </Link>
      </PageHeader>

      <Card className="mb-6 p-4 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#808080]"
            />
            <Input
              placeholder="Search by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'hidden')}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </Select>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F7F4EF] text-left text-[11px] uppercase tracking-[0.2em] text-[#808080]">
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price from</th>
              <th className="px-6 py-3 w-28">Status</th>
              <th className="px-6 py-3 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={5}>
                  {items.length === 0 ? 'No products yet.' : 'Nothing matches your filters.'}
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const minPrice = p.sizes?.length
                ? Math.min(...p.sizes.map((s) => s.price))
                : null;
              const cover = p.images?.[0]?.url;
              return (
                <tr key={p.id} className="border-t border-[#EEE] hover:bg-[#FAFAF7]">
                  <td className="px-6 py-3">
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="flex items-center gap-3 text-[#303030]"
                    >
                      {cover ? (
                        <img src={cover} alt="" className="w-12 h-12 object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-[#F7F4EF]" />
                      )}
                      <span>
                        <span className="block">{p.name}</span>
                        <span className="block text-[11px] text-[#808080] font-mono">{p.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-[#808080]">{p.category?.name ?? '—'}</td>
                  <td className="px-6 py-3 text-[#303030]">
                    {minPrice != null ? formatPrice(minPrice) : '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`text-[11px] uppercase tracking-[0.18em] ${
                        p.isActive ? 'text-emerald-700' : 'text-[#ABA094]'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                    {p.isFeatured && (
                      <span className="ml-2 text-[11px] uppercase tracking-[0.18em] text-[#7A5C2A]">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="p-2 text-[#808080] hover:text-[#303030]"
                        aria-label="Edit"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="p-2 text-[#808080] hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
