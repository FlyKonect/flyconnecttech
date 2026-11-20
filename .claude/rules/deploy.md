---
paths:
  - ".github/**"
  - "docs/deploy*.md"
  - "backend/app.cjs"
  - "backend/package.json"
  - "frontend/next.config.ts"
  - "frontend/package.json"
  - "backend/.env.example"
  - "backend/src/config/env.ts"
---

## Hosting
cPanel **shared business hosting** (not a VPS), with "Setup Node.js App" and MariaDB 10.11.
- Two Node.js apps: the website on `yourdomain.com`, the backend on `api.yourdomain.com`.
- Never build on the server. GitHub builds both apps and uploads the result.
- Database changes on the server: `prisma migrate deploy` (the deploy runs it). Never `db:migrate` there.
- No Docker, no S3, no Redis, no long-running workers. Scheduled jobs run from cPanel Cron: `node dist/cli/run-job.js <job>` (docs/deploy.md, Step 15).
- The server's default text format is latin1. Create the live database as `utf8mb4`.
- Needs Node.js 22.12 or newer on the server. GitHub builds with the same version (`NODE_VERSION` variable, default 22).

## Deploy
Setup guide for the owner, in plain steps: `docs/deploy.md`. Keep it current when the pipeline changes. Without SSH, both apps go live by hand from File Manager, with one-off commands run through cPanel Cron: `docs/deploy-by-hand.md`. Keep the two guides in step.
- `.github/workflows/ci.yml`: checks for both apps, in parallel jobs: Frontend checks, Browser tests in two shards (`--shard=1/2`, `2/2`, each with its own MariaDB and Mailpit; the Playwright browser is cached), Backend. Runs on pull requests, on pushes to other branches, and before every deploy. On `main` the two Build steps are skipped there because deploy.yml's `build` job builds both apps. Never drop a check to save time.
- `.github/workflows/nightly-browsers.yml`: every night (and by hand), the website and portal browser tests in Safari (WebKit) and on an iPhone. Separate from deploys.
- `.github/workflows/deploy.yml`: on a push to `main`, runs the checks and, at the same time, the `build` job (both apps, packed as artifacts); the `deploy` job needs both, then uploads over SSH (rsync), runs `.github/scripts/remote-backend.sh` on the server (packages only when `package-lock.json` changed, recorded in `.installed-lock`; migrations; restart), then checks `/health` and the home page. Skipped unless the variable `DEPLOY_ENABLED` is `true`. With `DEPLOY_BACKEND` set to `false` it deploys only the website (the guide puts the website live first, then the backend).
- The live hosting is Krystal business hosting (cPanel, SSH on port 722): the website on `flyconnecttech.co.uk`, the backend on `api.flyconnecttech.co.uk`.
- The website is deployed as the Next.js standalone build (`output: "standalone"`), started by `server.js`.
- The backend is started by `backend/app.cjs`: cPanel loads the start file with `require`, which cannot load the ESM app directly.
- On cPanel, `npm install` (the deploy's, or the Run NPM Install button) runs inside the app's Node.js folder (`~/nodevenv/<app root>/<version>/lib`), not in the app folder. So the backend's `postinstall` runs `prisma generate` only where `prisma/schema.prisma` is present: on the server it skips, because `dist` already holds the client. Never make an install script depend on the app's own files.
- A deploy replaces only `dist/` and `prisma/` (backend) and `.next/`, `node_modules/` and `public/` (website). `.env` and `uploads/` on the server are never touched. Keep it that way.
- `prisma` is a normal dependency (not a dev one) so migrations can run on the server.
- Secrets stay in `backend/.env` on the server. GitHub holds only the SSH login. A new backend setting means: add it to `src/config/env.ts`, `.env.example` and Step 12 of `docs/deploy.md`.
- Values the website needs (`NEXT_PUBLIC_*`) are built in at build time from GitHub variables.
