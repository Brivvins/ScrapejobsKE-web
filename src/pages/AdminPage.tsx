import { useEffect, useState } from 'react';
import { fetchScrapeLogs, fetchScrapeStatus, fetchScrapeSummary, runScraper } from '../api/admin';
import StatusBadge from '../components/StatusBadge';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { ScrapeLog, ScrapeSourceStatus, ScrapeStatus, ScrapeSummary } from '../types/admin';
import type { Page } from '../types/job';

interface AdminPageProps {
  apiBase: string;
  adminBase: string;
  token: string;
  onLogout: () => void;
}

type LogFilters = {
  source: string;
  status: '' | ScrapeStatus;
  page: number;
  size: number;
};

const statusOptions: ScrapeStatus[] = ['RUNNING', 'PARTIAL', 'SUCCESS', 'FAILED'];

const defaultLogFilters: LogFilters = {
  source: '',
  status: '',
  page: 1,
  size: 20,
};

export default function AdminPage({ apiBase, adminBase, token, onLogout }: AdminPageProps) {
  const [logFilters, setLogFilters] = useState<LogFilters>(defaultLogFilters);
  const [logsPage, setLogsPage] = useState<Page<ScrapeLog> | null>(null);
  const [status, setStatus] = useState<ScrapeSourceStatus[]>([]);
  const [summary, setSummary] = useState<ScrapeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const isAuthenticated = token.trim().length > 0;

  useEffect(() => {
    if (isAuthenticated && logsPage === null && !loading) {
      void loadAdminData(logFilters);
    }
  }, [isAuthenticated]);

  const loadAdminData = async (nextFilters: LogFilters = logFilters) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    try {
      const [logsResponse, statusResponse, summaryResponse] = await Promise.all([
        fetchScrapeLogs(
          adminBase,
          {
            source: nextFilters.source || undefined,
            status: nextFilters.status || undefined,
            page: nextFilters.page,
            size: nextFilters.size,
          },
          token || undefined
        ),
        fetchScrapeStatus(adminBase, token || undefined),
        fetchScrapeSummary(adminBase, token || undefined),
      ]);

      setLogsPage(logsResponse);
      setStatus(statusResponse);
      setSummary(summaryResponse);
      setLogFilters(nextFilters);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admin data.';
      if (message.toLowerCase().includes('forbidden') || message.includes('403')) {
        setError('Session expired or unauthorized. Please sign in again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setLogFilters(defaultLogFilters);
    void loadAdminData(defaultLogFilters);
  };

  const handleRunScraper = async () => {
    setActionMessage(null);
    setError(null);
    try {
      await runScraper(adminBase, token || undefined);
      setActionMessage('Scrape triggered. Refreshing status...');
      await loadAdminData(logFilters);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run scraper.';
      setError(message);
    }
  };

  const logs = logsPage?.content ?? [];
  const hasLogsPage = logsPage !== null;
  const pageNumber = logsPage ? logsPage.number + 1 : logFilters.page;
  const totalPages = logsPage?.totalPages ?? 0;

  return (
    <section className="space-y-5 sm:space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Admin Monitoring</CardTitle>
              <CardDescription>Secure visibility into scrape health and execution logs.</CardDescription>
            </div>
            <Badge className="self-start bg-secondary text-secondary-foreground sm:self-auto">Secure</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Admin controls are restricted to authorized users.</span>
            {isAuthenticated ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      'https://scrapejobske.webredirect.org/swagger-ui/index.html',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  Docs
                </Button>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Sign out
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin access required</CardTitle>
            <CardDescription>Use the Admin access link in the footer to sign in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Once you sign in, this console will load logs, source health, and run controls.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filters & actions</CardTitle>
              <CardDescription>Filter scrape logs and trigger a fresh run.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Log source
                  </label>
                  <Input
                    className="text-base sm:text-sm"
                    value={logFilters.source}
                    onChange={(event) =>
                      setLogFilters({ ...logFilters, source: event.target.value, page: 1 })
                    }
                    placeholder="e.g. BrighterMonday"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </label>
                  <Select
                    className="text-base sm:text-sm"
                    value={logFilters.status}
                    onChange={(event) =>
                      setLogFilters({
                        ...logFilters,
                        status: event.target.value as LogFilters['status'],
                        page: 1,
                      })
                    }
                  >
                    <option value="">Any status</option>
                    {statusOptions.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Page size
                  </label>
                  <Select
                    className="text-base sm:text-sm"
                    value={logFilters.size}
                    onChange={(event) =>
                      setLogFilters({
                        ...logFilters,
                        size: Number(event.target.value),
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
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button className="w-full sm:w-auto" onClick={() => void loadAdminData(logFilters)} disabled={loading}>
                  {loading ? 'Loading...' : 'Load Logs & Status'}
                </Button>
                <Button className="w-full sm:w-auto" variant="secondary" onClick={() => void handleRunScraper()}>
                  Run Scraper
                </Button>
                <Button className="w-full sm:w-auto" variant="outline" onClick={resetFilters} disabled={loading}>
                  Reset
                </Button>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {actionMessage ? <p className="text-sm text-muted-foreground">{actionMessage}</p> : null}
            </CardContent>
          </Card>

          {summary ? (
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Latest run overview across all sources.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Sources', value: summary.totalSources },
                    { label: 'Success', value: summary.successCount },
                    { label: 'Partial', value: summary.partialCount },
                    { label: 'Failed', value: summary.failedCount },
                    { label: 'Running', value: summary.runningCount },
                    { label: 'Latest started', value: summary.latestStartedAt ?? 'N/A' },
                    { label: 'Latest completed', value: summary.latestCompletedAt ?? 'N/A' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border/60 bg-background/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="break-words text-sm font-semibold leading-snug sm:text-base">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Scrape logs</CardTitle>
              <CardDescription>Recent runs with status and counts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {logs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Found</TableHead>
                        <TableHead>Saved</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                        <TableCell className="max-w-[160px] break-words font-medium">{log.source}</TableCell>
                          <TableCell>
                            <StatusBadge status={log.status} />
                          </TableCell>
                          <TableCell>{log.jobsFound ?? 'N/A'}</TableCell>
                          <TableCell>{log.jobsSaved ?? 'N/A'}</TableCell>
                          <TableCell>{log.startedAt ?? 'N/A'}</TableCell>
                          <TableCell>{log.completedAt ?? 'N/A'}</TableCell>
                          <TableCell>{log.responseTimeMs ? `${log.responseTimeMs} ms` : 'N/A'}</TableCell>
                        <TableCell className="max-w-[240px] break-words">{log.errorMessage ?? 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No logs loaded yet.</p>
              )}
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-muted-foreground">
                  Page {pageNumber} of {Math.max(totalPages, 1)}
                </span>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    className="w-full sm:w-auto"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadAdminData({ ...logFilters, page: Math.max(1, pageNumber - 1) })}
                    disabled={loading || !hasLogsPage || pageNumber <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    variant="outline"
                    size="sm"
                    onClick={() => void loadAdminData({ ...logFilters, page: pageNumber + 1 })}
                    disabled={loading || !hasLogsPage || (logsPage?.last ?? false)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source health</CardTitle>
              <CardDescription>Latest status per source.</CardDescription>
            </CardHeader>
            <CardContent>
              {status.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table className="min-w-[760px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Found</TableHead>
                        <TableHead>Saved</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {status.map((item) => (
                        <TableRow key={item.source}>
                        <TableCell className="max-w-[160px] break-words font-medium">{item.source}</TableCell>
                          <TableCell>
                            <StatusBadge status={item.status} />
                          </TableCell>
                          <TableCell>{item.startedAt ?? 'N/A'}</TableCell>
                          <TableCell>{item.completedAt ?? 'N/A'}</TableCell>
                          <TableCell>{item.jobsFound ?? 'N/A'}</TableCell>
                          <TableCell>{item.jobsSaved ?? 'N/A'}</TableCell>
                          <TableCell>{item.responseTimeMs ? `${item.responseTimeMs} ms` : 'N/A'}</TableCell>
                        <TableCell className="max-w-[240px] break-words">{item.errorMessage ?? 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No status data loaded yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
