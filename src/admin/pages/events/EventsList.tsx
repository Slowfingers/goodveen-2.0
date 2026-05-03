import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { eventsApi } from '../../../lib/api';
import type { Event } from '../../../lib/api/types';
import { Button, Card, PageHeader } from '../../ui/form';
import { formatDate } from '../../ui/utils';

export function EventsList() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await eventsApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const onDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventsApi.remove(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div>
      <PageHeader title="Events">
        <Link to="/admin/events/new">
          <Button>
            <Plus size={14} /> New event
          </Button>
        </Link>
      </PageHeader>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F7F4EF] text-left text-[11px] uppercase tracking-[0.2em] text-[#808080]">
              <th className="px-6 py-3">Event</th>
              <th className="px-6 py-3 w-32">Tag</th>
              <th className="px-6 py-3 w-32">Published</th>
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
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={5}>
                  No events yet.
                </td>
              </tr>
            )}
            {items.map((e) => (
              <tr key={e.id} className="border-t border-[#EEE] hover:bg-[#FAFAF7]">
                <td className="px-6 py-3">
                  <Link
                    to={`/admin/events/${e.id}`}
                    className="flex items-center gap-3 text-[#303030]"
                  >
                    {e.image ? (
                      <img src={e.image} alt="" className="w-12 h-12 object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-[#F7F4EF]" />
                    )}
                    <span>
                      <span className="block">{e.title}</span>
                      <span className="block text-[11px] text-[#808080] font-mono">{e.slug}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-6 py-3 text-[#808080]">{e.tag}</td>
                <td className="px-6 py-3 text-[#808080]">{formatDate(e.publishedAt)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`text-[11px] uppercase tracking-[0.18em] ${
                      e.isPublished ? 'text-emerald-700' : 'text-[#ABA094]'
                    }`}
                  >
                    {e.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      to={`/admin/events/${e.id}`}
                      className="p-2 text-[#808080] hover:text-[#303030]"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(e.id)}
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
    </div>
  );
}
