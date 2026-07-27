---
name: up
description: Bring the `life` project up — start backend (:8000) and frontend (:5173), handling first-run setup. Use when the user says "up", "start life", "get life running", "boot it".
---

# up

Run this one command from the repo root. It is idempotent and handles first-run
setup (venv, pip install, npm install, migrate, seed) automatically.

```bash
scripts/up.sh
```

Then tell the user the app is at http://localhost:5173. Do no archeology — the
script does everything. If it fails, show the tail of `.run/backend.log` or
`.run/frontend.log`.
