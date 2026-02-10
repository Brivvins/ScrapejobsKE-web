import { useEffect, useState } from 'react';
import { searchJobs } from '../api/jobs';
import JobCard from '../components/JobCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import type { Job, JobSearchParams, Page } from '../types/job';

interface JobsPageProps {
  apiBase: string;
}

const defaultFilters: JobSearchParams = {
  keyword: '',
  location: '',
  category: '',
  sortBy: 'postedDate',
  sortDir: 'desc',
  page: 1,
  pageSize: 10,
};

export default function JobsPage({ apiBase }: JobsPageProps) {
  const [filters, setFilters] = useState<JobSearchParams>(defaultFilters);
  const [results, setResults] = useState<Page<Job> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async (nextFilters: JobSearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchJobs(apiBase, nextFilters);
      setResults(data);
      setFilters(nextFilters);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load jobs.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadJobs(filters);
  }, []);

  const jobs = results?.content ?? [];
  const pageNumber = results ? results.number + 1 : filters.page ?? 1;
  const totalPages = results?.totalPages ?? 0;

  return (
    <section className="space-y-5 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Public Jobs</CardTitle>
          <CardDescription>Search curated Kenyan job listings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(event) => {
              event.preventDefault();
              void loadJobs({ ...filters, page: 1 });
            }}
          >
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Keyword
              </label>
              <Input
                className="text-base sm:text-sm"
                value={filters.keyword}
                onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
                placeholder="e.g. frontend"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Location
              </label>
              <Input
                className="text-base sm:text-sm"
                value={filters.location}
                onChange={(event) => setFilters({ ...filters, location: event.target.value })}
                placeholder="e.g. Nairobi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Category
              </label>
              <Input
                className="text-base sm:text-sm"
                value={filters.category}
                onChange={(event) => setFilters({ ...filters, category: event.target.value })}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sort by
              </label>
              <Select
                className="text-base sm:text-sm"
                value={filters.sortBy}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    sortBy: event.target.value,
                    page: 1,
                  })
                }
              >
                {[
                  { value: 'postedDate', label: 'Posted date' },
                  { value: 'createdAt', label: 'Ingested date' },
                  { value: 'title', label: 'Title' },
                  { value: 'company', label: 'Company' },
                  { value: 'location', label: 'Location' },
                  { value: 'jobType', label: 'Job type' },
                  { value: 'category', label: 'Category' },
                  { value: 'source', label: 'Source' },
                ].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sort direction
              </label>
              <Select
                className="text-base sm:text-sm"
                value={filters.sortDir}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    sortDir: event.target.value as JobSearchParams['sortDir'],
                    page: 1,
                  })
                }
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Page size
              </label>
              <Select
                className="text-base sm:text-sm"
                value={filters.pageSize}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    pageSize: Number(event.target.value),
                    page: 1,
                  })
                }
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
              <Button className="w-full sm:w-auto" type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </Button>
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                type="button"
                onClick={() => void loadJobs({ ...defaultFilters })}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
            <span className="font-semibold text-foreground">
              {results ? `${results.totalElements} jobs` : 'No results yet'}
            </span>
            <span className="font-mono text-xs">GET {apiBase}/jobs/search</span>
          </div>

          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job, index) => (
          <JobCard key={job.id ?? `${job.title}-${index}`} job={job} index={index} />
        ))}
      </div>

      {!loading && jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center text-sm text-muted-foreground sm:text-left">
            No jobs match the current filters. Try a different keyword or location.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pageNumber} of {Math.max(totalPages, 1)}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              size="sm"
              onClick={() => void loadJobs({ ...filters, page: Math.max(1, pageNumber - 1) })}
              disabled={loading || pageNumber <= 1}
            >
              Previous
            </Button>
            <Button
              className="w-full sm:w-auto"
              variant="outline"
              size="sm"
              onClick={() => void loadJobs({ ...filters, page: pageNumber + 1 })}
              disabled={loading || (results?.last ?? false)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
