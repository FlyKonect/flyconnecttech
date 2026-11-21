# Load test

A quick way to see how the backend holds up when many people use it at once. It runs on **your own computer only**: the script refuses any address that is not `localhost`. Never point it at the live site.

## Run it

1. Start the database: `docker compose up -d` (in the top folder).
2. In `backend/`, build and start a separate copy with the request limits off. Otherwise you measure the limits, not the app:

   ```
   npm run build
   PORT=4200 RATE_LIMITS=false BACKEND_URL=http://localhost:4200 node dist/main.js
   ```

3. In a second terminal, in `backend/`:

   ```
   LOAD_URL=http://127.0.0.1:4200 npm run load-test
   ```

   To include a signed-in page ("My requests"), add a local customer's sign-in, for example the sample customer that `npm run db:sample` prints:

   ```
   LOAD_URL=http://127.0.0.1:4200 LOAD_EMAIL=... LOAD_PASSWORD=... npm run load-test
   ```

Options: `LOAD_CONNECTIONS` (visitors at once, default 20) and `LOAD_SECONDS` (per step, default 10). Stop the copy with Ctrl+C when done.

## First results (21 November 2026)

On the development PC (Windows, MariaDB in Docker), one backend process:

| Step | Requests a second | Median, 1 visitor | Median, 20 at once |
|---|---|---|---|
| Health check | about 114 | 8 ms | 176 ms |
| Website content (public) | about 37 | 27 ms | 529 ms |
| Demo times (public) | about 110 | 8 ms | 176 ms |
| My requests, signed in (a customer with many requests) | about 16 | 60 ms | 1.2 s |

**What it means:**
- The throughput stays the same with 1 visitor or 20, so the limit is the one Node.js process's processor time per request (the database answers in about 3 ms). With more people at once, requests wait their turn.
- For a support portal with tens of clients and a small team this is plenty: even 16 signed-in pages a second is far more than such a team and its clients send.
- If it ever gets busy, the first steps are cPanel's setting to run more than one app process and a faster plan, then a small VPS (see the audit, Phase 4).
- The live server's numbers will differ (Linux, the database on the same machine). To measure there, use a staging copy, never the live site.
