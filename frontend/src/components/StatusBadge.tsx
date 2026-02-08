import { cn } from '../lib/utils';
import type { ScrapeStatus } from '../types/admin';

interface StatusBadgeProps {
  status?: ScrapeStatus | string | null;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || 'unknown').toLowerCase();
  const tone = {
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    partial: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    failed: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    running: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
    unknown: 'bg-muted text-muted-foreground border-border',
  } as const;

  const classes = tone[normalized as keyof typeof tone] ?? tone.unknown;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        classes
      )}
    >
      {status || 'Unknown'}
    </span>
  );
}
