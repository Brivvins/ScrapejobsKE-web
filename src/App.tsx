import { useEffect, useState } from 'react';
import { login } from './api/auth';
import ThemeToggle from './components/ThemeToggle';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Separator } from './components/ui/separator';
import { cn } from './lib/utils';
import AdminPage from './pages/AdminPage';
import JobsPage from './pages/JobsPage';
import type { AuthResponse, LoginRequest } from './types/auth';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';
const ADMIN_BASE = import.meta.env.VITE_ADMIN_BASE ?? '/api/admin/v1';

type ViewMode = 'jobs' | 'admin';

const HIGHLIGHTS = [
  { label: 'Live API', value: 'scrapejobske.webredirect.org' },
  { label: 'Update cadence', value: 'Daily scrape at 06:00 EAT' },
  { label: 'Sources', value: '1 active · more coming' },
];

export default function App() {
  const [view, setView] = useState<ViewMode>('jobs');
  const [token, setToken] = useState(() => sessionStorage.getItem('scrapejobsAdminToken') ?? '');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const openAdmin = () => {
    if (token) {
      setView('admin');
      return;
    }
    setAuthMessage(null);
    setAdminModalOpen(true);
  };

  const handleLogin = async () => {
    if (!adminEmail || !adminPassword) {
      setAuthMessage('Email and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);
    try {
      const payload: LoginRequest = { email: adminEmail, password: adminPassword };
      const response: AuthResponse = await login(API_BASE, payload);
      setToken(response.token);
      sessionStorage.setItem('scrapejobsAdminToken', response.token);
      setAdminPassword('');
      setAdminModalOpen(false);
      setView('admin');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to authenticate.';
      setAuthMessage(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    sessionStorage.removeItem('scrapejobsAdminToken');
    setView('jobs');
  };

  return (
    <div className="relative">
      <div className="container mx-auto flex min-h-screen flex-col gap-8 px-4 pb-10 pt-6 sm:gap-10 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        <header className="flex flex-col gap-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-5 text-center sm:text-left">
              <Badge className="mx-auto w-fit bg-primary/10 text-primary sm:mx-0">ScrapejobsKE</Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Kenyan jobs, unified into a developer-first API.
                </h1>
                <p className="text-base text-muted-foreground sm:text-lg">
                  ScrapejobsKE aggregates listings from trusted local sources and exposes them through
                  a clean API that powers job boards, alerts, and hiring analytics.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              {view === 'admin' ? (
                <Button variant="outline" size="sm" onClick={() => setView('jobs')}>
                  Back to jobs
                </Button>
              ) : null}
              <ThemeToggle
                theme={theme}
                onToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              />
            </div>
          </div>

          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:grid sm:snap-none sm:gap-4 sm:overflow-visible sm:px-0 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <Card
                key={item.label}
                className="min-w-[220px] snap-start border-border/70 bg-background/70 sm:min-w-0"
              >
                <CardContent className="flex flex-col gap-2 p-4 sm:p-6">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="break-words text-sm font-semibold leading-snug sm:text-base">
                    {item.value}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </header>

        <main className="space-y-6">
          {view === 'jobs' || !token ? (
            <JobsPage apiBase={API_BASE} />
          ) : (
            <AdminPage apiBase={API_BASE} adminBase={ADMIN_BASE} token={token} onLogout={handleLogout} />
          )}
        </main>

        <footer className="mt-auto space-y-4 text-sm text-muted-foreground">
          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs uppercase tracking-[0.2em] sm:w-auto"
                onClick={view === 'admin' ? () => setView('jobs') : openAdmin}
              >
                {view === 'admin' ? 'Exit admin' : 'Admin access'}
              </Button>
            </div>
          </div>
        </footer>
      </div>

      {adminModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setAdminModalOpen(false)}
            aria-hidden="true"
          />
          <Card className="relative z-10 w-full max-w-md border-border/70 bg-background/95">
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Admin sign in</h2>
                  <p className="text-sm text-muted-foreground">
                    Access operational dashboards for ScrapejobsKE.
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAdminModalOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    className="text-base sm:text-sm"
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Password
                  </label>
                  <Input
                    type="password"
                    className="text-base sm:text-sm"
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </div>
                {authMessage ? <p className="text-sm text-destructive">{authMessage}</p> : null}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button className="w-full sm:w-auto" onClick={() => void handleLogin()} disabled={authLoading}>
                    {authLoading ? 'Signing in...' : 'Sign in'}
                  </Button>
                  <Button className="w-full sm:w-auto" variant="outline" onClick={() => setAdminModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
