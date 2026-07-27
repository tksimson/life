#!/usr/bin/env bash
# Bring the `life` project up: backend (:8000) + frontend (:5173).
# Idempotent. Handles first-run setup. No archeology required — just run it.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
RUN="$ROOT/.run"
mkdir -p "$RUN"

BACKEND_PORT=8000
FRONTEND_PORT=5173

say()  { printf '\033[1;36m%s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }

port_pid() { lsof -ti tcp:"$1" -s tcp:LISTEN 2>/dev/null || true; }

# ---- backend ----
say "Backend setup…"
cd "$BACKEND"
REQ_STAMP=".venv/.reqs-installed"
if [ ! -x ".venv/bin/python" ]; then
  say "  creating venv"
  python3 -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
  touch "$REQ_STAMP"
elif [ ! -f "$REQ_STAMP" ] || [ requirements.txt -nt "$REQ_STAMP" ]; then
  say "  requirements changed, syncing"
  .venv/bin/pip install -q -r requirements.txt
  touch "$REQ_STAMP"
fi
.venv/bin/python manage.py migrate --noinput >/dev/null
.venv/bin/python manage.py seed_local_user >/dev/null 2>&1 || true
ok "backend ready"

# ---- frontend deps ----
say "Frontend setup…"
cd "$FRONTEND"
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  say "  npm install"
  npm install --silent
fi
ok "frontend ready"

# ---- start backend ----
if pid=$(port_pid "$BACKEND_PORT"); [ -n "$pid" ]; then
  ok "backend already running (pid $pid) on :$BACKEND_PORT"
else
  cd "$BACKEND"
  nohup .venv/bin/python manage.py runserver "$BACKEND_PORT" >"$RUN/backend.log" 2>&1 &
  echo $! >"$RUN/backend.pid"
  ok "backend started (pid $(cat "$RUN/backend.pid")) → http://localhost:$BACKEND_PORT"
fi

# ---- start frontend ----
if pid=$(port_pid "$FRONTEND_PORT"); [ -n "$pid" ]; then
  ok "frontend already running (pid $pid) on :$FRONTEND_PORT"
else
  cd "$FRONTEND"
  nohup npm run dev >"$RUN/frontend.log" 2>&1 &
  echo $! >"$RUN/frontend.pid"
  ok "frontend started (pid $(cat "$RUN/frontend.pid"))"
fi

# ---- wait for readiness ----
say "Waiting for servers…"
for _ in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$BACKEND_PORT/api/" 2>/dev/null || true)
  [ "$code" = "200" ] && break
  sleep 0.5
done
for _ in $(seq 1 30); do
  curl -s -o /dev/null "http://localhost:$FRONTEND_PORT/" 2>/dev/null && break
  sleep 0.5
done

echo
ok "life is up"
echo "   App:     http://localhost:$FRONTEND_PORT"
echo "   API:     http://localhost:$BACKEND_PORT/api/"
echo "   Logs:    $RUN/backend.log  |  $RUN/frontend.log"
echo "   Stop:    scripts/down.sh"
