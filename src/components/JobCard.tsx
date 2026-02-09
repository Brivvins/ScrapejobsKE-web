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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="bg-primary/10 text-primary">
            {job.category || 'Uncategorized'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {job.source || 'Unknown source'}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-snug">{job.title}</h3>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>{job.company}</span>
            <span>•</span>
            <span>{job.location || 'Remote/Unlisted'}</span>
            <span>•</span>
            <span>{job.jobType || 'Role type N/A'}</span>
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
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
