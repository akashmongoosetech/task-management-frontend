# TaskFlow — Task Manager (Frontend)

TaskFlow is a task management web app: create, view, update, filter, search, complete, and delete tasks through a responsive React dashboard backed by an Express REST API and MongoDB. This README documents the **frontend** (`frontend/`) and what it needs from the **backend** (`backend/`).

## 1. What It Does

- Full task lifecycle (CRUD) with title, description, priority (`low | medium | high`), status (`pending | in-progress | completed`), and due date — everything except description is **required**.
- Dashboard stat cards (Total / Pending / In Progress / Completed); clicking a card filters the list.
- Search across title and description (sanitized, max 100 characters), status and priority filters, sorting (`newest | oldest | dueDate | priority`), and filter reset.
- One-click status toggle on each card, edit via a pre-filled modal, delete via a confirmation modal.
- Loading skeletons, distinct empty vs. no-results states, a backend-down error state with retry, toast notifications, and double-submit guards.
- Single-tenant demo app: no login or authentication.

## 2. Technology Stack

**Frontend:** React 19 + TypeScript, Vite 8 (dev server and bundler), Tailwind CSS 4, Axios for HTTP, Lucide icons. Note: `react-router-dom` is installed but unused — the app is a single page with no router.

**Backend (integration reference):** Node.js ESM, Express 4.21, Mongoose 8.9 with MongoDB (plus a `mongodb-memory-server` fallback when no database is reachable), Zod 3 request validation, Helmet/CORS/Morgan.

**Testing:** Vitest + Supertest cover the backend (15 integration tests); the frontend is verified with `tsc --noEmit` type-checking and `vite build` (no frontend component tests exist).

## 3. Frontend Architecture

```
frontend/
├── package.json          # scripts: dev, build, preview, test, lint, clean
├── vite.config.ts        # dev port 5173, @ -> ./src, /api proxy to backend
├── tsconfig.json         # type-check only (noEmit)
├── index.html            # SPA shell, <div id="root">, loads /src/main.tsx
├── .env.example          # FRONTEND_PORT, VITE_PROXY_TARGET, VITE_API_BASE_URL, ...
└── src/
    ├── main.tsx          # entry point: renders <App/> into #root
    ├── App.tsx           # ToastProvider > AppLayout > DashboardPage
    ├── types/task.ts     # Task, TaskInput, TaskFilters, TaskStats, ApiResponse, HealthStatus
    ├── utils/date.ts     # formatDate, toInputDateValue, isOverdue
    ├── services/api.ts   # axios singleton (base URL, 15s timeout, error normalizer)
    ├── services/taskService.ts  # REST wrapper: list, get, create, update,
    │                            # status toggle, delete, stats, health check
    ├── hooks/useTasks.ts # tasks/stats/filters/loading/error state, CRUD, toasts
    ├── context/ToastContext.tsx  # global toasts (success/error/info, 4s auto-dismiss)
    ├── pages/DashboardPage.tsx   # dashboard orchestration, modals, list states
    └── components/
        ├── layout/       # Navbar (brand + New Task button), AppLayout (shell + footer)
        ├── tasks/        # TaskCard, TaskStatsCards, TaskFilterBar,
        │                 # TaskFormModal, TaskDeleteModal
        └── ui/           # Toast, LoadingSkeleton, EmptyState, ErrorState
```

**How it works:** `main.tsx` mounts `App`, which composes the toast provider, layout shell, and dashboard page — there is no router, just one dashboard. `DashboardPage` gets all server state from `useTasks()`, which calls `taskService`, which calls the shared axios client. Mutations show a toast on success or failure and refetch the list. The task form validates locally mirroring the backend rules, and backend 400 field-errors are mapped onto the matching form fields.

## 4. Frontend and Backend Integration

The frontend talks to the backend over JSON with an `{success, message, data}` envelope (the task list additionally carries a `pagination` object with total, page, limit, and total page count). The API base path is configured via `VITE_API_BASE_URL` and defaults to `/api`. During development, Vite proxies `/api` to the backend URL from `VITE_PROXY_TARGET` (default `http://localhost:5000`), so the browser never talks cross-origin in dev; the backend's CORS allowlist covers `FRONTEND_URL` plus the local dev URLs. There are no auth headers or tokens.

The frontend uses the health endpoint for its connectivity probe, the task list endpoint with `search`, `status`, `priority`, `sort`, `page`, and `limit` query parameters for the grid, the stats endpoint for the dashboard counters (falling back to local counts when filters are active), and the create, full-update, status-only-update, and delete endpoints for mutations. Validation failures come back as 400 with per-field errors, unknown IDs as 404, and an unreachable backend surfaces the `ErrorState` card with a retry button after the axios timeout handling kicks in.

## 5. Prerequisites

