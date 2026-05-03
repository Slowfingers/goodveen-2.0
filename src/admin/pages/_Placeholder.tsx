import type { ReactNode } from 'react';

export function Placeholder({ title, description }: { title: string; description?: ReactNode }) {
  return (
    <div>
      <h1 className="text-[28px] tracking-[0.04em] text-[#303030] mb-4">{title}</h1>
      <div className="bg-white border border-dashed border-[#EEE] px-6 py-10 text-[13px] text-[#808080]">
        {description ?? 'Coming soon — this section is under construction.'}
      </div>
    </div>
  );
}
