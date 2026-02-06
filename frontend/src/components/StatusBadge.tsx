import type { ScrapeStatus } from '../types/admin';

interface StatusBadgeProps {
  status?: ScrapeStatus | string | null;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || 'unknown').toLowerCase();
  const className = `status-badge ${normalized}`;

  return <span className={className}>{status || 'Unknown'}</span>;
}