- Node.js v20 or newer (v22 LTS recommended) with npm v9/v10.
- The backend plus a MongoDB for full functionality: a local `mongod`, a MongoDB Atlas URI, or nothing at all — the backend automatically starts an embedded in-memory MongoDB if `127.0.0.1:27017` is unreachable.
- Frontend-only UI work renders without the backend, but every data call fails into the error state.

## 6. Installation and Setup

```bash
# 1. Backend first (terminal 1)
cd backend
npm install
cp .env.example .env        # defaults work: PORT=5000, FRONTEND_URL=http://localhost:5173
npm run dev                 # http://localhost:5000

# 2. Frontend (terminal 2)
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to the backend)
```

Start the backend first so the dashboard loads data on first paint. (On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.)

## 7. Environment Variables

Frontend (`frontend/.env` — note that Vite `VITE_*` variables are embedded at build time):

| Variable | Purpose | Required? | Default |
|---|---|---|---|
| `VITE_API_BASE_URL` | API prefix used by the axios client | No | `/api` (goes through the dev proxy) |
| `VITE_PROXY_TARGET` | Dev-only proxy target in `vite.config.ts` | No | `http://localhost:5000` |
| `FRONTEND_PORT` | Documents the dev port | No | `5173` |

Backend reference (`backend/.env` — needed to run the full app, not part of the frontend): `PORT` (default `5000`), `NODE_ENV`, `MONGODB_URI` (default `mongodb://127.0.0.1:27017/task-management`), `FRONTEND_URL` (default `http://localhost:5173`). Never commit real connection strings.

## 8. Available Commands

Frontend (run inside `frontend/`): `npm run dev` starts Vite on port 5173; `npm run build` outputs `dist/`; `npm run preview` serves that build on port 5173; `npm run lint` runs `tsc --noEmit`; `npm run test` runs vitest (no frontend tests exist yet); `npm run clean` removes `dist/`.

Backend (run inside `backend/`): `npm start` runs `node server.js`; `npm run dev` runs with file watching; `npm test` runs the 15 Supertest integration tests.

## 9. Main Features and Workflows

- **Create:** the `New Task` button opens `TaskFormModal` (title, priority, status, and due date required with inline errors; description optional) → `POST /tasks` returns 201 → success toast and list refetch.
- **Edit:** a card's edit button opens the same modal pre-filled → `PATCH /tasks/:id` (partial update, at least one field) → toast and refetch.
- **Toggle:** the card checkbox flips `completed ↔ pending` via the status-only endpoint → toast and refetch.
- **Delete:** the trash icon opens a confirmation modal naming the exact task → `DELETE /tasks/:id` → toast and refetch.
- **Filter, search, sort:** the filter bar and clickable stat cards update `useTasks` filters, which refetch the list; backend stats are used when unfiltered, otherwise counts are computed locally from the visible tasks.
- **Failure paths:** 400 responses map onto form fields; network or 5xx failures surface the error card with retry; mutations are disabled while a request is in flight.

Known limitations: no authentication or multi-user isolation; single page with no routing; `react-router-dom`, `motion`, and `zod` are installed but unused in `src/`; search fires a request per keystroke (no debounce); the card toggle only flips between `completed` and `pending` — use Edit to reach `in-progress`.

## 10. Testing and Troubleshooting

- Backend: `cd backend && npm test` runs 15 tests (health, CRUD, 400/404 cases, search/filter/sort, required-field checks) with no external database needed thanks to the embedded fallback.
- Frontend: `npm run lint` for type-checking and `npm run build` for the production bundle. There are no component tests.
- **Empty dashboard?** Start the backend first and check `GET http://localhost:5000/api/health` reports `"database": "connected"`.
- **CORS errors?** The backend `FRONTEND_URL` must match the URL you open (`http://localhost:5173` by default); keep `VITE_API_BASE_URL=/api` so requests flow through the dev proxy.
- **Wrong API host?** Don't point `VITE_API_BASE_URL` directly at port 5000 in dev — that bypasses the proxy and triggers CORS. Set `VITE_PROXY_TARGET` instead, and rebuild after changing any `VITE_*` variable.
- **Stale data?** The list refetches after every mutation and filter change; use the header refresh button or the error card's retry.

## 11. Production Build and Deployment

```bash
cd frontend && npm run build   # outputs dist/
```

Serve `dist/` with any static host and set `VITE_API_BASE_URL` to the backend's public `/api` URL **at build time**. For the backend in production: `NODE_ENV=production`, a real `MONGODB_URI`, then `npm start`. There is no Dockerfile or CI configuration in the repo, so deployment itself is unconfigured.

## 12. Developer Notes

- The `@` → `./src` alias exists in `vite.config.ts`, but all code uses relative imports — keep it that way, since `tsconfig.json` maps `@/*` differently.
- `TaskInput.dueDate` is a `YYYY-MM-DD` string in the form; the backend stores a `Date`. Task `id` is derived from MongoDB `_id` (backfilled for lean query results in the service layer).
- Keep request bodies under 100kb (backend parser limit) and `search` under 100 characters (longer queries are rejected with 400).
