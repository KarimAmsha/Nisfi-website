import type { ReactNode } from "react";

/**
 * Empty state: explains why the area is empty and offers one relevant next
 * action (master spec Section 14.5).
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface/60 px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-primary-50 text-primary-700">
        {icon}
      </span>
      <h3 className="text-base font-bold text-ink text-balance">{title}</h3>
      <p className="max-w-[42ch] text-sm text-ink-600">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
