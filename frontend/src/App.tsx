import { useState } from 'react';
import AdminPage from './pages/AdminPage';
import JobsPage from './pages/JobsPage';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';
const ADMIN_BASE = import.meta.env.VITE_ADMIN_BASE ?? '/api/admin/v1';

type ViewMode = 'jobs' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewMode>('jobs');

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Scrapejobs</p>
          <h1>Job Search and Scrape Monitor</h1>
          <p className="subtitle">Minimal frontend for the Spring Boot API.</p>
        </div>
        <div className="header-actions">
          {view === 'admin' ? (
            <button className="ghost" onClick={() => setView('jobs')} type="button">
              Back to Jobs
            </button>
          ) : null}
          {view === 'jobs' ? (
            <button className="ghost admin-button" onClick={() => setView('admin')} type="button">
              Admin
            </button>
          ) : null}
        </div>
      </header>

      <main className="app-main">
        {view === 'jobs' ? (
          <JobsPage apiBase={API_BASE} />
        ) : (
          <AdminPage apiBase={API_BASE} adminBase={ADMIN_BASE} />
        )}
      </main>

      <footer className="app-footer">
        <span>API base: {API_BASE}</span>
        <span>Admin base: {ADMIN_BASE}</span>
      </footer>
    </div>
  );
}
