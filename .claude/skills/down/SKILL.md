---
name: down
description: Bring the `life` project down — stop the backend (:8000) and frontend (:5173) dev servers. Use when the user says "down", "stop life", "shut it down", "kill the servers".
---

# down

Run this one command from the repo root. Safe anytime.

```bash
scripts/down.sh
```

It stops both servers by saved PID and sweeps the ports to catch stray child
processes. Then confirm to the user that life is down.
