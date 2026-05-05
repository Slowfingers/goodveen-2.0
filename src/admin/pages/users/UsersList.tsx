import { useEffect, useState } from 'react';
import { usersApi } from '../../../lib/api';
import type { User } from '../../../lib/api/types';
import { Card, PageHeader, Select } from '../../ui/form';
import { formatDate } from '../../ui/utils';

export function UsersList() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setItems(await usersApi.list());
    setLoading(false);
  };
  useEffect(() => {
    refresh();
  }, []);

  const setRole = async (id: string, role: User['role']) => {
    try {
      const updated = await usersApi.updateRole(id, role);
      setItems((s) => s.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка');
    }
  };

  return (
    <div>
      <PageHeader title="Пользователи" />

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F7F4EF] text-left text-[11px] uppercase tracking-[0.2em] text-[#808080]">
              <th className="px-6 py-3">Пользователь</th>
              <th className="px-6 py-3">Телефон</th>
              <th className="px-6 py-3 w-32">Регистрация</th>
              <th className="px-6 py-3 w-40">Роль</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={4}>
                  Загрузка…
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-[#808080]" colSpan={4}>
                  Пока нет пользователей.
                </td>
              </tr>
            )}
            {items.map((u) => (
              <tr key={u.id} className="border-t border-[#EEE]">
                <td className="px-6 py-3">
                  <div className="text-[#303030]">{u.name ?? '—'}</div>
                  <div className="text-[11px] text-[#808080]">{u.email}</div>
                </td>
                <td className="px-6 py-3 text-[#808080]">{u.phone ?? '—'}</td>
                <td className="px-6 py-3 text-[#808080]">{formatDate(u.createdAt)}</td>
                <td className="px-6 py-3">
                  <Select
                    value={u.role}
                    onChange={(e) => setRole(u.id, e.target.value as User['role'])}
                  >
                    <option value="CUSTOMER">Клиент</option>
                    <option value="ADMIN">Администратор</option>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
