# life — plan & backlog

Lean. One line per item. Newest ideas at the bottom of Backlog.

## Now
- v1 shipped: Django API + React web app, day/week/month/year/decade lines, dark, local single-user.

## Decisions
- Architecture: desktop app = thin client to a **remote** Django API (no bundled local Django). API base URL is config: `localhost:8000` dev, VPS in prod. One source of truth = multi-device sync for free.

## Backlog
- Spin a Hetzner VPS (CX22, ~€4/mo) as shared backend box for my apps.
- VPS: Caddy reverse proxy (auto-HTTPS) in front, apps on subdomains.
- VPS: Postgres + Docker Compose, one stack per app.
- Deploy life's Django API to the VPS; point app at `https://api.<domain>`.
- Multi-user + cloud: flip `LIFE_SINGLE_USER` off, token auth, Postgres.
- Wrap the frontend as a Tauri desktop app pointing at the VPS API.
- Rethink the right-pane (weeks/months/years/decades) layout once lived-in.
- Mobile client (React Native reuses the React work) / PWA install.
