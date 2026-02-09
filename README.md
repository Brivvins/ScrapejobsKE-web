# ScrapejobsKE Web

ScrapejobsKE Web is the lightweight UI for exploring Kenyan job listings and
accessing the ScrapejobsKE admin console. It is designed to sit on top of the
public API and showcase production readiness without extra frontend bloat.

## Live API
```
https://scrapejobske.webredirect.org
```

## Production UI
```
https://scrapejobs-ke-web.vercel.app
```

## Environment
Production builds use:
```
VITE_API_BASE=https://scrapejobske.webredirect.org/api/v1
VITE_ADMIN_BASE=https://scrapejobske.webredirect.org/api/admin/v1
```

## Local development
```
npm install
npm run dev
```

Vite proxies `/api` and `/admin` to the backend during local development.

## Admin access
Admin access is protected by JWT and only surfaced through the sign-in modal.
The UI never displays tokens, and the backend enforces role-based access.
