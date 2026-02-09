import { fetchJson } from './client';
import type { ScrapeLog, ScrapeLogFilters, ScrapeSourceStatus, ScrapeSummary } from '../types/admin';
import type { Page } from '../types/job';

export async function fetchScrapeLogs(
  adminBase: string,
  filters: ScrapeLogFilters,
  token?: string
): Promise<Page<ScrapeLog>> {
  const query = new URLSearchParams();

  if (filters.source) query.set('source', filters.source);
  if (filters.status) query.set('status', filters.status);
  if (typeof filters.page === 'number') query.set('page', String(filters.page));
  if (typeof filters.size === 'number') query.set('size', String(filters.size));

  const queryString = query.toString();
  const url = queryString ? `${adminBase}/scrape/logs?${queryString}` : `${adminBase}/scrape/logs`;

  return fetchJson<Page<ScrapeLog>>(url, {}, token);
}

export async function fetchScrapeStatus(
  adminBase: string,
  token?: string
): Promise<ScrapeSourceStatus[]> {
  return fetchJson<ScrapeSourceStatus[]>(`${adminBase}/scrape/status`, {}, token);
}

export async function fetchScrapeSummary(
  adminBase: string,
  token?: string
): Promise<ScrapeSummary> {
  return fetchJson<ScrapeSummary>(`${adminBase}/scrape/summary`, {}, token);
}

export async function runScraper(adminBase: string, token?: string): Promise<void> {
  await fetchJson(`${adminBase}/scrape/run`, { method: 'GET' }, token);
}
