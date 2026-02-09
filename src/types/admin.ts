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
  errorCount?: number;
  errorMessage?: string;
  errorSamples?: string;
}

export interface ScrapeSourceStatus {
  source: string;
  status?: ScrapeStatus | string;
  startedAt?: string;
  completedAt?: string;
  jobsFound?: number;
  jobsSaved?: number;
  responseTimeMs?: number;
  errorCount?: number;
  errorMessage?: string;
  errorSamples?: string;
}

export interface ScrapeLogFilters {
  source?: string;
  status?: ScrapeStatus;
  page?: number;
  size?: number;
}

export interface ScrapeSummary {
  totalSources: number;
  latestStartedAt?: string;
  latestCompletedAt?: string;
  successCount: number;
  partialCount: number;
  failedCount: number;
  runningCount: number;
  sources: ScrapeSourceStatus[];
}
