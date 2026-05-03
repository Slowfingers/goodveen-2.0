import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { apiUpload } from '../../lib/api/client';

type Folder = 'products' | 'events' | 'pages' | 'about';

// ============================================================
// Single image upload (with preview)
// ============================================================
export function SingleImageUpload({
  value,
  onChange,
  folder,
  className = '',
  height = 'h-48',
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  folder: Folder;
  className?: string;
  height?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      const url = await apiUpload(folder, file);
      onChange(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <div
        className={`relative ${height} bg-[#F7F4EF] border border-dashed border-[#D0D0D0] flex items-center justify-center overflow-hidden`}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="text-[12px] tracking-[0.2em] uppercase text-[#808080]">No image</div>
        )}

        {busy && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-[#303030]" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#EEE] hover:border-[#303030] text-[12px] tracking-[0.18em] uppercase"
        >
          <ImagePlus size={14} /> {value ? 'Replace' : 'Upload'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] tracking-[0.18em] uppercase text-[#808080] hover:text-red-600"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {err && <div className="mt-2 text-[12px] text-red-600">{err}</div>}
    </div>
  );
}

// ============================================================
// Multi-image gallery — array of urls
// ============================================================
export function GalleryUpload({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  folder: Folder;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFiles = async (files: FileList) => {
    setBusy(true);
    setErr(null);
    try {
      const uploads = await Promise.all(Array.from(files).map((f) => apiUpload(folder, f)));
      onChange([...value, ...uploads]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const remove = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="relative aspect-square bg-[#F7F4EF] border border-[#EEE] overflow-hidden group"
          >
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white border border-[#EEE] flex items-center justify-center text-[#808080] hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              aria-label="Remove"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="aspect-square bg-white border border-dashed border-[#D0D0D0] flex flex-col items-center justify-center gap-2 hover:border-[#303030] hover:bg-[#F7F4EF] transition"
        >
          {busy ? (
            <Loader2 size={18} className="animate-spin text-[#303030]" />
          ) : (
            <ImagePlus size={18} className="text-[#808080]" />
          )}
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#808080]">Add</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {err && <div className="mt-2 text-[12px] text-red-600">{err}</div>}
    </div>
  );
}
