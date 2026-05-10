import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { pagesApi } from '../../../lib/api';
import type { ContactSettings } from '../../../lib/api/types';
import { Button, Card, Field, Input, PageHeader, Textarea } from '../../ui/form';

export function ContactEdit() {
  const [data, setData] = useState<ContactSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const contact = await pagesApi.getContact();
        if (active) setData(contact);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Ошибка загрузки');
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
    setError(null);
    try {
      await pagesApi.updateContact({
        address: data.address,
        addressNote: data.addressNote,
        phones: data.phones,
        email: data.email,
        emailNote: data.emailNote,
        openHours: data.openHours,
        instagram: data.instagram,
        facebook: data.facebook,
        telegram: data.telegram,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const addPhone = () => {
    if (!data) return;
    setData({ ...data, phones: [...data.phones, ''] });
  };

  const updatePhone = (index: number, value: string) => {
    if (!data) return;
    const phones = [...data.phones];
    phones[index] = value;
    setData({ ...data, phones });
  };

  const removePhone = (index: number) => {
    if (!data) return;
    setData({ ...data, phones: data.phones.filter((_, i) => i !== index) });
  };

  if (loading || !data)
    return <div className="text-[12px] uppercase tracking-[0.2em] text-[#808080]">Загрузка…</div>;

  return (
    <div>
      <PageHeader title="Страница Контакты">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-6 text-[12px] text-red-700 bg-red-50 border border-red-100 px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030] mb-4 pb-2 border-b border-[#EEE]">
            Адрес
          </h3>
          <div className="space-y-5">
            <Field label="Адрес" required>
              <Input
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
              />
            </Field>
            <Field label="Примечание к адресу" hint="Опциональная информация">
              <Input
                value={data.addressNote ?? ''}
                onChange={(e) => setData({ ...data, addressNote: e.target.value || null })}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
            <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">
              Номера телефонов
            </h3>
            <Button variant="secondary" onClick={addPhone}>
              <Plus size={14} /> Добавить
            </Button>
          </div>
          <div className="space-y-3">
            {data.phones.map((phone, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={phone}
                  onChange={(e) => updatePhone(idx, e.target.value)}
                  placeholder="+998 XX XXX XX XX"
                />
                <button
                  type="button"
                  onClick={() => removePhone(idx)}
                  className="text-[#808080] hover:text-red-600 p-2"
                  aria-label="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {data.phones.length === 0 && (
              <div className="text-[13px] text-[#808080] italic">Пока нет номеров телефонов.</div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030] mb-4 pb-2 border-b border-[#EEE]">
            Email
          </h3>
          <div className="space-y-5">
            <Field label="Email" required>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </Field>
            <Field label="Примечание к email" hint="Опциональное описание">
              <Input
                value={data.emailNote ?? ''}
                onChange={(e) => setData({ ...data, emailNote: e.target.value || null })}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030] mb-4 pb-2 border-b border-[#EEE]">
            Часы работы и соцсети
          </h3>
          <div className="space-y-5">
            <Field label="Часы работы">
              <Input
                value={data.openHours}
                onChange={(e) => setData({ ...data, openHours: e.target.value })}
              />
            </Field>
            <Field label="Instagram URL">
              <Input
                value={data.instagram ?? ''}
                onChange={(e) => setData({ ...data, instagram: e.target.value || null })}
                placeholder="https://instagram.com/goodveen"
              />
            </Field>
            <Field label="Facebook URL">
              <Input
                value={data.facebook ?? ''}
                onChange={(e) => setData({ ...data, facebook: e.target.value || null })}
                placeholder="https://facebook.com/goodveen"
              />
            </Field>
            <Field label="Telegram URL">
              <Input
                value={data.telegram ?? ''}
                onChange={(e) => setData({ ...data, telegram: e.target.value || null })}
                placeholder="https://t.me/goodveenuz"
              />
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
