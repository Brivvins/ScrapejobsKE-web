export interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  source?: string;
  sourceUrl?: string;
  category?: string;
  jobType?: string;
  salaryRange?: string;
  postedDate?: string;
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface JobSearchParams {
  keyword?: string;
  location?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}
