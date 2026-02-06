export type ScrapeStatus = 'RUNNING' | 'PARTIAL' | 'SUCCESS' | 'FAILED';

export interface ScrapeLog {
  id: number;
  source: string;
  status: ScrapeStatus;
  jobsFound?: number;
  jobsSaved?: number;
  startedAt?: string;
  completedAt?: string;
  responseTimeMs?: number;
  errorMessage?: string;
}

export interface ScrapeSourceStatus {
  source: string;
  status?: ScrapeStatus | string;
  startedAt?: string;
  completedAt?: string;
  jobsFound?: number;
  jobsSaved?: number;
  responseTimeMs?: number;
  errorMessage?: string;
}

export interface ScrapeLogFilters {
  source?: string;
  status?: ScrapeStatus;
  page?: number;
  size?: number;
}
