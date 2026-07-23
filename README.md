# life

One line a day. And per week, month, year, decade. A minimalist life journal.

Local single-user for now, but API-first so the same backend later serves cloud +
web/mobile/desktop clients with no data-model rewrite.

## Stack

- **Backend:** Django 6.0 + Django REST Framework, SQLite (→ Postgres in the cloud later).
- **Frontend:** React 19 + TypeScript + Vite, Tailwind CSS v4, Framer Motion, TanStack Query.

## Run it (two terminals)

**Backend** (port 8000):

```bash
cd backend
python -m venv .venv                 # first time only
.venv/bin/pip install -r requirements.txt   # first time only
.venv/bin/python manage.py migrate          # first time only
.venv/bin/python manage.py seed_local_user  # first time only
.venv/bin/python manage.py runserver 8000
```

**Frontend** (port 5173, proxies `/api` to the backend):

```bash
cd frontend
npm install          # first time only
npm run dev
```

Open http://localhost:5173 — first run asks for your name + birth date, then shows the journal.

## Tests

```bash
cd backend && .venv/bin/python manage.py test core
```

## How it's structured

- `backend/core/models.py` — `Profile` and `Entry`. Each entry is one slot, unique per
  `(user, scale, anchor_date)`.
- `backend/core/utils.py` — `anchor_for(scale, date)` normalizes any date to the canonical
  first day of its period (Monday for weeks, 1st for months, etc.), so edits upsert cleanly.
- `backend/core/auth.py` — single-user local mode. To go multi-user: set `LIFE_SINGLE_USER = False`
  in settings, swap the auth class for `TokenAuthentication`, add login/signup. Nothing else changes;
  every query is already scoped to the request user.
- `frontend/src/` — `api/` (typed client), `hooks/` (TanStack Query), `lib/dates.ts` (period math,
  mirrors the backend), `components/` (`DayColumn` left, `ScalePanels` right, `EntryLine` shared).

## API

- `GET/PUT /api/profile/` — name + birth date.
- `GET /api/entries/?scale=day&from=&to=` — list entries for a scale.
- `POST /api/entries/` — `{scale, date, text}`; upserts on the slot. Empty text clears it.
- `PATCH/DELETE /api/entries/{id}/`.
