import { fetchJson } from './client';
import type { Job, JobSearchParams, Page } from '../types/job';

export async function searchJobs(
  apiBase: string,
  params: JobSearchParams
): Promise<Page<Job>> {
  const query = new URLSearchParams();

  if (params.keyword) query.set('keyword', params.keyword);
  if (params.location) query.set('location', params.location);
  if (params.category) query.set('category', params.category);
  if (typeof params.page === 'number') query.set('page', String(params.page));
  if (typeof params.pageSize === 'number') query.set('pageSize', String(params.pageSize));

  const url = `${apiBase}/jobs/search?${query.toString()}`;
  return fetchJson<Page<Job>>(url);
}
