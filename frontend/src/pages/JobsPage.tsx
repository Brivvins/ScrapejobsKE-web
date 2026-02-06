import { useEffect, useState } from 'react';
import { searchJobs } from '../api/jobs';
import JobCard from '../components/JobCard';
import type { Job, JobSearchParams, Page } from '../types/job';

interface JobsPageProps {
  apiBase: string;
}

const defaultFilters: JobSearchParams = {
  keyword: '',
  location: '',
  category: '',
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
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Public Jobs</h2>
          <p>GET {apiBase}/jobs/search</p>
        </div>
        <p className="status-line">
          {results ? `${results.totalElements} total jobs` : 'No results yet'}
        </p>
      </div>

      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          void loadJobs({ ...filters, page: 1 });
        }}
      >
        <label className="field">
          Keyword
          <input
            value={filters.keyword}
            onChange={(event) => setFilters({ ...filters, keyword: event.target.value })}
            placeholder="e.g. frontend"
          />
        </label>
        <label className="field">
          Location
          <input
            value={filters.location}
            onChange={(event) => setFilters({ ...filters, location: event.target.value })}
            placeholder="e.g. Nairobi"
          />
        </label>
        <label className="field">
          Category
          <input
            value={filters.category}
            onChange={(event) => setFilters({ ...filters, category: event.target.value })}
            placeholder="e.g. Engineering"
          />
        </label>
        <label className="field">
          Page size
          <select
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
          </select>
        </label>
        <div className="actions">
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
          <button
            className="ghost"
            type="button"
            onClick={() => void loadJobs({ ...defaultFilters })}
            disabled={loading}
          >
            Reset
          </button>
        </div>
      </form>

      {error ? <p className="status-line">{error}</p> : null}

      <div className="jobs-grid">
        {jobs.map((job, index) => (
          <JobCard key={job.id ?? `${job.title}-${index}`} job={job} index={index} />
        ))}
      </div>

      {!loading && jobs.length === 0 ? (
        <p className="status-line">No jobs match the current filters.</p>
      ) : null}

      <div className="actions">
        <button
          className="ghost"
          type="button"
          onClick={() => void loadJobs({ ...filters, page: Math.max(1, pageNumber - 1) })}
          disabled={loading || pageNumber <= 1}
        >
          Previous
        </button>
        <span className="status-line">
          Page {pageNumber} of {Math.max(totalPages, 1)}
        </span>
        <button
          className="ghost"
          type="button"
          onClick={() => void loadJobs({ ...filters, page: pageNumber + 1 })}
          disabled={loading || (results?.last ?? false)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
