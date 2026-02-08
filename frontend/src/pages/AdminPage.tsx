import { useState } from 'react';
import { fetchScrapeLogs, fetchScrapeStatus, fetchScrapeSummary, runScraper } from '../api/admin';
import { login } from '../api/auth';
import StatusBadge from '../components/StatusBadge';
import type { AuthResponse, LoginRequest } from '../types/auth';
import type { ScrapeLog, ScrapeSourceStatus, ScrapeStatus, ScrapeSummary } from '../types/admin';
import type { Page } from '../types/job';

interface AdminPageProps {
  apiBase: string;
  adminBase: string;
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

const TOKEN_STORAGE_KEY = 'scrapejobsAdminToken';

export default function AdminPage({ apiBase, adminBase }: AdminPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) ?? '');
  const [logFilters, setLogFilters] = useState<LogFilters>(defaultLogFilters);
  const [logsPage, setLogsPage] = useState<Page<ScrapeLog> | null>(null);
  const [status, setStatus] = useState<ScrapeSourceStatus[]>([]);
  const [summary, setSummary] = useState<ScrapeSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const isAuthenticated = token.trim().length > 0;

  const loadAdminData = async (nextFilters: LogFilters = logFilters) => {
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
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setAuthMessage('Email and password are required.');
      return;
    }

    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const payload: LoginRequest = { email, password };
      const response: AuthResponse = await login(apiBase, payload);
      setToken(response.token);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      setPassword('');
      setAuthMessage('Signed in. You can now load admin data.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate.';
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setLogsPage(null);
    setStatus([]);
    setSummary(null);
    setError(null);
    setAuthMessage(null);
    setActionMessage(null);
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    if (value.trim()) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
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
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Admin Monitoring</h2>
          <p>POST {apiBase}/auth/login | GET {adminBase}/scrape/logs | GET {adminBase}/scrape/status</p>
        </div>
        <p className="status-line">Sign in to view admin data.</p>
      </div>

      {!isAuthenticated ? (
        <>
          <div className="filters">
            <label className="field">
              Admin email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
              />
            </label>
            <label className="field">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>
            <div className="actions">
              <button className="primary" type="button" onClick={() => void handleLogin()}>
                {authLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>

          {authMessage ? <p className="status-line">{authMessage}</p> : null}

          <div className="filters" style={{ marginTop: '16px' }}>
            <label className="field">
              Existing token
              <input
                type="password"
                value={token}
                onChange={(event) => handleTokenChange(event.target.value)}
                placeholder="Paste admin token"
              />
            </label>
          </div>

          <p className="status-line">Admin content is hidden until you sign in.</p>
        </>
      ) : (
        <>
          <div className="filters" style={{ marginTop: '16px' }}>
            <label className="field">
              Session token
              <input
                type="password"
                value={token}
                onChange={(event) => handleTokenChange(event.target.value)}
                placeholder="Stored admin token"
              />
            </label>
            <div className="actions">
              <button className="ghost" type="button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>

          {authMessage ? <p className="status-line">{authMessage}</p> : null}
          {actionMessage ? <p className="status-line">{actionMessage}</p> : null}

          <div className="filters" style={{ marginTop: '16px' }}>
            <label className="field">
              Log source
              <input
                value={logFilters.source}
                onChange={(event) =>
                  setLogFilters({ ...logFilters, source: event.target.value, page: 1 })
                }
                placeholder="e.g. BrighterMonday"
              />
            </label>
            <label className="field">
              Status
              <select
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
              </select>
            </label>
            <label className="field">
              Page size
              <select
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
              </select>
            </label>
            <div className="actions">
              <button className="primary" type="button" onClick={() => void loadAdminData(logFilters)}>
                {loading ? 'Loading...' : 'Load Logs & Status'}
              </button>
              <button className="ghost" type="button" onClick={() => void handleRunScraper()}>
                Run Scraper
              </button>
              <button className="ghost" type="button" onClick={resetFilters} disabled={loading}>
                Reset
              </button>
            </div>
          </div>

          {error ? <p className="status-line">{error}</p> : null}

          {summary ? (
            <div className="panel" style={{ marginTop: '24px' }}>
              <div className="panel-header">
                <div>
                  <h2>Summary</h2>
                  <p>Latest run overview across all sources</p>
                </div>
              </div>
              <div className="summary-grid">
                <div>
                  <p className="eyebrow">Sources</p>
                  <p>{summary.totalSources}</p>
                </div>
                <div>
                  <p className="eyebrow">Success</p>
                  <p>{summary.successCount}</p>
                </div>
                <div>
                  <p className="eyebrow">Partial</p>
                  <p>{summary.partialCount}</p>
                </div>
                <div>
                  <p className="eyebrow">Failed</p>
                  <p>{summary.failedCount}</p>
                </div>
                <div>
                  <p className="eyebrow">Running</p>
                  <p>{summary.runningCount}</p>
                </div>
                <div>
                  <p className="eyebrow">Latest started</p>
                  <p>{summary.latestStartedAt ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="eyebrow">Latest completed</p>
                  <p>{summary.latestCompletedAt ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="panel" style={{ marginTop: '24px' }}>
            <div className="panel-header">
              <div>
                <h2>Scrape Logs</h2>
                <p>Recent runs with status and counts</p>
              </div>
            </div>
            {logs.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Found</th>
                    <th>Saved</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Response</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.source}</td>
                      <td>
                        <StatusBadge status={log.status} />
                      </td>
                      <td>{log.jobsFound ?? 'N/A'}</td>
                      <td>{log.jobsSaved ?? 'N/A'}</td>
                      <td>{log.startedAt ?? 'N/A'}</td>
                      <td>{log.completedAt ?? 'N/A'}</td>
                      <td>{log.responseTimeMs ? `${log.responseTimeMs} ms` : 'N/A'}</td>
                      <td>{log.errorMessage ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="status-line">No logs loaded yet.</p>
            )}
            <div className="actions">
              <button
                className="ghost"
                type="button"
                onClick={() =>
                  void loadAdminData({ ...logFilters, page: Math.max(1, pageNumber - 1) })
                }
                disabled={loading || !hasLogsPage || pageNumber <= 1}
              >
                Previous
              </button>
              <span className="status-line">
                Page {pageNumber} of {Math.max(totalPages, 1)}
              </span>
              <button
                className="ghost"
                type="button"
                onClick={() => void loadAdminData({ ...logFilters, page: pageNumber + 1 })}
                disabled={loading || !hasLogsPage || (logsPage?.last ?? false)}
              >
                Next
              </button>
            </div>
          </div>

          <div className="panel" style={{ marginTop: '24px' }}>
            <div className="panel-header">
              <div>
                <h2>Source Health</h2>
                <p>Latest status per source</p>
              </div>
            </div>
            {status.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Started</th>
                    <th>Completed</th>
                    <th>Found</th>
                    <th>Saved</th>
                    <th>Response</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {status.map((item) => (
                    <tr key={item.source}>
                      <td>{item.source}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td>{item.startedAt ?? 'N/A'}</td>
                      <td>{item.completedAt ?? 'N/A'}</td>
                      <td>{item.jobsFound ?? 'N/A'}</td>
                      <td>{item.jobsSaved ?? 'N/A'}</td>
                      <td>{item.responseTimeMs ? `${item.responseTimeMs} ms` : 'N/A'}</td>
                      <td>{item.errorMessage ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="status-line">No status data loaded yet.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
