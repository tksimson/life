#!/usr/bin/env bash
# Bring the `life` project down: stop backend (:8000) + frontend (:5173).
# Safe to run anytime. Kills by saved PID, falls back to port.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN="$ROOT/.run"

ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*"; }

kill_port() {
  local name="$1" port="$2"
  local pids
  pids=$(lsof -ti tcp:"$port" -s tcp:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    # kill the listeners and their process groups (dev servers spawn children)
    for p in $pids; do kill "$p" 2>/dev/null || true; done
    sleep 1
    pids=$(lsof -ti tcp:"$port" -s tcp:LISTEN 2>/dev/null || true)
    [ -n "$pids" ] && for p in $pids; do kill -9 "$p" 2>/dev/null || true; done
    ok "$name stopped (:$port)"
  else
    warn "$name not running (:$port)"
  fi
}

# Kill tracked pids (and their groups) first, then sweep by port to catch children.
for svc in backend frontend; do
  f="$RUN/$svc.pid"
  if [ -f "$f" ]; then
    pid=$(cat "$f" 2>/dev/null || true)
    [ -n "${pid:-}" ] && kill -- "-$pid" 2>/dev/null || kill "$pid" 2>/dev/null || true
    rm -f "$f"
  fi
done

kill_port backend 8000
kill_port frontend 5173

ok "life is down"
