import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
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
    <Card className="fade-up border-border/70 bg-background/70" style={{ animationDelay: `${index * 40}ms` }}>
      <CardContent className="flex h-full flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:min-w-0">
          <Badge className="bg-primary/10 text-primary">
            {job.category || 'Uncategorized'}
          </Badge>
          <span className="break-words text-xs text-muted-foreground sm:ml-auto sm:max-w-[50%] sm:text-right sm:truncate">
            {job.source || 'Unknown source'}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="break-words text-lg font-semibold leading-snug">{job.title}</h3>
          <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            <span>{job.company}</span>
            <span>•</span>
            <span>{job.location || 'Remote/Unlisted'}</span>
            <span>•</span>
            <span>{job.jobType || 'Role type N/A'}</span>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Posted {formatDate(job.postedDate)}</span>
          {job.sourceUrl ? (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              View source
            </a>
          ) : (
            <span className="text-muted-foreground">Source link N/A</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
