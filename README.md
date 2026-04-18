# Budget App

Full-stack personal budgeting application: accounts, categories, transactions (including transfers), budgets, recurring rules, reports, and CSV/JSON exports. The API uses **Laravel Sanctum** with **session cookies** and CSRF for a first-party SPA.

## Table of contents

- [Architecture](#architecture)
- [Requirements](#requirements)
- [Repository layout](#repository-layout)
- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Production deployment](#production-deployment)
- [Scheduled tasks](#scheduled-tasks)
- [HTTP API reference](#http-api-reference)
- [Frontend notes](#frontend-notes)
- [Testing](#testing)

## Architecture

| Layer | Technology |
|--------|------------|
| API | Laravel 13, PHP 8.3+, Laravel Sanctum (stateful SPA / session) |
| Database | MySQL (configurable; see `backend/.env.example`) |
| SPA | React 19, TypeScript, Vite 8, React Router 7, TanStack Query, Tailwind CSS |

**Recommended production shape:** same HTTPS origin for API and UI (for example `https://example.com/api/...` and `https://example.com/app/...`). The production build is emitted to `backend/public/app` and served under the `/app` path. Session cookies and Sanctum work most reliably when the browser sees a single site.

## Requirements

- PHP 8.3+ with extensions required by Laravel
- Composer
- Node.js 20+ (or current LTS) and npm
- MySQL (or adjust `DB_*` in `.env`)

## Repository layout

```
budget-app/
├── backend/          # Laravel API + web routes (SPA fallback, public assets)
│   ├── app/
│   ├── routes/       # api.php, web.php, console.php
│   ├── public/app/   # Production SPA build output (gitignored; created by `npm run build` in frontend)
│   └── ...
├── frontend/         # Vite + React SPA
│   └── src/
└── README.md
```

## Local development

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Create the MySQL database (default name in `.env.example` is `budget_app`), then:

```bash
php artisan migrate
```

Start the API (example):

```bash
php artisan serve
```

Default in docs: `http://127.0.0.1:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or `http://127.0.0.1:5173`). Vite proxies `/api` and `/sanctum` to the Laravel server (`VITE_DEV_API_PROXY` overrides the target; default `http://127.0.0.1:8000`).

### 3. Login / CSRF flow

The SPA calls `GET /sanctum/csrf-cookie` before `POST /api/login` or `POST /api/register`, and uses `fetch` with `credentials: 'include'` so session cookies are sent. Ensure `SANCTUM_STATEFUL_DOMAINS` and `FRONTEND_URL` match your dev URLs (see below).

## Environment variables

Copy `backend/.env.example` to `backend/.env` and adjust.

| Variable | Purpose |
|----------|---------|
| `APP_URL` | Public URL of the Laravel app (scheme + host + port if non-default). |
| `FRONTEND_URL` | Browser **Origin** for CORS (no path), e.g. `http://127.0.0.1:5173` in dev or `https://example.com` in production. |
| `SANCTUM_STATEFUL_DOMAINS` | Comma-separated hosts (and ports in dev) that may receive session cookies for the API, e.g. `127.0.0.1:5173`, `example.com`. |
| `SESSION_DRIVER` | `database` in `.env.example` (requires session table migration). |
| `SESSION_SECURE_COOKIE` | Set `true` in production when using HTTPS. |

CORS is configured in `backend/config/cors.php` (paths `api/*`, `sanctum/csrf-cookie`, credentials enabled).

## Production deployment

1. Set `APP_ENV=production`, `APP_DEBUG=false`, and production `APP_URL` / database credentials.
2. Set `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS` to your real public host (no `/app` suffix in `FRONTEND_URL`).
3. Run migrations: `php artisan migrate --force`
4. Build the SPA from the **frontend** directory:

   ```bash
   cd frontend
   npm ci
   npm run build
   ```

   Output goes to `backend/public/app`. The `public/app` directory is gitignored; rebuild on each release.

5. Point the web server document root at `backend/public`.
6. If `public/app/index.html` exists, `GET /` redirects to `/app/`; otherwise the default Laravel welcome view is shown.

The application forces HTTPS URLs in production (`AppServiceProvider`) and trusts proxies globally (`bootstrap/app.php`) so it behaves correctly behind common load balancers; tighten `trustProxies` if your host documents specific proxy IPs.

### Scheduler (required for recurring transactions)

Recurring transaction generation is scheduled daily. On the server, add a cron entry:

```cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

Or run `php artisan schedule:work` in a supervised long-lived process.

## Scheduled tasks

| Task | Schedule |
|------|----------|
| `recurring:generate` | Daily at `00:10` (see `bootstrap/app.php`) |

## HTTP API reference

Base path: `/api`. JSON request bodies use `Content-Type: application/json` unless noted.

**Authentication:** Session cookie + CSRF (Sanctum stateful). Unauthenticated clients must call `GET /sanctum/csrf-cookie` before the first `POST` that mutates state.

**Rate limiting:** `POST /api/register` and `POST /api/login` use the `auth` limiter (10 requests per minute per IP).

### Public routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Register; logs the user in. |
| POST | `/api/login` | Login. |

### Authenticated routes (`auth:sanctum`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/logout` | Logout and invalidate session. |
| GET | `/api/me` | Current user. |
| GET, POST, PUT/PATCH, DELETE | `/api/accounts`, `/api/accounts/{id}` | Accounts CRUD. |
| GET, POST, PUT/PATCH, DELETE | `/api/categories`, `/api/categories/{id}` | Categories CRUD. |
| GET, POST, PUT/PATCH, DELETE | `/api/transactions`, `/api/transactions/{id}` | Transactions CRUD. |
| POST | `/api/transactions/transfer` | Transfer between accounts. |
| GET, POST, PUT/PATCH, DELETE | `/api/budgets`, `/api/budgets/{id}` | Budgets (no `show` route). |
| GET, POST, PUT/PATCH, DELETE | `/api/recurring-transactions`, `/api/recurring-transactions/{id}` | Recurring rules CRUD. |
| GET | `/api/reports/summary` | Summary (query params per controller). |
| GET | `/api/reports/category-breakdown` | Spending by category. |
| GET | `/api/reports/account-balances` | Balances. |
| GET | `/api/reports/statement` | Statement. |
| POST | `/api/exports/csv` | CSV export. |
| POST | `/api/exports/json` | JSON export. |

For exact query parameters and payloads, inspect `backend/app/Http/Controllers/Api/` and Form Request classes.

## Frontend notes

- **API client:** Native `fetch` via `frontend/src/lib/api.ts` (`apiFetch`, `apiUrl`), not axios.
- **Production base path:** Vite uses `base: '/app/'` in production so assets and client routes live under `/app`.
- **Optional split API host:** Set `VITE_API_BASE_URL` at build time if the API is on another origin; you must align CORS, cookies, and Sanctum domains accordingly (same-domain is recommended).

## Testing

```bash
cd backend
php artisan test
```

The suite is minimal; add feature tests for auth and critical flows as the product matures.

## License

See `backend/composer.json` (Laravel skeleton is MIT). Add or adjust a project-wide license if you redistribute the app.
