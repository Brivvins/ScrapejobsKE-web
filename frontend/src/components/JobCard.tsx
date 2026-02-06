import type { Job } from '../types/job';

const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  return value;
};

interface JobCardProps {
  job: Job;
  index: number;
}

export default function JobCard({ job, index }: JobCardProps) {
  return (
    <article className="job-card" style={{ animationDelay: `${index * 40}ms` }}>
      <div>
        <p className="pill">{job.category || 'Uncategorized'}</p>
        <h3 className="job-title">{job.title}</h3>
        <div className="job-meta">
          <span>{job.company}</span>
          <span>{job.location || 'Remote/Unlisted'}</span>
          <span>{job.jobType || 'Role type N/A'}</span>
        </div>
      </div>
      <div className="job-footer">
        <span>Posted {formatDate(job.postedDate)}</span>
        <span>{job.source || 'Unknown source'}</span>
      </div>
      {job.sourceUrl ? (
        <a href={job.sourceUrl} target="_blank" rel="noreferrer">
          View source
        </a>
      ) : null}
    </article>
  );
}
