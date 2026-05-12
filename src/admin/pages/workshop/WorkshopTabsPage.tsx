import { useEffect, useState } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { workshopApi } from '../../../lib/api';
import type { WorkshopTab, WorkshopPortfolioImage, WorkshopContentBlock } from '../../../lib/api/types';
import { Button, Card, Field, Input, PageHeader, Textarea } from '../../ui/form';
import { SingleImageUpload } from '../../ui/ImageUpload';

export function WorkshopTabsPage() {
  const [tabs, setTabs] = useState<WorkshopTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingTab, setEditingTab] = useState<Partial<WorkshopTab>>({});

  const refresh = async () => {
    setLoading(true);
    const data = await workshopApi.listAllTabs();
    setTabs(data);
    if (data.length > 0 && !activeTabId) setActiveTabId(data[0].id);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      setEditingTab({
        title: activeTab.title,
        slug: activeTab.slug,
        description: activeTab.description,
        isActive: activeTab.isActive,
      });
    }
  }, [activeTab?.id]);

  const createTab = async () => {
    const title = prompt('Tab title (e.g., "Events"):');
    if (!title) return;
    const slug = title.toLowerCase().replace(/\s+/g, '-');
    try {
      await workshopApi.createTab({ slug, title, sortOrder: tabs.length });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create tab');
    }
  };

  const updateTab = async (id: string, data: Partial<WorkshopTab>) => {
    try {
      await workshopApi.updateTab(id, data);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update tab');
    }
  };

  const deleteTab = async (id: string) => {
    if (!confirm('Delete this tab?')) return;
    try {
      await workshopApi.deleteTab(id);
      await refresh();
      if (activeTabId === id) setActiveTabId(tabs[0]?.id || null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete tab');
    }
  };

  const addPortfolioImage = async (tabId: string, url: string) => {
    try {
      setSaving(true);
      await workshopApi.addPortfolioImage({
        tabId,
        url,
        sortOrder: activeTab?.portfolioImages.length || 0,
      });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add image');
    } finally {
      setSaving(false);
    }
  };

  const deletePortfolioImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await workshopApi.deletePortfolioImage(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete image');
    }
  };

  const addContentBlock = async (tabId: string) => {
    const title = prompt('Block title (optional):');
    const content = prompt('Block content:');
    if (!content) return;
    try {
      await workshopApi.addContentBlock({
        tabId,
        title: title || undefined,
        content,
        sortOrder: activeTab?.contentBlocks.length || 0,
      });
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add block');
    }
  };

  const updateContentBlock = async (id: string, data: Partial<WorkshopContentBlock>) => {
    try {
      await workshopApi.updateContentBlock(id, data);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update block');
    }
  };

  const deleteContentBlock = async (id: string) => {
    if (!confirm('Delete this content block?')) return;
    try {
      await workshopApi.deleteContentBlock(id);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete block');
    }
  };

  return (
    <div>
      <PageHeader title="Workshop Tabs" />

      {loading && <div className="text-[12px] text-[#808080]">Loading…</div>}

      <div className="flex gap-6">
        {/* Sidebar - Tab List */}
        <div className="w-64 flex-shrink-0">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">Tabs</h3>
              <Button onClick={createTab} size="sm">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`w-full text-left px-3 py-2 text-[12px] transition-colors ${
                    activeTabId === tab.id
                      ? 'bg-[#2E7D5B] text-white'
                      : 'bg-[#F5F5F5] text-[#303030] hover:bg-[#E8E8E8]'
                  }`}
                >
                  {tab.title}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Content - Tab Editor */}
        {activeTab && (
          <div className="flex-1 space-y-6">
            {/* Tab Settings */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
                <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">
                  Tab Settings
                </h3>
                <Button onClick={() => deleteTab(activeTab.id)} variant="danger" size="sm">
                  <Trash2 size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                <Field label="Title">
                  <Input
                    value={editingTab.title || ''}
                    onChange={(e) => setEditingTab({ ...editingTab, title: e.target.value })}
                    onBlur={() => updateTab(activeTab.id, { title: editingTab.title })}
                  />
                </Field>
                <Field label="Slug">
                  <Input
                    value={editingTab.slug || ''}
                    onChange={(e) => setEditingTab({ ...editingTab, slug: e.target.value })}
                    onBlur={() => updateTab(activeTab.id, { slug: editingTab.slug })}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={3}
                    value={editingTab.description || ''}
                    onChange={(e) => setEditingTab({ ...editingTab, description: e.target.value || null })}
                    onBlur={() => updateTab(activeTab.id, { description: editingTab.description })}
                  />
                </Field>
                <Field label="Active">
                  <input
                    type="checkbox"
                    checked={editingTab.isActive ?? false}
                    onChange={(e) => {
                      setEditingTab({ ...editingTab, isActive: e.target.checked });
                      updateTab(activeTab.id, { isActive: e.target.checked });
                    }}
                    className="w-4 h-4"
                  />
                </Field>
              </div>
            </Card>

            {/* Portfolio Images */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
                <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">
                  Portfolio Images
                </h3>
              </div>
              <div className="space-y-4">
                {activeTab.portfolioImages.map((img) => (
                  <div key={img.id} className="flex gap-4 items-start p-4 border border-[#EEE]">
                    <img src={img.url} alt="" className="w-32 h-32 object-cover" />
                    <div className="flex-1 space-y-2">
                      <Field label="Caption">
                        <Input
                          value={img.caption || ''}
                          onChange={(e) =>
                            workshopApi.updatePortfolioImage(img.id, {
                              caption: e.target.value || null,
                            }).then(refresh)
                          }
                        />
                      </Field>
                    </div>
                    <Button
                      onClick={() => deletePortfolioImage(img.id)}
                      variant="danger"
                      size="sm"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed border-[#CCC] p-4">
                  <p className="text-[12px] text-[#808080] mb-2">Add Portfolio Image</p>
                  <SingleImageUpload
                    value={null}
                    onChange={(url) => url && addPortfolioImage(activeTab.id, url)}
                    folder="workshop"
                    height="h-48"
                  />
                </div>
              </div>
            </Card>

            {/* Content Blocks */}
            <Card>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EEE]">
                <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030]">
                  Content Blocks
                </h3>
                <Button onClick={() => addContentBlock(activeTab.id)} size="sm">
                  <Plus size={16} />
                </Button>
              </div>
              <div className="space-y-4">
                {activeTab.contentBlocks.map((block) => (
                  <div key={block.id} className="p-4 border border-[#EEE] space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <Field label="Title (optional)">
                          <Input
                            value={block.title || ''}
                            onChange={(e) =>
                              updateContentBlock(block.id, { title: e.target.value || null })
                            }
                          />
                        </Field>
                      </div>
                      <Button
                        onClick={() => deleteContentBlock(block.id)}
                        variant="danger"
                        size="sm"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <Field label="Content">
                      <Textarea
                        rows={6}
                        value={block.content}
                        onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
