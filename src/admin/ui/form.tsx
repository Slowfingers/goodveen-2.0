import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId, useState } from 'react';
import { X } from 'lucide-react';

// ============================================================
// Field (label + control wrapper)
// ============================================================
export function Field({
  label,
  hint,
  error,
  children,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.2em] text-[#808080] mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {children}
      {hint && !error && <span className="block text-[11px] text-[#808080] mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  );
}

// ============================================================
// Input
// ============================================================
export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full border border-[#EEE] px-3 py-2.5 text-[14px] focus:border-[#303030] outline-none bg-white ${className}`}
    />
  );
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full border border-[#EEE] px-3 py-2.5 text-[14px] focus:border-[#303030] outline-none bg-white resize-y ${className}`}
    />
  );
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full border border-[#EEE] px-3 py-2.5 text-[14px] focus:border-[#303030] outline-none bg-white ${className}`}
    >
      {children}
    </select>
  );
}

// ============================================================
// Toggle
// ============================================================
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label
      className="inline-flex items-center gap-3 cursor-pointer select-none"
      onClick={() => onChange(!checked)}
    >
      <span
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#303030]' : 'bg-[#D0D0D0]'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </span>
      {label && <span className="text-[13px] text-[#303030]">{label}</span>}
    </label>
  );
}

// ============================================================
// Tags input — string[] with chips
// ============================================================
export function TagsInput({
  value,
  onChange,
  placeholder = 'Type and press Enter',
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const id = useId();

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setDraft('');
  };

  return (
    <div className="border border-[#EEE] bg-white px-2 py-2 flex flex-wrap items-center gap-2 focus-within:border-[#303030]">
      {value.map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-1 bg-[#F7F4EF] text-[13px] text-[#303030] px-2 py-1"
        >
          {t}
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x !== t))}
            className="text-[#808080] hover:text-[#303030]"
            aria-label="Remove"
          >
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add();
          } else if (e.key === 'Backspace' && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={placeholder}
        className="flex-1 min-w-[120px] outline-none text-[14px] py-1 px-1"
      />
    </div>
  );
}

// ============================================================
// Multi-select chips (checkbox list as chips)
// ============================================================
export function ChipMultiSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; color?: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o.value);
        return (
          <button
            type="button"
            key={o.value}
            onClick={() =>
              onChange(active ? value.filter((v) => v !== o.value) : [...value, o.value])
            }
            className={`flex items-center gap-2 px-3 py-1.5 border text-[13px] transition-colors ${
              active
                ? 'border-[#303030] bg-[#303030] text-white'
                : 'border-[#EEE] bg-white text-[#303030] hover:border-[#303030]'
            }`}
          >
            {o.color && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-black/10"
                style={{ background: o.color }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// Buttons
// ============================================================
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
const variants: Record<Variant, string> = {
  primary: 'bg-[#303030] text-white hover:bg-[#1f1f1f]',
  secondary: 'bg-white text-[#303030] border border-[#EEE] hover:border-[#303030]',
  danger: 'bg-white text-red-600 border border-red-200 hover:border-red-600',
  ghost: 'text-[#808080] hover:text-[#303030]',
};
export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[12px] tracking-[0.18em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    />
  );
}

// ============================================================
// Page header (title + action slot)
// ============================================================
export function PageHeader({
  title,
  back,
  children,
}: {
  title: string;
  back?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        {back}
        <h1 className="text-[28px] tracking-[0.04em] text-[#303030]">{title}</h1>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ============================================================
// Card section
// ============================================================
export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
  key?: string | number;
}) {
  return (
    <div className={`bg-white border border-[#EEE] p-6 md:p-8 ${className}`}>{children}</div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[13px] uppercase tracking-[0.2em] text-[#303030] mb-4 pb-2 border-b border-[#EEE]">
      {children}
    </h3>
  );
}
